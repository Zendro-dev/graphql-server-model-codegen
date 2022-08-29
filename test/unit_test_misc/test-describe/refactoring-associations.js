module.exports.count_associations = `

/**
 * countAssociatedRecordsWithRejectReaction - Count associated records with reject deletion action
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
 async function countAssociatedRecordsWithRejectReaction(id, context) {

    let accession = await resolvers.readOneAccession({
        accession_id: id
    }, context);
    //check that record actually exists
    if (accession === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];
    let get_to_many_associated_fk = 0;
    let get_to_one_associated_fk = 0;

    promises_to_many.push(accession.countFilteredIndividuals({}, context));
    promises_to_many.push(accession.countFilteredMeasurements({}, context));
    promises_to_one.push(accession.location({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated_fk + get_to_many_associated + get_to_one_associated_fk;
}

`;

module.exports.validate_for_deletion = `
/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context){
  if (await countAssociatedRecordsWithRejectReaction(id, context) > 0) {
    throw new Error(\`Accession with accession_id \${id} has associated records with 'reject' reaction and is NOT valid for deletion. Please clean up before you delete.\`);
  }
  return true;
}
`;

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
        if (await checkAuthorization(context, 'Accession', 'delete') === true) {
            if (await validForDeletion(accession_id, context)) {
                await updateAssociations(accession_id, context);
                return accession.deleteOne(accession_id, context.benignErrors, context.request.headers.authorization);
            }
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;

module.exports.valid_for_deletion_ddm = `
/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
 async function validForDeletion(id, context) {
  if (await countAssociatedRecordsWithRejectReaction(id, context) > 0) {
    throw new Error(\`Accession with accession_id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
  }

  return true;
}
`;

module.exports.handleAssociations = `
/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.handleAssociations = async function(input, benignErrorReporter, token) {
      let promises_add = [];
      if (helper.isNonEmptyArray(input.addIndividuals)) {
          promises_add.push(this.add_individuals(input, benignErrorReporter, token));
      }
      if (helper.isNonEmptyArray(input.addMeasurements)) {
          promises_add.push(this.add_measurements(input, benignErrorReporter, token));
      }
      if (helper.isNotUndefinedAndNotNull(input.addLocation)) {
          promises_add.push(this.add_location(input, benignErrorReporter, token));
      }
      await Promise.all(promises_add);

      let promises_remove = [];
      if (helper.isNonEmptyArray(input.removeIndividuals)) {
          promises_remove.push(this.remove_individuals(input, benignErrorReporter, token));
      }
      if (helper.isNonEmptyArray(input.removeMeasurements)) {
          promises_remove.push(this.remove_measurements(input, benignErrorReporter, token));
      }
      if (helper.isNotUndefinedAndNotNull(input.removeLocation)) {
          promises_remove.push(this.remove_location(input, benignErrorReporter, token));
      }
      await Promise.all(promises_remove);

}
`;

module.exports.add_assoc_to_one_fieldMutation_resolver = `
/**
 * add_location - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.add_location = async function(input, benignErrorReporter, token) {
    await accession.add_locationId(this.getIdValue(), input.addLocation, benignErrorReporter, token);
    this.locationId = input.addLocation;
}
`;

module.exports.remove_assoc_to_one_fieldMutation_resolver = `
/**
 * remove_location - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
*/
accession.prototype.remove_location = async function(input, benignErrorReporter, token) {
    if (input.removeLocation == this.locationId) {
        await accession.remove_locationId(this.getIdValue(), input.removeLocation, benignErrorReporter, token);
        this.locationId = null;
    }
}
`;
module.exports.add_assoc_to_one_fieldMutation_resolver_fK_in_target = `
/**
 * add_dog - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
researcher.prototype.add_dog = async function(input, benignErrorReporter, token) {
    await models.dog.add_researcherId(input.addDog, this.getIdValue(), benignErrorReporter, token);
}

`;

module.exports.remove_assoc_to_one_fieldMutation_resolver_fK_in_target = `
/**
 * remove_dog - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
researcher.prototype.remove_dog = async function(input, benignErrorReporter, token) {
    await models.dog.remove_researcherId(input.removeDog, this.getIdValue(), benignErrorReporter, token);
}

`;

module.exports.add_assoc_to_many_fieldMutation_resolver = `
/**
 * add_individuals - field Mutation for to_many associations to add
 * uses bulkAssociate to efficiently update associations
 *
 * @param {object} input   Info of input Ids to add  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.add_individuals = async function(input, benignErrorReporter, token) {
    let bulkAssociationInput = input.addIndividuals.map(associatedRecordId => {
        return {
            accessionId: this.getIdValue(),
            [models.individual.idAttribute()]: associatedRecordId
        }
    });
    await models.individual.bulkAssociateIndividualWithAccessionId(bulkAssociationInput, benignErrorReporter, token);
}
`;

module.exports.remove_assoc_to_many_fieldMutation_resolver = `
/**
 * remove_individuals - field Mutation for to_many associations to remove
 * uses bulkAssociate to efficiently update associations
 *
 * @param {object} input   Info of input Ids to remove  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.remove_individuals = async function(input, benignErrorReporter, token) {
    let bulkAssociationInput = input.removeIndividuals.map(associatedRecordId => {
        return {
            accessionId: this.getIdValue(),
            [models.individual.idAttribute()]: associatedRecordId
        }
    });
    await models.individual.bulkDisAssociateIndividualWithAccessionId(bulkAssociationInput, benignErrorReporter, token);
}
`;

module.exports._addAssoc_to_one_fieldMutation_sql_model = `
static async add_locationId(accession_id, locationId, benignErrorReporter) {
  try {
    let updated = await accession.update({
        locationId: locationId
    }, {
        where: {
            accession_id: accession_id
        }
    });
    return updated[0];
  } catch (error) {
      benignErrorReporter.push({
          message: error
      });
  }
}
`;
module.exports._removeAssoc_to_one_fieldMutation_sql_model = `
static async remove_locationId(accession_id, locationId, benignErrorReporter) {
  try {
    let updated = await accession.update({
        locationId: null
    }, {
        where: {
            accession_id: accession_id,
            locationId: locationId
        }
    });
    return updated[0];
  } catch (error) {
      benignErrorReporter.push({
          message: error
      });
  }
}
`;
module.exports.to_one_add = `
/**
 * add_location - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.add_location = async function(input, benignErrorReporter, token) {
    await accession.add_locationId(this.getIdValue(), input.addLocation, benignErrorReporter, token);
    this.locationId = input.addLocation;
}
`;

module.exports.to_one_remove = `
/**
 * remove_location - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.remove_location = async function(input, benignErrorReporter, token) {
   if (input.removeLocation == this.locationId) {
      await accession.remove_locationId(this.getIdValue(), input.removeLocation, benignErrorReporter, token);
      this.locationId = null;
    }
}
`;

module.exports.to_many_add = `
/**
 * add_individuals - field Mutation for to_many associations to add
 * uses bulkAssociate to efficiently update associations
 *
 * @param {object} input   Info of input Ids to add  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.add_individuals = async function(input, benignErrorReporter, token) {
    let bulkAssociationInput = input.addIndividuals.map(associatedRecordId => {
        return {
            accessionId: this.getIdValue(),
            [models.individual.idAttribute()]: associatedRecordId
        }
    });
    await models.individual.bulkAssociateIndividualWithAccessionId(bulkAssociationInput, benignErrorReporter, token);
}
`;

module.exports.to_many_remove = `
/**
 * remove_individuals - field Mutation for to_many associations to remove
 * uses bulkAssociate to efficiently update associations
 *
 * @param {object} input   Info of input Ids to remove  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
accession.prototype.remove_individuals = async function(input, benignErrorReporter, token) {
    let bulkAssociationInput = input.removeIndividuals.map(associatedRecordId => {
        return {
            accessionId: this.getIdValue(),
            [models.individual.idAttribute()]: associatedRecordId
        }
    });
    await models.individual.bulkDisAssociateIndividualWithAccessionId(bulkAssociationInput, benignErrorReporter, token);
}
`;

module.exports.add_assoc_ddm_model = `
/**
 * add_locationId - field Mutation (model-layer) for to_one associationsArguments to add
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 * @param {boolean} handle_inverse Handle inverse association
 */
static async add_locationId(accession_id, locationId, benignErrorReporter, token, handle_inverse) {
    try {
        let responsibleAdapter = this.adapterForIri(accession_id);
        return await adapters[responsibleAdapter].add_locationId(accession_id, locationId, benignErrorReporter, token, handle_inverse);
    } catch (error) {
        benignErrorReporter.push({
            message: error,
        });
    }
}
`;

module.exports.remove_assoc_ddm_model = `
/**
 * remove_locationId - field Mutation (model-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 * @param {boolean} handle_inverse Handle inverse association
 */
static async remove_locationId(accession_id, locationId, benignErrorReporter, token, handle_inverse) {
    try {
        let responsibleAdapter = this.adapterForIri(accession_id);
        return await adapters[responsibleAdapter].remove_locationId(accession_id, locationId, benignErrorReporter, token, handle_inverse);
    } catch (error) {
        benignErrorReporter.push({
            message: error,
        });
    }
}
`;

module.exports.to_one_remove_sql_adapter = `
static async remove_locationId(accession_id, locationId, benignErrorReporter) {
  try {
    let updated = await super.update({
        locationId: null
    }, {
        where: {
            accession_id: accession_id,
            locationId: locationId
        }
    });
    return updated[0];
  } catch (error) {
      benignErrorReporter.push({
          message: error
      });
  }
}
`;

module.exports.to_one_add_sql_adapter = `
static async add_locationId(accession_id, locationId, benignErrorReporter) {
  try {
    let updated = await super.update({
        locationId: locationId
    }, {
        where: {
            accession_id: accession_id
        }
    });
    return updated[0];
  } catch (error) {
      benignErrorReporter.push({
          message: error
      });
  }
}
`;

module.exports.to_one_add_zendro_adapter = `
/**
* add_locationId - field Mutation (adapter-layer) for to_one associationsArguments to add
*
* @param {Id}   accession_id   IdAttribute of the root model to be updated
* @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
* @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
* @param {string} token The token used for authorization
*/
static async add_locationId(accession_id, locationId, benignErrorReporter, token){
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

    try {
      // Send an HTTP request to the remote server
      let opts = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql",
        },
      };
      if (token) {
        opts.headers["authorization"] = token;
      }
      let response = await axios.post(
        remoteZendroURL, 
        {
          query: query,
        },
        opts
      );
      //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
      if(helper.isNonEmptyArray(response.data.errors)) {
        benignErrorReporter.push(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
      }

      // STATUS-CODE is 200
      // NO ERROR as such has been detected by the server (Express)
      // check if data was send
      if(response && response.data && response.data.data) {
          return 1;
      } else {
        benignErrorReporter.push({
          message: \`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`,
        });
      }
    } catch(error) {
      //handle caught errors
      benignErrorReporter.push(errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL));
    }
}
`;

module.exports.to_one_remove_zendro_adapter = `
/**
 * remove_locationId - field Mutation (adapter-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   accession_id   IdAttribute of the root model to be updated
 * @param {Id}   locationId Foreign Key (stored in "Me") of the Association to be updated.
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @param {string} token The token used for authorization
 */
