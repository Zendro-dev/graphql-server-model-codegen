// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(role_to_user) {

    role_to_user.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "userId": {
                "type": ["integer", "null"]
            },
            "roleId": {
                "type": ["integer", "null"]
            }
        }
    }

    role_to_user.prototype.asyncValidate = ajv.compile(
        role_to_user.prototype.validatorSchema
    )

    role_to_user.prototype.validateForCreate = async function(record) {
        return await role_to_user.prototype.asyncValidate(record)
    }

    role_to_user.prototype.validateForUpdate = async function(record) {
        return await role_to_user.prototype.asyncValidate(record)
    }

    role_to_user.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return role_to_user
}