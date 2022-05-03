module.exports.researcher_schema = `
"""
@search-request
"""
projectsFilter(search: searchProjectInput, order: [ orderProjectInput ], pagination: paginationInput!): [Project]
`;
module.exports.researcher_resolver = `
/**
     * countResearchers - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countResearchers: async function({
        search
    }, context) {

        if (await checkAuthorization(context, 'Researcher', 'read') === true) {
            return await researcher.countRecords(search, context.benignErrors, context.request.headers.authorization);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }

    },
`;
