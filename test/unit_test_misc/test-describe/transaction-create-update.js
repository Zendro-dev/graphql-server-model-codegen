module.exports.update_transcript_count = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
    input = transcript_count.preWriteCast(input)
    try {
        let result = await this.sequelize.transaction(async (t) => {
          let updated = await super.update( input, { where:{ [this.idAttribute()] : input[this.idAttribute()] }, returning: true, transaction: t  } );
          return updated;
        });
        if(result[0] === 0){
          throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
        }
        transcript_count.postReadCast(result[1][0].dataValues)
        transcript_count.postReadCast(result[1][0]._previousDataValues)
        return result[1][0];
    } catch (error) {
        throw error;
    }
    }
`
