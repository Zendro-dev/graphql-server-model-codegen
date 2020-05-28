module.exports.individual_schema = `
countIndividuals(search: searchIndividualInput ): Int
`

module.exports.individual_resolvers = `
/**
     * countIndividuals - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countIndividuals: async function({
        search
    }, context) {
        try {
            if (await checkAuthorization(context, 'individual', 'read') === true) {
                return (await individual.countRecords(search)).sum;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            handleError(error);
        }
    },
`

module.exports.specie_resolvers = `
/**
     * countSpecies - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countSpecies: async function({
        search
    }, context) {
        try {
            if (await checkAuthorization(context, 'Specie', 'read') === true) {
                return (await specie.countRecords(search)).sum;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            handleError(error);
        }
    },
`
