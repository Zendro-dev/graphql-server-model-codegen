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
              let response = await axios.post(remoteZendroURL, {query:query});
              //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
              if(helper.isNonEmptyArray(response.data.errors)) {
                benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
              }
              // STATUS-CODE is 200
              // NO ERROR as such has been detected by the server (Express)
              // check if data was send
              if (response && response.data && response.data.data) {
                return response.data.data.readOneBook;
              } else {
                throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
              }
            } catch(error) {
              //handle caught errors
              errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
            }
    }
`;

module.exports.book_adapter_count = `
static async countRecords(search, benignErrorReporter) {
        let query = \`
      query countBooks($search: searchBookInput){
        countBooks(search: $search)
      }\`
      try {
        // Send an HTTP request to the remote server
        let response = await axios.post(remoteZendroURL, {query:query,variables: {search: search}});

        //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
        if(helper.isNonEmptyArray(response.data.errors)) {
          benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
        }

        // STATUS-CODE is 200
        // NO ERROR as such has been detected by the server (Express)
        // check if data was send
        if (response && response.data && response.data.data) {
          return response.data.data.countBooks;
        } else {
          throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
        }
      } catch(error) {
        //handle caught errors
        errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
      }
    }
`;

module.exports.book_adapter_read_all = `
static async readAllCursor(search, order, pagination, benignErrorReporter) {
        let query = \`query booksConnection($search: searchBookInput $pagination: paginationCursorInput! $order: [orderBookInput]){
      booksConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  id  title
         genre
         publisher_id
        } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }\`
        try {
          // Send an HTTP request to the remote server
          let response = await axios.post(remoteZendroURL, {query:query, variables: {search: search, order:order, pagination: pagination}});
          //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
          if(helper.isNonEmptyArray(response.data.errors)) {
            benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
          }
          // STATUS-CODE is 200
          // NO ERROR as such has been detected by the server (Express)
          // check if data was send
          if(response && response.data && response.data.data && response.data.data.booksConnection !== null) {
            return response.data.data.booksConnection;
          } else {
            throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
          }
        } catch(error) {
          //handle caught errors
          errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
        }
    }
`;

module.exports.book_ddm_registry = `
  let registry = ["BooksOne", "BooksTwo"];
`;

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
    let item  = new book(result);
    return validatorUtil.validateData('validateAfterRead', this, item);

   });
  }
}
`;

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

  // map the adapters authorized for 'search' to cassandra-adapters. This is needed to pass the 'allowFiltering' parameter to the cassandra-adapter
  let searchAuthAdapters = [];
  if (helper.isNotUndefinedAndNotNull(searchAuthorizedAdapters)) {
      searchAuthAdapters = Array.from(searchAuthorizedAdapters).filter(adapter => adapter.adapterType === 'cassandra-adapter').map(adapter => adapter.adapterName);
  }

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);

  let promises = authAdapters.map(adapter => {
      /**
       * Differentiated cases:
       *   sql-adapter:
       *      resolve with current parameters.
       *
       *   ddm-adapter:
       *   zendro-webservice-adapter:
       *   generic-adapter:
       *      add exclusions to search.excludeAdapterNames parameter.
       */
      switch (adapter.adapterType) {
          case 'ddm-adapter':
          case 'generic-adapter':
              let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
              return adapter.countRecords(nsearch, benignErrorReporter);

          case 'sql-adapter':
          case 'mongodb-adapter':
          case 'amazon-s3-adapter':
          case 'trino-adapter':
          case 'presto-adapter':
          case 'neo4j-adapter':
          case 'zendro-webservice-adapter':
              return adapter.countRecords(search, benignErrorReporter);
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
      }, 0);
  });
}
`;

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

  // map the adapters authorized for 'search' to cassandra-adapters. This is needed to pass the 'allowFiltering' parameter to the cassandra-adapter
  let searchAuthAdapters = [];
  if (helper.isNotUndefinedAndNotNull(searchAuthorizedAdapters)) {
      searchAuthAdapters = Array.from(searchAuthorizedAdapters).filter(adapter => adapter.adapterType === 'cassandra-adapter').map(adapter => adapter.adapterName);
  }

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);


  let isForwardPagination = !pagination || !(pagination.last != undefined);
  let promises = authAdapters.map(adapter => {
      /**
       * Differentiated cases:
       *   sql-adapter:
       *      resolve with current parameters.
       *
       *   ddm-adapter:
       *   zendro-webservice-adapter:
       *   generic-adapter:
       *      add exclusions to search.excludeAdapterNames parameter.
       */
      switch (adapter.adapterType) {
          case 'ddm-adapter':
              let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
              return adapter.readAllCursor(nsearch, order, pagination, benignErrorReporter);

          case 'generic-adapter':
          case 'sql-adapter':
          case 'mongodb-adapter':
          case 'amazon-s3-adapter':
          case 'trino-adapter':
          case 'presto-adapter':
          case 'neo4j-adapter':
          case 'zendro-webservice-adapter':
              return adapter.readAllCursor(search, order, pagination, benignErrorReporter);
          case 'cassandra-adapter':
              return adapter.readAllCursor(search, pagination, benignErrorReporter, searchAuthAdapters.includes(adapter.adapterName));

          default:
              throw new Error(\`Adapter type '\${adapter.adapterType}' is not supported\`);
      }
  });
  let someHasNextPage = false;
  let someHasPreviousPage = false;
  return Promise.allSettled(promises)
      //phase 1: reduce
      .then(results => {
          return results.reduce((total, current) => {
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
      //phase 2: validate & order & paginate
      .then(async nodes => {
          nodes = await validatorUtil.bulkValidateData('validateAfterRead', this, nodes, benignErrorReporter);
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

          let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage, "books");
          return graphQLConnection;

      });
}
`;

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
            type: 'many_to_many',
            implementation: 'sql_cross_table',
            target: 'Book',
            targetKey: 'bookId',
            sourceKey: 'personId',
            keysIn: 'books_to_people',
            targetStorageType: 'sql'
        },
        company: {
            type: 'many_to_one',
            implementation: 'foreignkeys',
            target: 'publi_sher',
            targetKey: 'companyId',
            keysIn: 'Person',
            targetStorageType: 'zendro-server'
        },
        dogs: {
            type: 'one_to_many',
            implementation: 'foreignkeys',
            target: 'Dog',
            targetKey: 'personId',
            keysIn: 'Dog',
            targetStorageType: 'sql'
        },
        parrot: {
            type: 'many_to_one',
            implementation: 'foreignkeys',
            target: 'Parrot',
            targetKey: 'personId',
            keysIn: 'Parrot',
            targetStorageType: 'sql'
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};
`;
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
            type: 'many_to_one',
            implementation: 'foreignkeys',
            target: 'Person',
            targetKey: 'personId',
            keysIn: 'Dog',
            targetStorageType: 'sql'
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};
`;

module.exports.person_ddm_count_association = `
countFilteredDogsImpl ({search}){

  if(search === undefined)
  {
    return models.dog.countRecords({"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} );
  }else{
    return models.dog.countRecords({"operator":"and", "search":[ {"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} , search] })
  }
}
`;

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
            "value": this.getIdValue(),
            "operator": "eq"
        });

        let found = (await resolvers.parrotsConnection({
            search: nsearch,
            pagination:{first:2}
        }, context)).edges;

        if (found.length > 0) {
            if (found.length > 1) {
                context.benignErrors.push(new Error(
                  \`Not unique "to_one" association Error: Found > 1 parrots matching person with id \${this.getIdValue()}. Consider making this a "to_many" association, or using unique constraints, or moving the foreign key into the Person model. Returning first Parrot.\`
                ));
            }
            return found[0].node;
        }
        return null;
}

`;
