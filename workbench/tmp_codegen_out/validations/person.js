// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(person) {

    person.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "firstName": {
                "type": ["string", "null"]
            },
            "lastName": {
                "type": ["string", "null"]
            },
            "email": {
                "type": ["string", "null"]
            },
            "companyId": {
                "type": ["integer", "null"]
            },
            "internalPersonId": {
                "type": ["string", "null"]
            }
        }
    }

    person.prototype.asyncValidate = ajv.compile(
        person.prototype.validatorSchema
    )

    person.prototype.validateForCreate = async function(record) {
        return await person.prototype.asyncValidate(record)
    }

    person.prototype.validateForUpdate = async function(record) {
        return await person.prototype.asyncValidate(record)
    }

    person.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return person
}