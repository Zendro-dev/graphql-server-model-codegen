module.exports.count_dogs_model_ddm = `

static countRecords(search, authorizedAdapters, benignErrorReporter) {
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
                return adapter.countRecords(search, benignErrorReporter);

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

module.exports.readAllCursor_dogs_model_ddm = `
static readAllCursor(search, order, pagination, authorizedAdapters, benignErrorReporter) {
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
                return adapter.readAllCursor(nsearch, order, pagination,benignErrorReporter);

            case 'generic-adapter':
            case 'sql-adapter':
            case 'cenzontle-webservice-adapter':
                return adapter.readAllCursor(search, order, pagination,benignErrorReporter);

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
        },[]);
    })
    //phase 2: order & paginate
    .then(nodes => {
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

        let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage);
        return graphQLConnection;
    });
}

`

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

  //construct benignErrors reporter with context
  let benignErrorReporter = new errorHelper.BenignErrorReporter(context);

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
            context.benignErrors = context.benignErrors.concat(authorizationCheck.authorizationErrors);
        }

        return await dog.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters, benignErrorReporter);
    } else { //adapters not auth || errors
        // else new Error
        if (authorizationCheck.authorizationErrors.length > 0) {
            throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => \`\${a}, \${c.message}\`));
        } else {
            throw new Error('No available adapters for data model "dog" ');
        }
    }
}

`

module.exports.count_dogs_resolver_ddm = `
countDogs: async function({
    search
}, context) {
    //construct benignErrors reporter with context
    let benignErrorReporter = new errorHelper.BenignErrorReporter(context);

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
            context.benignErrors = context.benignErrors.concat(authorizationCheck.authorizationErrors);
        }

        return await dog.countRecords(search, authorizationCheck.authorizedAdapters, benignErrorReporter);
    } else { //adapters not auth || errors
        // else new Error
        if (authorizationCheck.authorizationErrors.length > 0) {
            throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => \`\${a}, \${c.message}\`));
        } else {
            throw new Error('No available adapters for data model "dog"');
        }
    }
}
`