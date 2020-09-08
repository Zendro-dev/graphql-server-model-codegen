module.exports.update_transcript_count = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
    try {
        let result = await this.sequelize.transaction(async (t) => {
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
    }
`