static async remove_locationId(accession_id, locationId, benignErrorReporter, token){
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

    try {
      // Send an HTTP request to the remote server
      let opts = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql",
        },
      };
      if (token) {
        opts.headers["authorization"] = token;
      }
      let response = await axios.post(
        remoteZendroURL, 
        {
          query: query,
        },
        opts
      );
      //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
      if(helper.isNonEmptyArray(response.data.errors)) {
        benignErrorReporter.push(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
      }
      // STATUS-CODE is 200
      // NO ERROR as such has been detected by the server (Express)
      // check if data was send
      if(response && response.data && response.data.data) {
        return 1;
      } else {
        benignErrorReporter.push({
          message: \`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`,
        });
      }
    } catch(error) {
      //handle caught errors
      benignErrorReporter.push(errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL));
    }
}
`;
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
         let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'create');
         if (authorizationCheck === true) {
           let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef,['read', 'update'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if(!input.skipAssociationsExistenceChecks) {
              await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
           let createdRecord = await accession.addOne(inputSanitized, context.benignErrors, context.request.headers.authorization);
           await createdRecord.handleAssociations(inputSanitized, context.benignErrors, context.request.headers.authorization);
           return createdRecord;
         } else { //adapter not auth
             throw new Error("You don't have authorization to perform this action on adapter");
         }
 }
`;

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
           let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'update');
           if (authorizationCheck === true) {
             let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
              await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef,['read', 'update'], models);
              await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
              if(!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
              }
               let updatedRecord = await accession.updateOne(inputSanitized, context.benignErrors, context.request.headers.authorization);
               await updatedRecord.handleAssociations(inputSanitized, context.benignErrors, context.request.headers.authorization);
               return updatedRecord;
           } else {//adapter not auth
               throw new Error("You don't have authorization to perform this action on adapter");
           }
   }
