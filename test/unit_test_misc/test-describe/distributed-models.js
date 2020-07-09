module.exports.book_adapter_readById = `
static async readById(iri, benignErrorReporter) {
        let query = \`
          query
            readOneBook
            {
              readOneBook(id:"\${iri}")
              {
                id
                title
                genre
                publisher_id
              }
            }\`;

            try {
              // Send an HTTP request to the remote server
              let response = await axios.post(remoteCenzontleURL, {query:query});
              //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
              if(helper.isNonEmptyArray(response.data.errors)) {
                benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
              }
              // STATUS-CODE is 200
              // NO ERROR as such has been detected by the server (Express)
              // check if data was send
              if (response && response.data && response.data.data) {
                return response.data.data.readOneBook;
              } else {
                throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
              }
            } catch(error) {
              //handle caught errors
              errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
            }
    }
`

module.exports.book_adapter_count = `
static async countRecords(search, benignErrorReporter) {
        let query = \`
      query countBooks($search: searchBookInput){
        countBooks(search: $search)
      }\`
      try {
        // Send an HTTP request to the remote server
        let response = await axios.post(remoteCenzontleURL, {query:query,variables: {search: search}});

        //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
        if(helper.isNonEmptyArray(response.data.errors)) {
          benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
        }

        // STATUS-CODE is 200
        // NO ERROR as such has been detected by the server (Express)
        // check if data was send
        if (response && response.data && response.data.data) {
          return response.data.data.countBooks;
        } else {
          throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
        }
      } catch(error) {
        //handle caught errors
        errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
      }
    }
`

module.exports.book_adapter_read_all = `
static async readAllCursor(search, order, pagination, benignErrorReporter) {
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
        try {
          // Send an HTTP request to the remote server
          let response = await axios.post(remoteCenzontleURL, {query:query, variables: {search: search, order:order, pagination: pagination}});
          //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
          if(helper.isNonEmptyArray(response.data.errors)) {
            benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
          }
          // STATUS-CODE is 200
          // NO ERROR as such has been detected by the server (Express)
          // check if data was send
          if(response && response.data && response.data.data) {
            return response.data.data.booksConnection;
          } else {
            throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
          }
        } catch(error) {
          //handle caught errors
          errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
        }
    }
`

module.exports.book_ddm_registry = `
  let registry = ["BooksOne", "BooksTwo"];
`

module.exports.book_ddm_readById = `
static readById(id, benignErrorReporter) {
  if(id!==null){
  let responsibleAdapter = registry.filter( adapter => adapters[adapter].recognizeId(id));

  if(responsibleAdapter.length > 1 ){
    throw new Error("IRI has no unique match");
  }else if(responsibleAdapter.length === 0){
    throw new Error("IRI has no match WS");
  }
  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );
  return adapters[responsibleAdapter[0] ].readById(id, benignErrorReporter).then(result => {
    let item  = new Book(result);
    return validatorUtil.ifHasValidatorFunctionInvoke('validateAfterRead', this, item)
        .then((valSuccess) => {
            return item;
        });

   });
  }
}
`

module.exports.book_ddm_count = `
static countRecords(search, authorizedAdapters, benignErrorReporter, searchAuthorizedAdapters) {
        let authAdapters = [];
        /**
         * Differentiated cases:
         *    if authorizedAdapters is defined:
         *      - called from resolver.
         *      - authorizedAdapters will no be modified.
         *
         *    if authorizedAdapters is not defined:
         *      - called internally
         *      - authorizedAdapters will be set to registered adapters.
         */
        if (authorizedAdapters === undefined) {
            authAdapters = Object.values(this.registeredAdapters);
        } else {
            authAdapters = Array.from(authorizedAdapters)
        }

        let searchAuthAdapters = [];

        if (helper.isNotUndefinedAndNotNull(searchAuthorizedAdapters)) {
            searchAuthAdapters = Array.from(searchAuthorizedAdapters).filter(adapter => adapter.adapterType === 'cassandra-adapter').map(adapter => adapter.adapterName);
        }

        //use default BenignErrorReporter if no BenignErrorReporter defined
        benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

        let promises = authAdapters.map(adapter => {
            /**
             * Differentiated cases:
             *   sql-adapter:
             *      resolve with current parameters.
             *
             *   ddm-adapter:
             *   cenzontle-webservice-adapter:
             *   generic-adapter:
             *      add exclusions to search.excludeAdapterNames parameter.
             */
            switch (adapter.adapterType) {
                case 'ddm-adapter':
                case 'generic-adapter':
                    let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
                    return adapter.countRecords(nsearch, benignErrorReporter);

                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                case 'cassandra-adapter':
                    return adapter.countRecords(search, benignErrorReporter, searchAuthAdapters.includes(adapter.adapterName));

                case 'default':
                    throw new Error(\`Adapter type: '\${adapter.adapterType}' is not supported\`);
            }
        });

        return Promise.allSettled(promises).then(results => {
            return results.reduce((total, current) => {
                //check if current is Error
                if (current.status === 'rejected') {
                    benignErrorReporter.reportError(current.reason);
                }
                //check current result
                else if (current.status === 'fulfilled') {
                    total += current.value;
                }
                return total;
            }, 0 );
        });
    }
`

