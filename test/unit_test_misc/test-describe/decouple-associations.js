module.exports.belongsTo_resolver  = `

/**
 * dog.prototype.researcher - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.researcher = function({search }, context) {
    return this.researcherImpl(search);
}
`

module.exports.belongsTo_model = `
researcherImpl(search){
 if(search === undefined){
   return models.researcher.readById( this.researcherId );
 }else{
   let id_search = {
       "field": "id",
       "value": {
         "value": this.researcherId
       },
       "operator": "eq"
   }

   let ext_search = {
     "operator": "and",
     "search": [id_search, search]
   }

   return models.researcher.readAll(ext_search)
   .then( found =>{
       if(found){
         return found[0]
       }
       return found;
   });
 }
}
`

module.exports.hasOne_resolver = `
/**
 * researcher.prototype.dog - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
researcher.prototype.dog = function({search}, context) {
   return this.dogImpl(search);
}

`
module.exports.hasOne_model = `
dogImpl(search){

  let simple_search = {
        "field": "researcherId",
        "value": {
        "value": this.researcherId
          },
        "operator": "eq"
      }
  let ext_search = simple_search;

  if(search !== undefined){
    ext_search = {
      "operator": "and",
      "search": [simple_search, search]
    }
  }

  return models.dog.readAll(ext_search)
  .then(found =>{ if(found){
    return found[0];
  }
    return found;
  })

}

`

module.exports.belongsTo_schema = `
  researcher(search: searchResearcherInput) : Researcher
`

module.exports.hasOne_schema = `
  dog(search: searchDogInput): Dog

`

module.exports.hasMany_model = `
transcript_countsFilterImpl({
    search,
    order,
    pagination
}){

  if (search === undefined) {
      return models.transcript_count.readAll( {
              "field": "individual_id",
              "value": {
                  "value": this.individual_id
              },
              "operator": "eq"
          },
          order,
          pagination);
  } else {
      return models.transcript_count.readAll({
              "operator": "and",
              "search": [{
                  "field": "individual_id",
                  "value": {
                      "value": this.individual_id
                  },
                  "operator": "eq"
              }, search]
          },
          order,
          pagination)
  }
}
`

module.exports.hasMany_resolver = `
/**
 * individual.prototype.transcript_countsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
individual.prototype.transcript_countsFilter = function({
    search,
    order,
    pagination
}, context) {
  return this.transcript_countsFilterImpl({search, order, pagination});
}
`
module.exports.countAssociated_model = `
countFilteredTranscript_countsImpl({search}){
  if (search === undefined) {
      return models.transcript_count.countRecords( {
              "field": "individual_id",
              "value": {
                  "value": this.individual_id
              },
              "operator": "eq"
          });
  } else {
      return models.transcript_count.countRecords({
              "operator": "and",
              "search": [{
                  "field": "individual_id",
                  "value": {
                      "value": this.individual_id
                  },
                  "operator": "eq"
              }, search]
          })
  }

}
`

module.exports.countAssociated_resolver = `
/**
 * individual.prototype.countFilteredTranscript_counts - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
individual.prototype.countFilteredTranscript_counts = function({
    search
}, context) {

return this.countFilteredTranscript_countsImpl({search});
}
`

module.exports.belongsToMany_model = `
AuthorsFilterImpl({
      search,
      order,
      pagination
  }) {
      let options = {};

      if (search !== undefined) {
          let arg = new searchArg(search);
          let arg_sequelize = arg.toSequelize();
          options['where'] = arg_sequelize;
      }

      return this.countAuthors(options).then(items => {
          if (order !== undefined) {
              options['order'] = order.map((orderItem) => {
                  return [orderItem.field, orderItem.order];
              });
          } else if (pagination !== undefined) {
              options['order'] = [
                  ["id", "ASC"]
              ];
          }

          if (pagination !== undefined) {
              options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
              options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
          } else {
              options['offset'] = 0;
              options['limit'] = items;
          }

          if (globals.LIMIT_RECORDS < options['limit']) {
              throw new Error(\`Request of total authorsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
          }
          return this.getAuthors(options);
      });
  }
`
module.exports.belongsToMany_model_count = `
countFilteredAuthorsImpl({
      search
  }) {

      let options = {};

      if (search !== undefined) {
          let arg = new searchArg(search);
          let arg_sequelize = arg.toSequelize();
          options['where'] = arg_sequelize;
      }

      return this.countAuthors(options);
  }
`

module.exports.belongsToMany_resolver = `
/**
 * book.prototype.AuthorsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
book.prototype.AuthorsFilter = function({
    search,
    order,
    pagination
}, context) {

  return this.AuthorsFilterImpl({search, order, pagination});
}
`

module.exports.belongsToMany_resolver_count = `
/**
 * book.prototype.countFilteredAuthors - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
book.prototype.countFilteredAuthors = function({
    search
}, context) {

 return this.countFilteredAuthorsImpl({search});
}
`
