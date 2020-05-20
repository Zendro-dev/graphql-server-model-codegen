module.exports.dog_owner_resolvers = `
/**
 * dog.prototype.owner - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.owner = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.owner_id_test)) {
        try {
            if (search === undefined) {
                return resolvers.readOnePerson({
                    [models.person.idAttribute()]: this.owner_id_test
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.person.idAttribute(),
                    "value": {
                        "value": this.owner_id_test
                    },
                    "operator": "eq"
                });
                let found = await resolvers.people({
                    search: nsearch
                }, context);
                if (found) {
                    return found[0]
                }
                return found;
            }
        } catch (error) {
            handleError(error);
        };
    }
}
`

module.exports.dog_owner_schema = `
    owner(search: searchPersonInput): Person
`

module.exports.dog_owner_model = `
Dog.belongsTo(models.person, {
    as: 'owner',
    foreignKey: 'owner_id_test'
});
`

module.exports.academicTeam_resolvers = `
/**
 * academicTeam.prototype.membersFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
academicTeam.prototype.membersFilter = function({
    search,
    order,
    pagination
}, context) {
    try {
        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "academicTeamId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.researchers({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        handleError(error);
    };
}
`

module.exports.academicTeam_schema = `
"""
@search-request
"""
membersFilter(search: searchResearcherInput, order: [ orderResearcherInput ], pagination: paginationInput): [Researcher]
`

module.exports.academicTeam_model = `
academicTeam.hasMany(models.researcher, {
    as: 'members',
    foreignKey: 'academicTeamId'
});
`
