module.exports.url_regex = `
const iriRegex = new RegExp('peopleLocal');
`

module.exports.constructor = `
static init(sequelize, DataTypes) {
    return super.init({

        internalPersonId: {
            type: Sequelize[dict['String']],
            primaryKey: true
        },
        firstName: {
            type: Sequelize[dict['String']]
        },
        lastName: {
            type: Sequelize[dict['String']]
        },
        email: {
            type: Sequelize[dict['String']]
        },
        companyId: {
            type: Sequelize[dict['Int']]
        }


    }, {
        modelName: "person",
        tableName: "people",
        sequelize
    });
}
`

module.exports.recognizeId = `
static recognizeId(iri) {
    return iriRegex.test(iri);
}
`

module.exports.readById = `
static readById(id) {
    let options = {};
    options['where'] = {};
    options['where'][this.idAttribute()] = id;
    return peopleLocalSql.findOne(options);
}
`


module.exports.addOne = `
static addOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
        .then(async (valSuccess) => {
            try {

                const result = await sequelize.transaction(async (t) => {
                    let item = await super.create(input, {
                        transaction: t
                    });
                    let promises_associations = [];

                    return Promise.all(promises_associations).then(() => {
                        return item
                    });
                });

                if (input.addWorks) {
                    let wrong_ids = await helper.checkExistence(input.addWorks, models.book);
                    if (wrong_ids.length > 0) {
                        throw new Error(\`Ids: \${wrong_ids.join(",")} in model book were not found.\`);
                    } else {
                        await result._addWorks(input.addWorks);
                    }
                }

                return result;
            } catch (error) {
                throw error;
            }
        });
}`

module.exports.count = `
static countRecords(search) {
  let options = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }
  return super.count(options);
}
`
module.exports.readAllCursor = `
static readAllCursor(search, order, pagination) {
  //check valid pagination arguments
  let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
  if (!argsValid) {
      throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
  }

  let isForwardPagination = !pagination || !(pagination.last != undefined);
  let options = {};
  options['where'] = {};

  /*
   * Search conditions
   */
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }

  /*
   * Count
   */
  return super.count(options).then(countA => {
      options['offset'] = 0;
      options['order'] = [];
      options['limit'] = countA;
      /*
       * Order conditions
       */
      if (order !== undefined) {
          options['order'] = order.map((orderItem) => {
              return [orderItem.field, orderItem.order];
          });
      }
      if (!options['order'].map(orderItem => {
              return orderItem[0]
          }).includes("internalPersonId")) {
          options['order'] = [...options['order'], ...[
              ["internalPersonId", "ASC"]
          ]];
      }

      /*
       * Pagination conditions
       */
      if (pagination) {
          //forward
          if (isForwardPagination) {
              if (pagination.after) {
                  let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                  options['where'] = {
                      ...options['where'],
                      ...helper.parseOrderCursor(options['order'], decoded_cursor, "internalPersonId", pagination.includeCursor)
                  };
              }
          } else { //backward
              if (pagination.before) {
                  let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                  options['where'] = {
                      ...options['where'],
                      ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "internalPersonId", pagination.includeCursor)
                  };
              }
          }
      }
      //woptions: copy of {options} with only 'where' options
      let woptions = {};
      woptions['where'] = { ...options['where']
      };
      /*
       *  Count (with only where-options)
       */
      return super.count(woptions).then(countB => {
          /*
           * Limit conditions
           */
          if (pagination) {
              //forward
              if (isForwardPagination) {

                  if (pagination.first) {
                      options['limit'] = pagination.first;
                  }
              } else { //backward
                  if (pagination.last) {
                      options['limit'] = pagination.last;
                      options['offset'] = Math.max((countB - pagination.last), 0);
                  }
              }
          }
          //check: limit
          if (globals.LIMIT_RECORDS < options['limit']) {
              throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
          }

          /*
           * Get records
           */
          return super.findAll(options).then(records => {
              let edges = [];
              let pageInfo = {
                  hasPreviousPage: false,
                  hasNextPage: false,
                  startCursor: null,
                  endCursor: null
              };

              //edges
              if (records.length > 0) {
                  edges = records.map(record => {
                      return {
                          node: record,
                          cursor: record.base64Enconde()
                      }
                  });
              }

              //forward
              if (isForwardPagination) {

                  pageInfo = {
                      hasPreviousPage: ((countA - countB) > 0),
                      hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                      startCursor: (records.length > 0) ? edges[0].cursor : null,
                      endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                  }
              } else { //backward

                  pageInfo = {
                      hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                      hasNextPage: ((countA - countB) > 0),
                      startCursor: (records.length > 0) ? edges[0].cursor : null,
                      endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                  }
              }

              return {
                  edges,
                  pageInfo
              };

          }).catch(error => {
              throw error;
          });
      }).catch(error => {
          throw error;
      });
  }).catch(error => {
      throw error;
  });
}`


