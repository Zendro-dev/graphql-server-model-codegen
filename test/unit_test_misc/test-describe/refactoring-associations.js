module.exports.count_associations = `

/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let accession = await resolvers.readOneAccession({
        accession_id: id
    }, context);
    //check that record actually exists
    if (accession === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];

    promises_to_many.push(accession.countFilteredIndividuals({}, context));
    promises_to_many.push(accession.countFilteredMeasurements({}, context));
    promises_to_one.push(accession.location({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated;
}

`

module.exports.validate_for_deletion = `
/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context){
  if( await countAllAssociatedRecords(id, context) > 0 ){
    throw new Error(\`Accession with accession_id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
  }

  return true;
}
`

module.exports.delete_resolver = `
/**
     * deleteAccession - Check user authorization and delete a record with the specified accession_id in the accession_id argument.
     *
     * @param  {number} {accession_id}    accession_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteAccession: async function({
        accession_id
    }, context) {
        try {
            if (await checkAuthorization(context, 'Accession', 'delete') === true) {
                if (await validForDeletion(accession_id, context)) {
                    return accession.deleteOne(accession_id);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            handleError(error);
        }
    },
`

module.exports.valid_for_deletion_ddm = `
/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context){

  if( await countAllAssociatedRecords(id, context) > 0 ){
    throw new Error(\`Accession with accession_id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
  }

  if (context.benignErrors.length > 0) {
    throw new Error('Errors occurred when counting associated records. No deletion permitted for reasons of security.');
  }

  return true;
}
`

module.exports.handleAssociations = `
/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
accession.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];
        if (helper.isNonEmptyArray(input.addIndividuals)) {
            promises.push(this.add_individuals(input, context));
        }
        if (helper.isNonEmptyArray(input.addMeasurements)) {
            promises.push(this.add_measurements(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.addLocation)) {
            promises.push(this.add_location(input, context));
        }
        if (helper.isNonEmptyArray(input.removeIndividuals)) {
            promises.push(this.remove_individuals(input, context));
        }
        if (helper.isNonEmptyArray(input.removeMeasurements)) {
            promises.push(this.remove_measurements(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.removeLocation)) {
            promises.push(this.remove_location(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}
`

module.exports.add_assoc_to_one_fieldMutation_resolver = `
/**
 * add_location - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
accession.prototype.add_location = async function(input) {
    await accession.add_locationId(this.getIdValue(), input.addLocation);
    this.locationId = input.addLocation;
}
`

module.exports.remove_assoc_to_one_fieldMutation_resolver = `
/**
 * remove_location - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
accession.prototype.remove_location = async function(input) {
    if (input.removeLocation == this.locationId) {
        await accession.remove_locationId(this.getIdValue(), input.removeLocation);
        this.locationId = null;
    }
}
`
module.exports.add_assoc_to_one_fieldMutation_resolver_fK_in_target = `
/**
 * add_dog - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
researcher.prototype.add_dog = async function(input) {
    await models.dog.add_researcherId(input.addDog, this.getIdValue());
}

`

module.exports.remove_assoc_to_one_fieldMutation_resolver_fK_in_target = `
/**
 * remove_dog - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
researcher.prototype.remove_dog = async function(input) {
    await models.dog.remove_researcherId(input.removeDog, this.getIdValue());
}

`

module.exports.add_assoc_to_many_fieldMutation_resolver = `
/**
 * add_individuals - field Mutation for to_many associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
accession.prototype.add_individuals = async function(input) {
    let results = [];
    for await (associatedRecordId of input.addIndividuals) {
        results.push(models.individual.add_accessionId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}
`

module.exports.remove_assoc_to_many_fieldMutation_resolver = `
/**
 * remove_individuals - field Mutation for to_many associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
accession.prototype.remove_individuals = async function(input) {
    let results = [];
    for await (associatedRecordId of input.removeIndividuals) {
        results.push(models.individual.remove_accessionId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}
`

