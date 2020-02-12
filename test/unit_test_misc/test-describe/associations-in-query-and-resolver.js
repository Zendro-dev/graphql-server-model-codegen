module.exports.person_schema = `
addPerson( firstName: String, lastName: String, email: String , addDogs:[ID], addBooks:[ID] ): Person!
updatePerson(id: ID!, firstName: String, lastName: String, email: String , addDogs:[ID], removeDogs:[ID] , addBooks:[ID], removeBooks:[ID] ): Person!

`

module.exports.person_model = `
    let promises_associations = [];
    if (input.addDogs) {
      let wrong_ids = await helper.checkExistence(input.addDogs, models.dog);
      if(wrong_ids.length > 0){
        throw new Error(\`Ids \${wrong_ids.join(",")} in model dog were not found.\`);
      }else{
        promises_associations.push(  item.setDogs(input.addDogs, {transaction:t}));
      }

    }
    if (input.addBooks) {
      let wrong_ids = await helper.checkExistence(input.addBooks, models.book);
      if(wrong_ids.length > 0){
        throw new Error(\`Ids \${wrong_ids.join(",")} in model book were not found.\`);
      }else{
        promises_associations.push( item.setBooks(input.addBooks, {transaction:t}));
      }
    }
    return  Promise.all(promises_associations).then( () => { return item } );
`
