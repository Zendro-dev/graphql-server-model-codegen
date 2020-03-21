// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(role) {

    role.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "name": {
                "type": ["string", "null"]
            },
            "description": {
                "type": ["string", "null"]
            }
        }
    }

    role.prototype.asyncValidate = ajv.compile(
        role.prototype.validatorSchema
    )

    role.prototype.validateForCreate = async function(record) {
        return await role.prototype.asyncValidate(record)
    }

    role.prototype.validateForUpdate = async function(record) {
        return await role.prototype.asyncValidate(record)
    }

    role.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return role
}