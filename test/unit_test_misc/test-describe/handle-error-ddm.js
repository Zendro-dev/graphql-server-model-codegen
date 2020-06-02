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
