module.exports.dog_schema = `
addDog( name: String, breed: String, addOwner: ID, skipAssociationsExistenceChecks:Boolean = false   ): Dog!
updateDog(id: ID!, name: String, breed: String, addOwner: ID,removeOwner: ID, skipAssociationsExistenceChecks:Boolean = false): Dog!
`

module.exports.person_addOne_model = `
static addOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then(async (valSuccess) => {
                try {
                    const result = await sequelize.transaction(async (t) => {
                        let item = await super.create(input, {
                            transaction: t
                        });
                        return item;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }
`

module.exports.person_update_model = `
static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {
                    let result = await sequelize.transaction(async (t) => {
                      let updated = await super.update( input, { where:{ [this.idAttribute()] : input[this.idAttribute()] }, returning: true, transaction: t  } );
                      return updated;
                    });
                    if(result[0] === 0){
                      throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
                    }
                    return result[1][0];
                } catch (error) {
                    throw error;
                }
            });
    }
`