module.exports.deleteOne = `
    static deleteOne(id) {
        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(\`Record with ID = \${id} not exist\`);

                return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
                    .then((valSuccess) => {
                        return item
                            .destroy()
                            .then(() => {
                                return 'Item successfully deleted';
                            });
                    }).catch((err) => {
                        return err
                    })
            });

    }`

module.exports.updateOne = `
    static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {

                    let result = await sequelize.transaction(async (t) => {
                        let promises_associations = [];
                        let item = await super.findByPk(input[this.idAttribute()], {
                            transaction: t
                        });
                        let updated = await item.update(input, {
                            transaction: t
                        });

                        return Promise.all(promises_associations).then(() => {
                            return updated;
                        });
                    });



                    if (input.addWorks) {
                        let wrong_ids = await helper.checkExistence(input.addWorks, models.book);
                        if (wrong_ids.length > 0) {
                            throw new Error(\`Ids: \${wrong_ids.join(",")} in model book were not found.\`);
                        } else {
                           await result._addWorks(input.addWorks);
                        }
                    }

                    if (input.removeWorks) {
                      let result_model_instance = new models.person(result);
                      let wrong_ids = await helper.checkIdsToRemove( result_model_instance, 'worksConnection', input.removeWorks, models.book.idAttribute());
                      if(wrong_ids.length > 0){
                        throw new Error(\`Ids: \${wrong_ids.map(i=> \`"\${i}"\`).join(",")} that you are trying to remove are not assciated with this record.\` )
                      }else{
                          await result._removeWorks(input.removeWorks);
                      }
                    }

                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }`



module.exports.removeWorks = `
  async _removeWorks(ids) {
      await helper.asyncForEach(ids, async id => {
          let record = await models.book.readById(id);
          await record.set_internalPersonId(null);
      });
  }
`

module.exports.addWorks = `
  async _addWorks(ids) {
       await  helper.asyncForEach(ids, async id => {
          let record = await models.book.readById(id);
          await record.set_internalPersonId(this.getIdValue());
      });
  }
`

module.exports.stripAssociations = `
stripAssociations() {
    let attributes = Object.keys(peopleLocalSql.definition.attributes);
    let data_values = _.pick(this, attributes);
    return data_values;
}
`

module.exports.getIdValue = `
getIdValue() {
    return this[peopleLocalSql.idAttribute()]
}
`

module.exports.idAttribute = `
static idAttribute() {
    return peopleLocalSql.definition.id.name;
}
`

module.exports.name = `
static get adapterName() {
    return "peopleLocalSql";
}
`

module.exports.type = `
static get adapterType(){
  return 'sql-adapter';
}
`

module.exports.targetKey_ddm =`
async set_internalPersonId(value) {
  let input = {
    [Book.idAttribute()] : this.getIdValue(),
    "addAuthor": value
  };
  return await Book.updateOne( input);
}
`
