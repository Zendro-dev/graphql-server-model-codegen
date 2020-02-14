module.exports.dog_resolvers = `
/**
 * bulkAddDogCsv - Load csv file of records
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
bulkAddDogCsv: function(_, context) {
    return checkAuthorization(context, 'Dog', 'create').then(authorization => {
        if (authorization === true) {

          return dog.bulkAddCsv(context);

        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        console.error(error);
        handleError(error);
    })
}
`
