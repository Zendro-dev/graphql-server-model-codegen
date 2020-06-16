module.exports.update_transcript_count = `
static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {
                    let result = await sequelize.transaction(async (t) => {
                      let updated = await super.update( input, { where:{ [this.idAttribute()] : input[this.idAttribute()] }, returning: true } );
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
