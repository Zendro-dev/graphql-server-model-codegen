module.exports.dog_resolvers = `
/**
     * bulkAddDogCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddDogCsv: async function(_, context) {
        if (await checkAuthorization(context, 'Dog', 'create') === true) {
            return dog.bulkAddCsv(context, context.benignErrors);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;
