module.exports.belongsTo_resolver  = `
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
        if (search === undefined) {
            return resolvers.readOneResearcher({
                [models.researcher.idAttribute()]: this.researcherId
            }, context)
        } else {
            //build new search filter
            let nsearch = helper.addSearchField({
                "search": search,
                "field": models.researcher.idAttribute(),
                "value": {
                    "value": this.researcherId
                },
                "operator": "eq"
            });
            let found = await resolvers.researchers({
                search: nsearch
            }, context);
            if (found) {
                return found[0]
            }
            return found;
        }
    }
}
`

module.exports.belongsTo_model = `
static async add_researcherId(id, researcherId) {
  let updated = await Dog.update({
      researcherId: researcherId
  }, {
      where: {
          id: id
      }
  });
  return updated;
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
researcher.prototype.dog = async function({
    search
}, context) {
      //build new search filter
      let nsearch = helper.addSearchField({
          "search": search,
          "field": "researcherId",
          "value": {
              "value": this.getIdValue()
          },
          "operator": "eq"
      });

      let found = await resolvers.dogs({
          search: nsearch
      }, context);
      if(found){
          if(found.length > 1){
              let foundIds = [];
              found.forEach(dog => {
                  foundIds.push(dog.getIdValue())
              })
              context.benignErrors.push(new Error(
                  \`Not unique "to_one" association Error: Found \${found.length} dogs matching researcher with id \${this.getIdValue()}. Consider making this association a "to_many", using unique constraints, or moving the foreign key into the Researcher model. Returning first Dog. Found Dogs \${models.dog.idAttribute()}s: [\${foundIds.toString()}]\`
              ));
          }
          return found[0];
      }
      return found;
}
`

module.exports.belongsTo_schema = `
  researcher(search: searchResearcherInput) : Researcher
`

module.exports.hasOne_schema = `
  dog(search: searchDogInput): Dog

`

module.exports.hasMany_model = `
static associate(models) {

        individual.hasMany(models.transcript_count, {
            as: 'transcript_counts',
            foreignKey: 'individual_id'
        });
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
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "individual_id",
        "value": {
            "value": this.getIdValue()
        },
        "operator": "eq"
    });

    return resolvers.transcript_counts({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}
`
module.exports.countAssociated_model = `
static async countRecords(search) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
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
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "individual_id",
        "value": {
            "value": this.getIdValue()
        },
        "operator": "eq"
    });

    return resolvers.countTranscript_counts({
        search: nsearch
    }, context);
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
                    [models.person.idAttribute(), "ASC"]
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
book.prototype.AuthorsFilter = async function({
    search,
    order,
    pagination
}, context) {
    if (await checkAuthorization(context, 'Person', 'read') === true) {
        await checkCountAndReduceRecordsLimit(search, context, 'AuthorsFilter', false, 'person');
        return this.AuthorsFilterImpl({
            search,
            order,
            pagination
        });
    } else {
        throw new Error("You don't have authorization to perform this action");
    }
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
`
