module.exports.person_schema = `
addPerson( firstName: String, lastName: String, email: String , addDogs:[ID], addBooks:[ID] ): Person!
updatePerson(id: ID!, firstName: String, lastName: String, email: String , addDogs:[ID], removeDogs:[ID] , addBooks:[ID], removeBooks:[ID] ): Person!

`

module.exports.person_model = `
.then(async item => {
    let promises_associations = [];
    if (input.addDogs) {
      promises_associations.push(  item.setDogs(input.addDogs));
    }
    if (input.addBooks) {
        promises_associations.push( item.setBooks(input.addBooks));
    }
    return  Promise.all(promises_associations).then( () => { return item } );
}).catch(error => {return error});
`
