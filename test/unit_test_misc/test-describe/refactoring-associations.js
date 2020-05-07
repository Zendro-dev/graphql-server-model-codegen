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
    deleteAccession: function({
        accession_id
    }, context) {
        return checkAuthorization(context, 'Accession', 'delete').then(async authorization => {
            if (authorization === true) {
                if (await validForDeletion(accession_id, context)) {
                    return accession.deleteOne(accession_id);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
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
