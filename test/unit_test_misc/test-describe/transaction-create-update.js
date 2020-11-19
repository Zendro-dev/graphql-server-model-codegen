module.exports.update_transcript_count = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
    input = transcript_count.preWriteCast(input)
    try {
        let result = await this.sequelize.transaction(async (t) => {
            let to_update = await super.findByPk(input[this.idAttribute()]);
            if(to_update === null){
                throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
            }

            let updated = await to_update.update(input, {transaction: t  } );
            return updated;
        });
        transcript_count.postReadCast(result.dataValues)
        transcript_count.postReadCast(result._previousDataValues)
        return result;
    } catch (error) {
        throw error;
    }
    }
`