module.exports._addAssoc_to_one_fieldMutation_sql_model = `
/**
 * add_locationId - field Mutation (model-layer) for to_one associationsArguments to add
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 */
static async add_locationId(accession_id, locationId) {
    let updated = await sequelize.transaction(async transaction => {
        try {
            return Accession.update({
                locationId: locationId
            }, {
                where: {
                    accession_id: accession_id
                }
            }, {
                transaction: transaction
            })
        } catch (error) {
            throw error;
        }
    });
    return updated;
}
`
module.exports._removeAssoc_to_one_fieldMutation_sql_model = `
/**
 * remove_locationId - field Mutation (model-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 */
static async remove_locationId(accession_id, locationId) {
    let updated = await sequelize.transaction(async transaction => {
        try {
            return Accession.update({
                locationId: null
            }, {
                where: {
                    accession_id: accession_id,
                    locationId: locationId
                }
            }, {
                transaction: transaction
            })
        } catch (error) {
            throw error;
        }
    });
    return updated;
}
`
module.exports.to_one_add =`
/**
 * add_location - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
accession.prototype.add_location = async function(input) {
    await accession.add_locationId(this.getIdValue(), input.addLocation);
    this.locationId = input.addLocation;
}
`

module.exports.to_one_remove = `
/**
 * remove_location - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
accession.prototype.remove_location = async function(input) {
   if (input.removeLocation == this.locationId) {
      await accession.remove_locationId(this.getIdValue(), input.removeLocation);
      this.locationId = null;
    }
}
`

module.exports.to_many_add = `
/**
 * add_individuals - field Mutation for to_many associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
accession.prototype.add_individuals = async function(input) {
    let results = [];
    for await (associatedRecordId of input.addIndividuals) {
      results.push(models.individual.add_accessionId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}
`

module.exports.to_many_remove = `
/**
 * remove_individuals - field Mutation for to_many associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
accession.prototype.remove_individuals = async function(input) {
    let results = [];
    for await (associatedRecordId of input.removeIndividuals) {
        results.push(models.individual.remove_accessionId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}
`

module.exports.add_assoc_ddm_model = `
/**
* add_locationId - field Mutation (model-layer) for to_one associationsArguments to add
*
* @param {Id}   accession_id   IdAttribute of the root model to be updated
* @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
*/
static async add_locationId(accession_id, locationId) {
let responsibleAdapter = this.adapterForIri(accession_id);
return await adapters[responsibleAdapter].add_locationId(accession_id, locationId);
}
`

module.exports.remove_assoc_ddm_model = `
/**
 * remove_locationId - field Mutation (model-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 */
static async remove_locationId(accession_id, locationId) {
  let responsibleAdapter = this.adapterForIri(accession_id);
  return await adapters[responsibleAdapter].remove_locationId(accession_id, locationId);
}
`

module.exports.to_one_remove_sql_adapter =  `
/**
 * remove_locationId - field Mutation (adapter-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 */
static async remove_locationId(accession_id, locationId) {
    let updated = await sequelize.transaction(async transaction => {
        try {
          return super.update({locationId: null},{where: {accession_id: accession_id, locationId: locationId}}, {transaction: transaction})
        } catch (error) {
            throw error;
        }
    });
    return updated;
}
`

module.exports.to_one_add_sql_adapter = `
/**
* add_locationId - field Mutation (adapter-layer) for to_one associationsArguments to add
*
* @param {Id}   accession_id   IdAttribute of the root model to be updated
* @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
*/
static async add_locationId(accession_id, locationId) {
   let updated = await sequelize.transaction(async transaction => {
       try {
         return super.update({locationId: locationId},{where: {accession_id: accession_id}}, {transaction: transaction})
       } catch (error) {
           throw error;
       }
   });
   return updated;
}
`

module.exports.to_one_add_cenz_adapter = `
/**
* add_locationId - field Mutation (adapter-layer) for to_one associationsArguments to add
*
* @param {Id}   accession_id   IdAttribute of the root model to be updated
* @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
*/
static async add_locationId(accession_id, locationId){
let query = \`
  mutation
    updateAccession{
      updateAccession(
        accession_id:"\${accession_id}"
        addLocation:"\${locationId}"
        skipAssociationsExistenceChecks: true
      ){
        accession_id
        locationId
      }
    }\`
    return axios.post(remoteCenzontleURL, {
        query: query
    }).then(res => {
        //check
        if (res && res.data && res.data.data) {
            return res.data.data.updateAccession;
        } else {
            throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
        }
    }).catch(error => {
        error['url'] = remoteCenzontleURL;
        handleError(error);
    });
}
`

