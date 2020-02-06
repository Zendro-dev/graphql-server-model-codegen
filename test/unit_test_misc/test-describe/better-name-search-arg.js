module.exports.researcher_schema = `
"""
@search-request
"""
projectsFilter(search: searchProjectInput, order: [ orderProjectInput ], pagination: paginationInput): [Project]
`
module.exports.researcher_resolver = `
/**
 * countResearchers - Counts number of records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} Search argument for filtering records
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {number}          Number of records that holds the conditions specified in the search argument
 */
countResearchers: function({
    search
}, context) {
    return checkAuthorization(context, 'Researcher', 'read').then(authorization => {
        if (authorization === true) {
            return researcher.countRecords(search);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        console.error(error);
        handleError(error);
    })
},
`
