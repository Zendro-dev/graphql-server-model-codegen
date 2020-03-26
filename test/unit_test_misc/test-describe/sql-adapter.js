module.exports.url_regex = `
const iriRegex = new RegExp('peopleLocal');
`

module.exports.constructor = `
static init(sequelize, DataTypes) {
    return super.init({

        internalPersonId: {
            type: Sequelize[dict['String']],
            primaryKey: true
        },
        firstName: {
            type: Sequelize[dict['String']]
        },
        lastName: {
            type: Sequelize[dict['String']]
        },
        email: {
            type: Sequelize[dict['String']]
        },
        companyId: {
            type: Sequelize[dict['Int']]
        }


    }, {
        modelName: "person",
        tableName: "people",
        sequelize
    });
}
`

module.exports.recognizeId = `
static recognizeId(iri) {
    return iriRegex.test(iri);
}
`

module.exports.readById = `
static readById(id) {
    let options = {};
    options['where'] = {};
    options['where'][this.idAttribute()] = id;
    return peopleLocalSql.findOne(options);
}  
`