module.exports.to_one_remove_cenz_adapter = `
/**
 * remove_locationId - field Mutation (adapter-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 */
static async remove_locationId(accession_id, locationId){
  let query = \`
    mutation
      updateAccession{
        updateAccession(
          accession_id:"\${accession_id}"
          removeLocation:"\${locationId}"
          skipAssociationsExistenceChecks: true
        ){
          accession_id
          locationId
        }
      }\`
      return axios.post(remoteCenzontleURL, {
          query: query
      }).then(res => {
          //check
          if (res && res.data && res.data.data) {
              return res.data.data.updateAccession;
          } else {
              throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
          }
      }).catch(error => {
          error['url'] = remoteCenzontleURL;
          handleError(error);
      });
}
`
module.exports.add_one_resolver = `
/**
 * addAccession - Check user authorization and creates a new record with data specified in the input argument
 *
 * @param  {object} input   Info of each field to create the new record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         New record created
 */
 addAccession: async function(input, context) {
     //check: input has idAttribute
     if (!input.accession_id) {
         throw new Error(\`Illegal argument. Provided input requires attribute 'accession_id'.\`);
     }
     //check: adapters auth
     try {
         let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'create');
         if (authorizationCheck === true) {
           let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef,['read', 'update'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if(!input.skipAssociationsExistenceChecks) {
              await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
           let createdRecord = await accession.addOne(inputSanitized);
           await createdRecord.handleAssociations(inputSanitized, context);
           return createdRecord;
         } else { //adapter not auth
             throw new Error("You don't have authorization to perform this action on adapter");
         }
     } catch (error) {
         handleError(error);
     }
 }
`

module.exports.update_one_resolver = `
/**
 * updateAccession - Check user authorization and update the record specified in the input argument
 *
 * @param  {object} input   record to update and new info to update
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         Updated record
 */
 updateAccession: async function(input, context) {
   //check: input has idAttribute
   if (! input.accession_id) {
     throw new Error(\`Illegal argument. Provided input requires attribute 'accession_id'.\`);
   }
      //check: adapters auth
       try {
           let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'update');
           if (authorizationCheck === true) {
             let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
              await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef,['read', 'update'], models);
              await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
              if(!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
              }
               let updatedRecord = await accession.updateOne(inputSanitized);
               await updatedRecord.handleAssociations(inputSanitized, context);
               return updatedRecord;
           } else {//adapter not auth
               throw new Error("You don't have authorization to perform this action on adapter");
           }
       } catch (error) {
           handleError(error);
       }
   }
`

module.exports.add_one_cenz_adapter = `
static addOne(input) {
    let query = \`
    mutation addAccession(
      $accession_id:ID!
      $collectors_name:String
      $collectors_initials:String
      $sampling_date:Date
    ){
      addAccession(
      accession_id:$accession_id
      collectors_name:$collectors_name
      collectors_initials:$collectors_initials
      sampling_date:$sampling_date){
        accession_id
        collectors_name
        collectors_initials
        sampling_date
        locationId
      }
    }\`;
    return axios.post(remoteCenzontleURL, {
        query: query,
        variables: input
    }).then(res => {
        //check
        if (res && res.data && res.data.data) {
            return res.data.data.addAccession;
        } else {
            throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
        }
    }).catch(error => {
        error['url'] = remoteCenzontleURL;
        handleError(error);
    });

}
`

module.exports.update_one_cenz_adapter = `
static updateOne(input) {
    let query = \`
      mutation
        updateAccession(
          $accession_id:ID!
          $collectors_name:String
          $collectors_initials:String
          $sampling_date:Date){
          updateAccession(
            accession_id:$accession_id
            collectors_name:$collectors_name
            collectors_initials:$collectors_initials
            sampling_date:$sampling_date
          ){
            accession_id
            collectors_name
            collectors_initials
            sampling_date
            locationId
          }
        }\`
    return axios.post(remoteCenzontleURL, {
        query: query,
        variables: input
    }).then(res => {
        //check
        if (res && res.data && res.data.data) {
            return res.data.data.updateAccession;
        } else {
            throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
        }
    }).catch(error => {
        error['url'] = remoteCenzontleURL;
        handleError(error);
    });
}
`
