module.exports.count_dogs_model_ddm = `

static countRecords(search, authorizedAdapters, benignErrorReporter, searchAuthorizedAdapters, token) {
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
                return adapter.countRecords(nsearch, benignErrorReporter, token);

            case 'sql-adapter':
            case 'mongodb-adapter':
            case 'amazon-s3-adapter':
            case 'trino-adapter':
            case 'presto-adapter':
            case 'neo4j-adapter':
                return adapter.countRecords(search, benignErrorReporter);
            case 'zendro-webservice-adapter':
                return adapter.countRecords(search, benignErrorReporter, token);
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
                benignErrorReporter.push(current.reason);
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

module.exports.readAllCursor_dogs_model_ddm = `
static readAllCursor(search, order, pagination, authorizedAdapters, benignErrorReporter, searchAuthorizedAdapters, token) {
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
                return adapter.readAllCursor(nsearch, order, pagination, benignErrorReporter, token);

            case 'generic-adapter':
            case 'sql-adapter':
            case 'mongodb-adapter':
            case 'amazon-s3-adapter':
            case 'trino-adapter':
            case 'presto-adapter':
            case 'neo4j-adapter':
                return adapter.readAllCursor(search, order, pagination, benignErrorReporter);
            case 'zendro-webservice-adapter':
                return adapter.readAllCursor(search, order, pagination, benignErrorReporter, token);
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
                benignErrorReporter.push(current.reason);
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
                field: "dog_id",
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

        let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage, "dogs");
        return graphQLConnection;
    });
}

`;

module.exports.connections_dogs_resolver_ddm = `
/**
 * dogsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
dogsConnection: async function({
    search,
    order,
    pagination
}, context) {
  // check valid pagination arguments
  helper.checkCursorBasedPaginationArgument(pagination);
  // reduce recordsLimit and check if exceeded
  let limit = helper.isNotUndefinedAndNotNull(pagination.first) ? pagination.first : pagination.last;
  helper.checkCountAndReduceRecordsLimit(limit, context, "dogsConnection");

    //check: adapters
    let registeredAdapters = Object.values(dog.registeredAdapters);
    if (registeredAdapters.length === 0) {
        throw new Error('No adapters registered for data model "dog"');
    } //else

    //exclude adapters
    let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
    if (adapters.length === 0) {
        throw new Error('All adapters was excluded for data model "dog"');
    } //else

    //check: auth adapters
    let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
    if (authorizationCheck.authorizedAdapters.length > 0) {
        //check adapter authorization Errors
        if (authorizationCheck.authorizationErrors.length > 0) {
            context.benignErrors.push(authorizationCheck.authorizationErrors);
        }
        let searchAuthorizationCheck = await helper.authorizedAdapters(context, adapters, 'search');
        return await dog.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters, context.benignErrors, searchAuthorizationCheck.authorizedAdapters, context.request.headers.authorization);
    } else { //adapters not auth || errors
        // else new Error
        if (authorizationCheck.authorizationErrors.length > 0) {
            throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => \`\${a}, \${c.message}\`));
        } else {
            throw new Error('No available adapters for data model "dog" ');
        }
    }
}

`;

module.exports.count_dogs_resolver_ddm = `
countDogs: async function({
    search
}, context) {
    //check: adapters
    let registeredAdapters = Object.values(dog.registeredAdapters);
    if (registeredAdapters.length === 0) {
        throw new Error('No adapters registered for data model "dog"');
    } //else

    //exclude adapters
    let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
    if (adapters.length === 0) {
        throw new Error('All adapters was excluded for data model "dog"');
    } //else

    //check: auth adapters
    let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
    if (authorizationCheck.authorizedAdapters.length > 0) {
        //check adapter authorization Errors
        if (authorizationCheck.authorizationErrors.length > 0) {
            context.benignErrors.push(authorizationCheck.authorizationErrors);
        }
        let searchAuthorizationCheck = await helper.authorizedAdapters(context, adapters, 'search');
        return await dog.countRecords(search, authorizationCheck.authorizedAdapters, context.benignErrors, searchAuthorizationCheck.authorizedAdapters, context.request.headers.authorization);
    } else { //adapters not auth || errors
        // else new Error
        if (authorizationCheck.authorizationErrors.length > 0) {
            throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => \`\${a}, \${c.message}\`));
        } else {
            throw new Error('No available adapters for data model "dog"');
        }
    }
}
`;

module.exports.readAllCursor_dogs_adapter_ddm = `
static async readAllCursor(search, order, pagination, benignErrorReporter, token) {
    let query = \`query dogsConnection($search: searchDogInput $pagination: paginationCursorInput! $order: [orderDogInput]){
  dogsConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  dog_id  name
     person_id
   } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }\`


    try {
      // Send an HTTP request to the remote server
      let opts = {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/graphql",
        },
      };
      if (token) {
        opts.headers["authorization"] = token;
      }
      let response = await axios.post(
        remoteZendroURL, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            },
        },
        opts
      );        
      //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
      if(helper.isNonEmptyArray(response.data.errors)) {
        benignErrorReporter.push(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
      }
      // STATUS-CODE is 200
      // NO ERROR as such has been detected by the server (Express)
      // check if data was send
      if(response && response.data && response.data.data && response.data.data.dogsConnection !== null) {
        return response.data.data.dogsConnection;
      } else {
        throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
      }
    } catch(error) {
      //handle caught errors
      errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
}
`;
