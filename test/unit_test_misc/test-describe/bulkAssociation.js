module.exports.bulkAssociation_schema_mutation = `
type Mutation {                                                                                                                                                                                                  
  addBook(internalBookId: ID!, title: String, genre: String , addAuthor:ID   , skipAssociationsExistenceChecks:Boolean = false): Book!                                                                           
  updateBook(internalBookId: ID!, title: String, genre: String , addAuthor:ID, removeAuthor:ID    , skipAssociationsExistenceChecks:Boolean = false): Book!                                                      
  deleteBook(internalBookId: ID!): String!                                                                                                                                                                       
  bulkAddBookCsv: String!                                                                                                                                                                                        
  bulkAssociateBookWithInternalPersonId(bulkAssociationInput: [bulkAssociationBookWithInternalPersonIdInput], skipAssociationsExistenceChecks:Boolean = false): String!                                                              
  bulkDisAssociateBookWithInternalPersonId(bulkAssociationInput: [bulkAssociationBookWithInternalPersonIdInput], skipAssociationsExistenceChecks:Boolean = false): String!                                                           
} 
`

module.exports.bulkAssociation_schema_inputType = `
input bulkAssociationBookWithInternalPersonIdInput{
  internalBookId: ID!
  internalPersonId: ID!
}
`


module.exports.bulkAssociation_resolver_add = `
/**
 * bulkAssociateBookWithInternalPersonId - bulkAssociaton resolver of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to add , 
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {string} returns message on success
 */
bulkAssociateBookWithInternalPersonId: async function(bulkAssociationInput, context) {
    let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
    //if specified, check existence of the unique given ids
    if (!bulkAssociationInput.skipAssociationsExistenceChecks) {
        await helper.validateExistence(helper.unique(bulkAssociationInput.bulkAssociationInput.map(({
            internalPersonId
        }) => internalPersonId)), models.person);
        await helper.validateExistence(helper.unique(bulkAssociationInput.bulkAssociationInput.map(({
            internalBookId
        }) => internalBookId)), book);
    }
    return await book.bulkAssociateBookWithInternalPersonId(bulkAssociationInput.bulkAssociationInput, benignErrorReporter);
}
`

module.exports.bulkAssociation_resolver_remove = `
/**
 * bulkDisAssociateBookWithInternalPersonId - bulkDisAssociaton resolver of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to remove , 
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {string} returns message on success
 */
bulkDisAssociateBookWithInternalPersonId: async function(bulkAssociationInput, context) {
    let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
    // if specified, check existence of the unique given ids
    if (!bulkAssociationInput.skipAssociationsExistenceChecks) {
        await helper.validateExistence(helper.unique(bulkAssociationInput.bulkAssociationInput.map(({
            internalPersonId
        }) => internalPersonId)), models.person);
        await helper.validateExistence(helper.unique(bulkAssociationInput.bulkAssociationInput.map(({
            internalBookId
        }) => internalBookId)), book);
    }
    return await book.bulkDisAssociateBookWithInternalPersonId(bulkAssociationInput.bulkAssociationInput, benignErrorReporter);
}
`

module.exports.bulkAssociation_model_sql_add = `
/**
 * bulkAssociateBookWithInternalPersonId - bulkAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to add
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkAssociateBookWithInternalPersonId(bulkAssociationInput) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "internalBookId", "internalPersonId");
    var promises = [];
    mappedForeignKeys.forEach(({
        internalPersonId,
        internalBookId
    }) => {
        promises.push(super.update({
            internalPersonId: internalPersonId
        }, {
            where: {
                internalBookId: internalBookId
            }
        }));
    })
    await Promise.all(promises);
    return "Records successfully updated!"
}
`
module.exports.bulkAssociation_model_sql_remove= `
/**
 * bulkDisAssociateBookWithInternalPersonId - bulkDisAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to remove
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkDisAssociateBookWithInternalPersonId(bulkAssociationInput) {
  let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "internalBookId", "internalPersonId");
  var promises = [];
  mappedForeignKeys.forEach(({
      internalPersonId,
      internalBookId
  }) => {
      promises.push(super.update({
          internalPersonId: null
      }, {
          where: {
              internalBookId: internalBookId,
              internalPersonId: internalPersonId
          }
      }));
  })
  await Promise.all(promises);
  return "Records successfully updated!"
}
`

