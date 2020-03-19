module.exports.transcriptCount_indiv_validation = `
transcriptCount.prototype.validatorSchema = {
       "$async": true,
       "properties": {
         "gene": {
           "type": ["string", "null"]
         },
         "variable": {
           "type": ["string", "null"]
         },
         "count": {
           "type": ["number", "null"]
         },
         "tissue_or_condition": {
           "type": ["string", "null"]
         }
       }
`

module.exports.dog_owner_patch = `
// Dear user, edit the schema to adjust it to your model
module.exports.logic_patch = function(dog) {

    // Write your patch code here
    // Hint 1: dog.prototype.function_name = function(...) {};
    // Hint 2: dog.prototype.property_name = {};

    return dog;
};
`
