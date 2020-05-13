module.exports.book_adapter_readById = `
static readById(iri) {
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

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.readOneBook;
            } else {
                throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
`

module.exports.book_adapter_count = `
static countRecords(search) {
        let query = \`
      query countBooks($search: searchBookInput){
        countBooks(search: $search)
      }\`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.countBooks;
            } else {
                throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
`

module.exports.book_adapter_read_all = `
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

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.booksConnection;
            } else {
                throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
`

module.exports.book_ddm_registry = `
  let registry = ["BooksOne", "BooksTwo"];
`

module.exports.book_ddm_readById = `
static readById(id) {
  if(id!==null){
  let responsibleAdapter = registry.filter( adapter => adapters[adapter].recognizeId(id));

  if(responsibleAdapter.length > 1 ){
    throw new Error("IRI has no unique match");
  }else if(responsibleAdapter.length === 0){
    throw new Error("IRI has no match WS");
  }

  return adapters[responsibleAdapter[0] ].readById(id).then(result => new Book(result));
  }
}
`

module.exports.book_ddm_count = `
static countRecords(search, authorizedAdapters) {
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
                    return adapter.countRecords(nsearch).catch(benignErrors => benignErrors);

                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.countRecords(search).catch(benignErrors => benignErrors);

                case 'default':
                    throw new Error(\`Adapter type: '\${adapter.adapterType}' is not supported\`);
            }
        });

        return Promise.all(promises).then(results => {
            return results.reduce((total, current) => {
                //check if current is Error
                if (current instanceof Error) {
                    total.errors.push(current);
                }
                //check current result
                else if (current) {
                    total.sum += current;
                }
                return total;
            }, {
                sum: 0,
                errors: []
            });
        });
    }
`

module.exports.book_ddm_read_all = `
static readAllCursor(search, order, pagination, authorizedAdapters) {
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

        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

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
                    return adapter.readAllCursor(nsearch, order, pagination).catch(benignErrors => benignErrors);

                case 'generic-adapter':
                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.readAllCursor(search, order, pagination).catch(benignErrors => benignErrors);

                default:
                    throw new Error(\`Adapter type '\${adapter.adapterType}' is not supported\`);
            }
        });
        let someHasNextPage = false;
        let someHasPreviousPage = false;
        return Promise.all(promises)
            //phase 1: reduce
            .then(results => {
                return results.reduce((total, current) => {
                    //check if current is Error
                    if (current instanceof Error) {
                        total.errors.push(current);
                    }
                    //check current
                    else if (current && current.pageInfo && current.edges) {
                        someHasNextPage |= current.pageInfo.hasNextPage;
                        someHasPreviousPage |= current.pageInfo.hasPreviousPage;
                        total.nodes = total.nodes.concat(current.edges.map(e => e.node));
                    }
                    return total;
                }, {
                    nodes: [],
                    errors: []
                });
            })
            //phase 2: order & paginate
            .then(nodesAndErrors => {
                let nodes = nodesAndErrors.nodes;
                let errors = nodesAndErrors.errors;

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
                graphQLConnection['errors'] = errors;
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
            targetStorageType: 'sql',
            name: 'works',
            name_lc: 'works',
            name_cp: 'Works',
            target_lc: 'book',
            target_lc_pl: 'books',
            target_pl: 'Books',
            target_cp: 'Book',
            target_cp_pl: 'Books',
            holdsForeignKey: false
        },
        company: {
            type: 'to_one',
            target: 'publi_sher',
            targetKey: 'companyId',
            keyIn: 'Person',
            targetStorageType: 'cenz-server',
            name: 'company',
            name_lc: 'company',
            name_cp: 'Company',
            target_lc: 'publi_sher',
            target_lc_pl: 'publi_shers',
            target_pl: 'publi_shers',
            target_cp: 'Publi_sher',
            target_cp_pl: 'Publi_shers',
            keyIn_lc: 'person',
            holdsForeignKey: true
        },
        dogs: {
            type: 'to_many',
            target: 'Dog',
            targetKey: 'personId',
            keyIn: 'Dog',
            targetStorageType: 'sql',
            name: 'dogs',
            name_lc: 'dogs',
            name_cp: 'Dogs',
            target_lc: 'dog',
            target_lc_pl: 'dogs',
            target_pl: 'Dogs',
            target_cp: 'Dog',
            target_cp_pl: 'Dogs',
            keyIn_lc: 'dog',
            holdsForeignKey: false
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
            targetStorageType: 'sql',
            name: 'owner',
            name_lc: 'owner',
            name_cp: 'Owner',
            target_lc: 'person',
            target_lc_pl: 'people',
            target_pl: 'People',
            target_cp: 'Person',
            target_cp_pl: 'People',
            keyIn_lc: 'dog',
            holdsForeignKey: true
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
