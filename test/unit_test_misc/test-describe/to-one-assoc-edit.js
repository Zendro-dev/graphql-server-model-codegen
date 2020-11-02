module.exports.dog_schema = `
addDog( name: String, breed: String, addOwner: ID, skipAssociationsExistenceChecks:Boolean = false   ): Dog!
updateDog(id: ID!, name: String, breed: String, addOwner: ID,removeOwner: ID, skipAssociationsExistenceChecks:Boolean = false): Dog!
`

module.exports.person_addOne_model = `
static async addOne(input) {
    //validate input
      await validatorUtil.validateData('validateForCreate', this, input);
      input = Person.preWriteCast(input)
      try {
          const result = await this.sequelize.transaction(async (t) => {
              let item = await super.create(input, {
                  transaction: t
              });
              return item;
          });
          Person.postReadCast(result.dataValues)
          Person.postReadCast(result._previousDataValues)
          return result;
      } catch (error) {
          throw error;
      }
  }
`

module.exports.person_update_model = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
    input = Person.preWriteCast(input)
    try {
        let result = await this.sequelize.transaction(async (t) => {
          let updated = await super.update( input, { where:{ [this.idAttribute()] : input[this.idAttribute()] }, returning: true, transaction: t  } );
          return updated;
        });
        if(result[0] === 0){
          throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
        }
        Person.postReadCast(result[1][0].dataValues)
        Person.postReadCast(result[1][0]._previousDataValues)
        return result[1][0];
    } catch (error) {
        throw error;
    }
}
`
