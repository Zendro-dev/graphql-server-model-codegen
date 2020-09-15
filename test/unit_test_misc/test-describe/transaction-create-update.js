module.exports.update_transcript_count = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
    try {
        let result = await this.sequelize.transaction(async (t) => {
            let to_update = await super.findByPk(input[this.idAttribute()]);
            if(to_update === null){
                throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
            }

            let updated = await to_update.update(input, {transaction: t  } );
            return updated;
        });
        return result;
    } catch (error) {
        throw error;
    }
    }
`