module.exports.book_ddm_read_all = `
static readAllCursor(search, order, pagination, authorizedAdapters, benignErrorReporter, searchAuthorizedAdapters) {
        let authAdapters = [];
        /**
         * Differentiated cases:
         *    if authorizedAdapters is defined:
         *      - called from resolver.
         *      - authorizedAdapters will no be modified.
         *
         *    if authorizedAdapters is not defined:
         *      - called internally
         *      - authorizedAdapters will be set to registered adapters.
         */
        if (authorizedAdapters === undefined) {
            authAdapters = Object.values(this.registeredAdapters);
        } else {
            authAdapters = Array.from(authorizedAdapters)
        }

        let searchAuthAdapters = [];

        if (helper.isNotUndefinedAndNotNull(searchAuthorizedAdapters)) {
            searchAuthAdapters = Array.from(searchAuthorizedAdapters).filter(adapter => adapter.adapterType === 'cassandra-adapter').map(adapter => adapter.adapterName);
        }

        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        //use default BenignErrorReporter if no BenignErrorReporter defined
        benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let promises = authAdapters.map(adapter => {
            /**
             * Differentiated cases:
             *   sql-adapter:
             *      resolve with current parameters.
             *
             *   ddm-adapter:
             *   cenzontle-webservice-adapter:
             *   generic-adapter:
             *      add exclusions to search.excludeAdapterNames parameter.
             */
            switch (adapter.adapterType) {
                case 'ddm-adapter':
                    let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
                    return adapter.readAllCursor(nsearch, order, pagination, benignErrorReporter);

                case 'generic-adapter':
                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.readAllCursor(search, order, pagination,benignErrorReporter );

                case 'cassandra-adapter':
                    return adapter.readAllCursor(search, pagination, searchAuthAdapters.includes(adapter.adapterName));

                default:
                    throw new Error(\`Adapter type '\${adapter.adapterType}' is not supported\`);
            }
        });
        let someHasNextPage = false;
        let someHasPreviousPage = false;
        return Promise.allSettled(promises)
        //phase 1: reduce
        .then( results => {
            return results.reduce( (total, current)=> {
              //check if current is Error
              if (current.status === 'rejected') {
                  benignErrorReporter.reportError(current.reason);
              }
              //check current
              else if (current.status === 'fulfilled') {
                if (current.value && current.value.pageInfo && current.value.edges) {
                    someHasNextPage |= current.value.pageInfo.hasNextPage;
                    someHasPreviousPage |= current.value.pageInfo.hasPreviousPage;
                    total = total.concat(current.value.edges.map(e => e.node));
                }
              }
              return total;
            }, []);
          })
          //phase 2: order & paginate
          .then(nodes => {

              if (order === undefined) {
                  order = [{
                      field: "id",
                      order: 'ASC'
                  }];
              }
              if (pagination === undefined) {
                  pagination = {
                      first: Math.min(globals.LIMIT_RECORDS, nodes.length)
                  }
              }

              let ordered_records = helper.orderRecords(nodes, order);
              let paginated_records = [];

              if (isForwardPagination) {
                  paginated_records = helper.paginateRecordsCursor(ordered_records, pagination.first);
              } else {
                  paginated_records = helper.paginateRecordsBefore(ordered_records, pagination.last);
              }

              let hasNextPage = ordered_records.length > pagination.first || someHasNextPage;
              let hasPreviousPage = ordered_records.length > pagination.last || someHasPreviousPage;

              let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage);
              return graphQLConnection;
          });
    }
`

module.exports.person_ddm_many_association = `
const definition = {
    model: 'Person',
    storageType: 'distributed-data-model',
    registry: [
        'PeopleOne',
        'PeopleTwo'
    ],
    attributes: {
        firstName: 'String',
        lastName: 'String',
        email: 'String',
        companyId: 'Int'
    },
    associations: {
        works: {
            type: 'to_many',
            target: 'Book',
            targetKey: 'bookId',
            sourceKey: 'personId',
            keysIn: 'books_to_people',
            targetStorageType: 'sql'
        },
        company: {
            type: 'to_one',
            target: 'publi_sher',
            targetKey: 'companyId',
            keyIn: 'Person',
            targetStorageType: 'cenz-server'
        },
        dogs: {
            type: 'to_many',
            target: 'Dog',
            targetKey: 'personId',
            keyIn: 'Dog',
            targetStorageType: 'sql'
        },
        parrot: {
            type: 'to_one',
            target: 'Parrot',
            targetKey: 'personId',
            keyIn: 'Parrot',
            targetStorageType: 'sql'
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};
`
module.exports.dog_ddm_one_association = `
const definition = {
    model: 'Dog',
    storageType: 'distributed-data-model',
    registry: [
        'DogsOne',
        'DogsTwo'
    ],
    attributes: {
        name: 'String',
        breed: 'String',
        personId: 'String'
    },
    associations: {
        owner: {
            type: 'to_one',
            target: 'Person',
            targetKey: 'personId',
            keyIn: 'Dog',
            targetStorageType: 'sql'
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};
`

module.exports.person_ddm_count_association = `
countFilteredDogsImpl ({search}){

  if(search === undefined)
  {
    return models.dog.countRecords({"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} );
  }else{
    return models.dog.countRecords({"operator":"and", "search":[ {"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} , search] })
  }
}
`

module.exports.person_ddm_resolver_one_to_one = `
/**
 * person.prototype.parrot - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
person.prototype.parrot = async function({
    search
}, context) {
        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "personId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        let found = (await resolvers.parrotsConnection({
            search: nsearch
        }, context)).edges;

        if (found.length > 0) {
            if (found.length > 1) {
                let foundIds = [];
                found.forEach(parrot => {
                    foundIds.push(parrot.node.getIdValue())
                })
                context.benignErrors.push(new Error(
                    \`Not unique "to_one" association Error: Found \${found.length} parrots matching person with id \${this.getIdValue()}. Consider making this association a "to_many", using unique constraints, or moving
    the foreign key into the Person model. Returning first Parrot. Found Parrots \${models.parrot.idAttribute()}s: [\${foundIds.toString()}]\`
                ));
            }
            return found[0].node;
        }
        return null;
}

`
