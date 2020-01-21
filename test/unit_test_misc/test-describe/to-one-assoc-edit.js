module.exports.dog_schema = `
addDog( name: String, breed: String, personId: Int, addOwner: ID   ): Dog!
updateDog(id: ID!, name: String, breed: String, personId: Int, addOwner: ID,removeOwner: ID): Dog!
`

module.exports.person_addOne_model = `
static addOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
        .then((valSuccess) => {
            return super.create(input)
                .then(item => {

                    let promises_associations = [];
                    if(input.addUnique_pet){
                      promises_associations.push( item.setUnique_pet(input.addUnique_pet) );
                    }
                    return  Promise.all(promises_associations).then( () => { return item } );
                });
        }).catch((err) => {
            return err
        })
}
`

module.exports.person_update_model = `
static updateOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
        .then((valSuccess) => {
            return super.findByPk(input.id)
                .then(async item => {
                    let promises_associations = [];

                    if(input.addUnique_pet || input.addUnique_pet === null ){
                        promises_associations.push( item.setUnique_pet(input.addUnique_pet) );
                    }

                    let unique_pet = await item.getUnique_pet();
                    if( unique_pet && input.removeUnique_pet === unique_pet.id ){
                      promises_associations.push(item.setUnique_pet(null) );
                    }

                    return  Promise.all(promises_associations).then( () => { return item.update(input); } );
                });
        }).catch((err) => {
            return err
        })
}
`
