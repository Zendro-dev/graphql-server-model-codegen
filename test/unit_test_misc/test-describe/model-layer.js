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
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await dog.countRecords(search, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;
module.exports.read_all = `
static async readAll(search, order, pagination, benignErrorReporter) {
    //use default BenignErrorReporter if no BenignErrorReporter defined
    benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);
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
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await dog.readAll(search, order, pagination, benignErrorReporter);
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
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            let createdBook = await book.addOne(inputSanitized, benignErrorReporter);
            await createdBook.handleAssociations(inputSanitized, benignErrorReporter);
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
                let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
                return book.deleteOne(id, benignErrorReporter);
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
        let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
        let updatedBook = await book.updateOne(inputSanitized, benignErrorReporter);
        await updatedBook.handleAssociations(inputSanitized, benignErrorReporter);
        return updatedBook;
    } else {
        throw new Error("You don't have authorization to perform this action");
    }
},
`;

module.exports.bulk_add_model = `
static bulkAddCsv(context){

    let delim = context.request.body.delim;
    let cols = context.request.body.cols;
    let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

    context.request.files.csv_file.mv(tmpFile).then(() => {

        fileTools.parseCsvStream(tmpFile, this, delim, cols).then((addedZipFilePath) => {
            try {
                console.log(\`Sending \${addedZipFilePath} to the user.\`);

                let attach = [];
                attach.push({
                    filename: path.basename("added_data.zip"),
                    path: addedZipFilePath
                });

                email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                    'ScienceDB batch add',
                    'Your data has been successfully added to the database.',
                    attach).then(function(info) {
                    fileTools.deleteIfExists(addedZipFilePath);
                    console.log(info);
                }).catch(function(err) {
                    fileTools.deleteIfExists(addedZipFilePath);
                    console.error(err);
                });

            } catch (error) {
                console.error(error.message);
            }

            fs.unlinkSync(tmpFile);
        }).catch((error) => {
            email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                'ScienceDB batch add', \`\${error.message}\`).then(function(info) {
                console.error(info);
            }).catch(function(err) {
                console.error(err);
            });

            fs.unlinkSync(tmpFile);
        });

    }).catch((error) => {
        throw new Error(error);
    });
    return \`Bulk import of book records started. You will be send an email to \$\{helpersAcl.getTokenFromContext(context).email} informing you about success or errors\`;
}
`;

module.exports.bulk_add_resolver = `

    /**
     * bulkAddBookCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookCsv: async function(_, context) {
        if (await checkAuthorization(context, 'Book', 'create') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return book.bulkAddCsv(context, benignErrorReporter);
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
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return individual.csvTableTemplate(benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }

}
`;