`;

module.exports.add_one_zendro_adapter = `
static async addOne(input, benignErrorReporter, token) {
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
    try {
      // Send an HTTP request to the remote server
      let opts = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql",
        },
      };
      if (token) {
        opts.headers["authorization"] = token;
      }
      let response = await axios.post(
        remoteZendroURL, 
        {
          query: query,
          variables: input,
        },
        opts
      );
      //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
      if(helper.isNonEmptyArray(response.data.errors)) {
        benignErrorReporter.push(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
      }
      if (response && response.data && response.data.data) {
        return response.data.data.addAccession;
      } else {
        throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
      }
    } catch(error) {
      //handle caught errors
      errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }

}
`;

module.exports.update_one_zendro_adapter = `
static async updateOne(input, benignErrorReporter, token) {
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
    try {
      // Send an HTTP request to the remote server
      let opts = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql",
        },
      };
      if (token) {
        opts.headers["authorization"] = token;
      }
      let response = await axios.post(
        remoteZendroURL, 
        {
          query: query,
          variables: input,
        },
        opts
      );
      //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
      if(helper.isNonEmptyArray(response.data.errors)) {
        benignErrorReporter.push(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
      }
      if (response && response.data && response.data.data) {
        return response.data.data.updateAccession;
      } else {
        throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
      }
    } catch(error) {
      //handle caught errors
      errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
}
`;