module.exports.bulkAssociation_model_zendro_ddm_adapter_add = `
/**
 * bulkAssociateDogWithVeterinarianId - bulkAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to add
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkAssociateDogWithVeterinarianId(bulkAssociationInput, benignErrorReporter) {
    let query = \`mutation  bulkAssociateDogWithVeterinarianId($bulkAssociationInput: [bulkAssociationDogWithVeterinarianIdInput]){
      bulkAssociateDogWithVeterinarianId(bulkAssociationInput: $bulkAssociationInput, skipAssociationsExistenceChecks: true) 
    }\`
    try {
        // Send an HTTP request to the remote server
        let response = await axios.post(remoteZendroURL, {
            query: query,
            variables: {
                bulkAssociationInput: bulkAssociationInput
            }
        });
        //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
        if (helper.isNonEmptyArray(response.data.errors)) {
            benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
        }
        // STATUS-CODE is 200
        // NO ERROR as such has been detected by the server (Express)
        // check if data was send

        if (response && response.data && response.data.data) {
            return response.data.data.bulkAssociateDogWithVeterinarianId;
        } else {
            throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
        }
    } catch (error) {
        //handle caught errors
        errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
}
`

module.exports.bulkAssociation_model_zendro_ddm_adapter_remove = `
/**
 * bulkDisAssociateDogWithVeterinarianId - bulkDisAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to remove
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkDisAssociateDogWithVeterinarianId(bulkAssociationInput, benignErrorReporter) {
    let query = \`mutation  bulkDisAssociateDogWithVeterinarianId($bulkAssociationInput: [bulkAssociationDogWithVeterinarianIdInput]){
      bulkDisAssociateDogWithVeterinarianId(bulkAssociationInput: $bulkAssociationInput, skipAssociationsExistenceChecks: true) 
    }\`
    try {
        // Send an HTTP request to the remote server
        let response = await axios.post(remoteZendroURL, {
            query: query,
            variables: {
                bulkAssociationInput: bulkAssociationInput
            }
        });
        //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
        if (helper.isNonEmptyArray(response.data.errors)) {
            benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
        }
        // STATUS-CODE is 200
        // NO ERROR as such has been detected by the server (Express)
        // check if data was send

        if (response && response.data && response.data.data) {
            return response.data.data.bulkDisAssociateDogWithVeterinarianId;
        } else {
            throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
        }
    } catch (error) {
        //handle caught errors
        errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
}
`

module.exports.bulkAssociation_model_ddm_add = `
/**
 * bulkAssociateDogWithPersonId - bulkAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to add
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkAssociateDogWithPersonId(bulkAssociationInput, benignErrorReporter) {
  let mappedBulkAssociateInputToAdapters = this.mapBulkAssociationInputToAdapters(bulkAssociationInput);
  var promises = [];
  Object.keys(mappedBulkAssociateInputToAdapters).forEach(responsibleAdapter => {
      promises.push(adapters[responsibleAdapter].bulkAssociateDogWithPersonId(mappedBulkAssociateInputToAdapters[responsibleAdapter], benignErrorReporter))
  });
  await Promise.all(promises);
  return "Records successfully updated!";
}
`

module.exports.bulkAssociation_model_ddm_remove = `
/**
 * bulkDisAssociateDogWithPersonId - bulkDisAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to remove
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkDisAssociateDogWithPersonId(bulkAssociationInput, benignErrorReporter) {
    let mappedBulkAssociateInputToAdapters = this.mapBulkAssociationInputToAdapters(bulkAssociationInput);
    var promises = [];
    Object.keys(mappedBulkAssociateInputToAdapters).forEach(responsibleAdapter => {
        promises.push(adapters[responsibleAdapter].bulkDisAssociateDogWithPersonId(mappedBulkAssociateInputToAdapters[responsibleAdapter], benignErrorReporter))
    });
    await Promise.all(promises);
    return "Records successfully updated!";
}
`
module.exports.bulkAssociation_mapBulkAssociationInputToAdapters = `
/**
 * mapBulkAssociationInputToAdapters - maps the input of a bulkAssociate to the responsible adapters 
 * adapter on adapter/index.js. Each key of the object will have
 *
 * @param {Array} bulkAssociationInput Array of "edges" between two records to be associated
 * @return {object} mapped "edge" objects ({<id_model1>: id, <id_model2>:id}) to the adapter responsible for the primary Key
 */
static mapBulkAssociationInputToAdapters(bulkAssociationInput){
let mappedInput = {}
bulkAssociationInput.map((idMap) => {
    let responsibleAdapter = this.adapterForIri(idMap.dog_id);
    mappedInput[responsibleAdapter] === undefined ? mappedInput[responsibleAdapter] = [idMap] : mappedInput[responsibleAdapter].push(idMap)
});
return mappedInput;
}
`