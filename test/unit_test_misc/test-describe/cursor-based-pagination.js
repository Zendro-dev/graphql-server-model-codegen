module.exports.connection_book_schema = `
type BookConnection{
  edges: [BookEdge]
  pageInfo: pageInfo!
}

type BookEdge{
  cursor: String!
  node: Book!
}
`

module.exports.connection_book_query = `
booksConnection(search: searchBookInput, order: [orderBookInput], pagination: paginationCursorInput): BookConnection
`

module.exports.model_read_all_connection = `
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

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

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
                }).includes("id")) {
                options['order'] = [...options['order'], ...[
                    ["id", "ASC"]
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
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "id", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "id", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = {
                ...options['where']
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
                    throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
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
    }
`

module.exports.resolver_read_all_connection = `
/**
     * booksConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    booksConnection: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'Book', 'read') === true) {
            await checkCountAndReduceRecordsLimit(search, context, "booksConnection");
            return book.readAllCursor(search, order, pagination);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }

    },
`

module.exports.schema_to_many_association = `
"""
@search-request
"""
booksConnection(search: searchBookInput, order: [ orderBookInput ], pagination: paginationCursorInput): BookConnection

`

module.exports.resolver_to_many_association = `
/**
 * person.prototype.booksConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
person.prototype.booksConnection = async function({
    search,
    order,
    pagination
}, context) {
if (await checkAuthorization(context, 'Book', 'read') === true) {
            await checkCountAndReduceRecordsLimit(search, context, "peopleConnection");
            return this.booksConnectionImpl({
                search,
                order,
                pagination
            });
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
}
`

module.exports.model_many_to_many_association =`
booksConnectionImpl({
  search,
  order,
  pagination
}) {
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
  return this.countBooks(options).then(countA => {
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
          }).includes(models.book.idAttribute())) {
          options['order'] = [...options['order'], ...[
              [models.book.idAttribute(), "ASC"]
          ]];
      }
      /*
       * Pagination conditions
       */
      if (pagination) {
          //forward
          if (isForwardPagination) {
              if (pagination.after) {
                  let decoded_cursor = JSON.parse(Person.base64Decode(pagination.after));
                  options['where'] = {
                      ...options['where'],
                      ...helper.parseOrderCursor(options['order'], decoded_cursor, models.book.idAttribute(), pagination.includeCursor)
                  };
              }
          } else { //backward
              if (pagination.before) {
                  let decoded_cursor = JSON.parse(Person.base64Decode(pagination.before));
                  options['where'] = {
                      ...options['where'],
                      ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, models.book.idAttribute(), pagination.includeCursor)
                  };
              }
          }
      }
      //woptions: copy of {options} with only 'where' options
      let woptions = {};
      woptions['where'] = {
          ...options['where']
      };

      /*
       *  Count (with only where-options)
       */
      return this.countBooks(woptions).then(countB => {
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
              throw new Error(\`Request of total booksConnection exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
          }

          /*
           * Get records
           */
          return this.getBooks(options).then(records => {
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

}
`

module.exports.read_all_cenz_server = `
static readAllCursor(search, order, pagination) {
  //check valid pagination arguments
  let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
  if (!argsValid) {
    throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
  }

  let query = \`query booksConnection($search: searchBookInput $pagination: paginationCursorInput $order: [orderBookInput]){
booksConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  id  title
  genre
  publisher_id
 } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }\`

  return axios.post(url, {
      query: query,
      variables: {
          search: search,
          order: order,
          pagination: pagination
      }
  }).then(res => {
      //check
      if (helper.isNonEmptyArray(res.data.errors)){
        throw new Error(JSON.stringify(res.data.errors));
      }
      if(res&&res.data&&res.data.data) {
        let data_edges = res.data.data.booksConnection.edges;
        let pageInfo = res.data.data.booksConnection.pageInfo;

        let edges = data_edges.map(e => {
            return {
                node: new Book(e.node),
                cursor: e.cursor
            }
        })

        return {
            edges,
            pageInfo
        };
      } else {
        throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
      }
  }).catch(error => {
      error['url'] = url;
      handleError(error);
  });
}
`

module.exports.many_to_many_association_connection_cenz_server = `
static updateOne(input) {
  return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
      .then(async (valSuccess) => {
        let query = \`mutation updatePerson($id:ID!        $firstName:String
            $lastName:String
            $email:String){
       updatePerson(id:$id           firstName:$firstName
                  lastName:$lastName
                  email:$email){
          id            firstName
                    lastName
                    email
                    companyId
         }
     }\`

        return axios.post(url, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return new Person(res.data.data.updatePerson);
            } else {
              throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
            }
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
      });
    }
`
