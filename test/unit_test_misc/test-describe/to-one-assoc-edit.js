module.exports.dog_schema = `
addDog( name: String, breed: String, addOwner: ID   ): Dog!
updateDog(id: ID!, name: String, breed: String, addOwner: ID,removeOwner: ID): Dog!
`

module.exports.person_addOne_model = `
static addOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
        .then(async (valSuccess) => {

          try{
            const result = await sequelize.transaction( async (t) =>{

              let item = await super.create(input, {transaction : t});

              let promises_associations = [];
              if (input.addUnique_pet) {
                let wrong_ids = await helper.checkExistence(input.addUnique_pet, models.dog);
                if(wrong_ids.length > 0 ){
                  throw new Error(\`Ids \${wrong_ids.join(",")} in model dog were not found.\`);
                }else{
                  promises_associations.push(item.setUnique_pet(input.addUnique_pet));
                }
              }

              return Promise.all(promises_associations).then(() => {return item});
            });

           return result;
          }catch(error){
            throw error;
          }

        });
}
`

module.exports.person_update_model = `
static updateOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
        .then((valSuccess) => {
            return super.findByPk(input.id)
                .then(async item => {
                    let promises_associations = [];

                    if(input.addUnique_pet ){
                      let wrong_ids = await helper.checkExistence(input.addUnique_pet, models.dog);
                      if(wrong_ids.length > 0 ){
                        throw new Error(\`Ids \${wrong_ids.join(",")} in model dog were not found.\`);
                      }else{
                        promises_associations.push(item.setUnique_pet(input.addUnique_pet));
                      }
                    }else if(input.addUnique_pet === null){
                      promises_associations.push( item.setUnique_pet(input.addUnique_pet) );
                    }

                    if(input.removeUnique_pet ){
                        let unique_pet = await item.getUnique_pet();
                        if (unique_pet && input.removeUnique_pet === unique_pet.id) {
                            promises_associations.push(item.setUnique_pet(null));
                        }else{
                          throw new Error("The association you're trying to remove it doesn't exists");
                        }
                    }

                    return  Promise.all(promises_associations).then( () => { return item.update(input); } );
                });
        });
}
`
