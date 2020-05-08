module.exports.person_schema = `
addPerson( firstName: String, lastName: String, email: String , addDogs:[ID], addBooks:[ID], skipAssociationsExistenceChecks:Boolean = false ): Person!
updatePerson(id: ID!, firstName: String, lastName: String, email: String , addDogs:[ID], removeDogs:[ID] , addBooks:[ID], removeBooks:[ID], skipAssociationsExistenceChecks:Boolean = false ): Person!

`

module.exports.person_model = `
    static associate(models) {

        Person.hasMany(models.dog, {
            as: 'dogs',
            foreignKey: 'personId'
        });

        Person.belongsToMany(models.book, {
            as: 'books',
            foreignKey: 'personId',
            through: 'books_to_people',
            onDelete: 'CASCADE'
        });
    }
`
