module.exports.count_in_sequelize_model = `
static async countRecords(search) {
    let options = {}
    options['where'] = helper.searchConditionsToSequelize(search, individual.definition.attributes);
    return super.count(options);
`;

module.exports.count_in_webservice_model = `
static async countRecords(search, benignErrorReporter) {

  /*
  YOUR CODE GOES HERE
  */
  throw new Error('countRecords() is not implemented for model publi_sher');
}
`;

module.exports.count_in_resolvers = `
/**
     * countDogs - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countDogs: async function({
        search
    }, context) {
        if (await checkAuthorization(context, 'Dog', 'read') === true) {
            return await dog.countRecords(search, context.benignErrors, context.request.headers.authorization);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;
module.exports.read_all = `
static async readAll(search, order, pagination, benignErrorReporter) {
    // build the sequelize options object for limit-offset-based pagination
    let options = helper.buildLimitOffsetSequelizeOptions(search, order, pagination, this.idAttribute(), dog.definition.attributes);
    let records = await super.findAll(options);
    records = records.map(x => dog.postReadCast(x))
    // validationCheck after read
    return validatorUtil.bulkValidateData('validateAfterRead', this, records, benignErrorReporter);
}
`;

module.exports.read_all_resolver = `
/**
     * dogs - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    dogs: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'Dog', 'read') === true) {
            helper.checkCountAndReduceRecordsLimit(pagination.limit, context, "dogs");
            return await dog.readAll(search, order, pagination, context.benignErrors, context.request.headers.authorization);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }

    },
`;

module.exports.add_one_model = `
static async addOne(input) {
    //validate input
    await validatorUtil.validateData('validateForCreate', this, input);
    input = book.preWriteCast(input)
    try{
      const result = await this.sequelize.transaction(async (t) => {
          let item = await super.create(input, {
              transaction: t
          });
          return item;
      });
      book.postReadCast(result.dataValues)
      book.postReadCast(result._previousDataValues)
      return result;
    }catch(error){
      throw error;
    }

}
`;

module.exports.add_one_resolver = `
/**
     * addBook - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addBook: async function(input, context) {
        let authorization = await checkAuthorization(context, 'Book', 'create');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if(!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let createdBook = await book.addOne(inputSanitized, context.benignErrors, context.request.headers.authorization);
            await createdBook.handleAssociations(inputSanitized, context.benignErrors, context.request.headers.authorization);
            return createdBook;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;

module.exports.delete_one_model = `
static async deleteOne(id){
  //validate id
  await validatorUtil.validateData('validateForDelete', this, id);
  let destroyed = await super.destroy({where:{[this.idAttribute()] : id} });
  if(destroyed !== 0){
    return 'Item successfully deleted';
  }else{
    throw new Error(\`Record with ID = \${id} does not exist or could not been deleted\`);
  }

}
`;
module.exports.delete_one_resolver = `
/**
     * deleteBook - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteBook: async function({
        id
    }, context) {
        if (await checkAuthorization(context, 'Book', 'delete') === true) {
            if (await validForDeletion(id, context)) {
                await updateAssociations(id, context);
                return book.deleteOne(id, context.benignErrors, context.request.headers.authorization);
            }
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;
module.exports.update_one_model = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
        input = book.preWriteCast(input)
            try {
                let result = await this.sequelize.transaction(async (t) => {
                    let to_update = await super.findByPk(input[this.idAttribute()]);
                    if(to_update === null){
                        throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
                    }

                    let updated = await to_update.update(input, {transaction: t  } );
                    return updated;
                });
                book.postReadCast(result.dataValues)
                book.postReadCast(result._previousDataValues)
                return result;
            } catch (error) {
                throw error;
            }
}
`;

module.exports.update_one_resolver = `
/**
 * updateBook - Check user authorization and update the record specified in the input argument
 * This function only handles attributes, not associations.
 * @see handleAssociations for further information.
 *
 * @param  {object} input   record to update and new info to update
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         Updated record
 */
updateBook: async function(input, context) {
    let authorization = await checkAuthorization(context, 'Book', 'update');
    if (authorization === true) {
        let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
        await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
        await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
        if(!input.skipAssociationsExistenceChecks) {
            await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
        }
        let updatedBook = await book.updateOne(inputSanitized, context.benignErrors, context.request.headers.authorization);
        await updatedBook.handleAssociations(inputSanitized, context.benignErrors, context.request.headers.authorization);
        return updatedBook;
    } else {
        throw new Error("You don't have authorization to perform this action");
    }
},
`;

module.exports.table_template_model = `
static async csvTableTemplate(benignErrorReporter){
  return helper.csvTableTemplate(definition);
}
`;

module.exports.table_template_resolver = `
/**
     * csvTableTemplateIndividual - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateIndividual: async function(_, context) {
        if (await checkAuthorization(context, 'individual', 'read') === true) {
            return individual.csvTableTemplate(context.benignErrors, context.request.headers.authorization);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;
