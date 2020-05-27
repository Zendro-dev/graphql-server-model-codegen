module.exports.book_schema = `
vueTableBook : VueTableBook    csvTableTemplateBook: [String]
`
module.exports.book_resolvers = `
/**
 * vueTableBook - Return table of records as needed for displaying a vuejs table
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         Records with format as needed for displaying a vuejs table
 */
vueTableBook: function(_, context) {
    return checkAuthorization(context, 'Book', 'read').then(authorization => {
        if (authorization === true) {
            return helper.vueTable(context.request, book, ["id", "title", "genre"]);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`
