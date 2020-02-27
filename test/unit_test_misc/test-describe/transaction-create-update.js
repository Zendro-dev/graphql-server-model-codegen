module.exports.update_transcript_count = `
static updateOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
        .then(async (valSuccess) => {
          try{

            let result = await sequelize.transaction( async(t) =>{
                let promises_associations = [];
                let item = await super.findByPk(input.id, {transaction:t});
                let updated = await item.update(input, {transaction:t});

                if (input.addIndividual) {
                    let wrong_ids = await helper.checkExistence(input.addIndividual, models.individual);
                    if (wrong_ids.length > 0) {
                        throw new Error(\`Ids \${wrong_ids.join(",")} in model individual were not found.\`);
                    } else {
                        promises_associations.push(updated.setIndividual(input.addIndividual, {transaction:t}));
                    }
                } else if (input.addIndividual === null) {
                    promises_associations.push(updated.setIndividual(input.addIndividual, {transaction:t}));
                }

                if (input.removeIndividual) {
                    let individual = await item.getIndividual();
                    if (individual && input.removeIndividual === \`\${individual.id}\`) {
                        promises_associations.push(updated.setIndividual(null, {transaction:t}));
                    } else {
                        throw new Error("The association you're trying to remove it doesn't exists");
                    }
                }

                return Promise.all(promises_associations).then(() => {
                    return updated;
                });
            });

            return result;
          }catch(error){
            throw error;
          }
        });
}

`
