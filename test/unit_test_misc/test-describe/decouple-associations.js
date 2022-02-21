module.exports.belongsTo_resolver = `
/**
 * dog.prototype.researcher - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.researcher = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.researcherId)) {
        if (search === undefined || search === null) {
            return resolvers.readOneResearcher({
                [models.researcher.idAttribute()]: this.researcherId
            }, context)
        } else {
            //build new search filter
            let nsearch = helper.addSearchField({
                "search": search,
                "field": models.researcher.idAttribute(),
                "value": this.researcherId,
                "operator": "eq"
            });
            let found = (await resolvers.researchersConnection({
                search: nsearch,
                pagination: {first: 1}
            }, context)).edges;
            if (found.length > 0) {
                return found[0].node
            }
            return found;
        }
    }
}
`;

module.exports.belongsTo_model = `
static async add_researcherId(id, researcherId, benignErrorReporter) {
    try {
        let updated = await dog.update({
            researcherId: researcherId
        }, {
            where: {
                id: id
            }
        });
        return updated[0];
    } catch (error) {
        benignErrorReporter.push({
            message: error
        });
    }
}
`;

module.exports.hasOne_resolver = `
/**
 * researcher.prototype.dog - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
researcher.prototype.dog = async function({
    search
}, context) {
      //build new search filter
      let nsearch = helper.addSearchField({
          "search": search,
          "field": "researcherId",
          "value": this.getIdValue(),
          "operator": "eq"
      });

      let found = (await resolvers.dogsConnection({
          search: nsearch,
          pagination: {first: 2}
      }, context)).edges;
      if(found.length > 0){
          if(found.length > 1){
              context.benignErrors.push(new Error(
                \`Not unique "to_one" association Error: Found > 1 dogs matching researcher with id \${this.getIdValue()}. Consider making this a "to_many" association, or using unique constraints, or moving the foreign key into the Researcher model. Returning first Dog.\`
              ));
          }
          return found[0].node;
      }
      return null;
}
`;

module.exports.belongsTo_schema = `
  researcher(search: searchResearcherInput) : Researcher
`;

module.exports.hasOne_schema = `
  dog(search: searchDogInput): Dog

`;

module.exports.hasMany_model = `
static associate(models) {

        individual.hasMany(models.transcript_count, {
            as: 'transcript_counts',
            foreignKey: 'individual_id'
        });
    }
`;

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
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "individual_id",
        "value": this.getIdValue(),
        "operator": "eq"
    });

    return resolvers.transcript_counts({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}
`;
module.exports.countAssociated_model = `
static async countRecords(search) {
    let options = {}
    options['where'] = helper.searchConditionsToSequelize(search, individual.definition.attributes);
    return super.count(options);
}
`;

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
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "individual_id",
        "value": this.getIdValue(),
        "operator": "eq"
    });

    return resolvers.countTranscript_counts({
        search: nsearch
    }, context);
}
`;

module.exports.belongsToMany_model = `
AuthorsFilterImpl({
        search,
        order,
        pagination
    }) {
      // build the sequelize options object for limit-offset-based pagination
      let options = helper.buildLimitOffsetSequelizeOptions(search, order, pagination, models.person.idAttribute(), models.person.definition.attributes);  
      return this.getAuthors(options);
    }
`;
module.exports.belongsToMany_model_count = `
countFilteredAuthorsImpl({
      search
  }) {
    let options = {}
    options['where'] = helper.searchConditionsToSequelize(search);
    return this.countAuthors(options);
  }
`;

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
book.prototype.AuthorsFilter = async function({
    search,
    order,
    pagination
}, context) {
      if (await checkAuthorization(context, 'Person', 'read') === true) {
            helper.checkCountAndReduceRecordsLimit(pagination.limit, context, "AuthorsFilter");
            return this.AuthorsFilterImpl({
                search,
                order,
                pagination
            });
        } else {
            throw new Error("You don't have authorization to perform this action");
        }

}
`;

module.exports.belongsToMany_resolver_count = `
/**
 * book.prototype.countFilteredAuthors - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
book.prototype.countFilteredAuthors = async function({
    search
}, context) {
  if (await checkAuthorization(context, 'Person', 'read') === true) {
            return this.countFilteredAuthorsImpl({
                search
            });
        } else {
            throw new Error("You don't have authorization to perform this action");
        }

}
`;
