// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(book) {

    book.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "title": {
                "type": ["string", "null"]
            },
            "genre": {
                "type": ["string", "null"]
            },
            "internalPersonId": {
                "type": ["string", "null"]
            },
            "internalBookId": {
                "type": ["string", "null"]
            }
        }
    }

    book.prototype.asyncValidate = ajv.compile(
        book.prototype.validatorSchema
    )

    book.prototype.validateForCreate = async function(record) {
        return await book.prototype.asyncValidate(record)
    }

    book.prototype.validateForUpdate = async function(record) {
        return await book.prototype.asyncValidate(record)
    }

    book.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return book
}