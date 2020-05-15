module.exports.count_in_sequelize_model = `
static async countRecords(search) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return {
            sum: await super.count(options),
            errors: []
        };
    }
`

module.exports.count_in_webservice_model = `
static countRecords(search){

  /*
  YOUR CODE GOES HERE
  */
  throw new Error('countPubli_shers is not implemented');
}
`

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
        try {
            if (await checkAuthorization(context, 'Dog', 'read') === true) {
                return (await dog.countRecords(search)).sum;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },
`
module.exports.read_all = `
static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return super.count(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["id", "ASC"]
                ];
            }

            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }

            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(\`Request of total dogs exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
            }
            return super.findAll(options);
        });
    }

`

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
        try {
            if (await checkAuthorization(context, 'Dog', 'read' === true)) {
                await checkCountAndReduceRecordsLimit(search, context, "dogs");
                return await dog.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },
`

module.exports.add_one_model = `
static addOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
        .then(async (valSuccess) => {
            try {
                const result = await sequelize.transaction(async (t) => {
                    let item = await super.create(input, {
                        transaction: t
                    });
                    return item;
                });
                return result;
            } catch (error) {
                throw error;
            }
        });
}
`

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
        try {
            let authorization = await checkAuthorization(context, 'Book', 'create');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if(!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdBook = await book.addOne(inputSanitized);
                await createdBook.handleAssociations(inputSanitized, context);
                return createdBook;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },
`

module.exports.delete_one_model = `
static deleteOne(id){
  return super.findByPk(id)
      .then(item => {

          if (item === null) return new Error(\`Record with ID = \${id} does not exist\`);

          return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
              .then((valSuccess) => {
                  return item
                      .destroy()
                      .then(() => {
                          return 'Item successfully deleted';
                      });
              }).catch((err) => {
                  return err
              })
      });

}
`
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
        try {
            if (await checkAuthorization(context, 'Book', 'delete') === true) {
                if (await validForDeletion(id, context)) {
                    return book.deleteOne(id);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },
`
module.exports.update_one_model = `
static updateOne(input) {
    return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
        .then(async (valSuccess) => {
            try {
                let result = await sequelize.transaction(async (t) => {
                    let promises_associations = [];
                    let item = await super.findByPk(input[this.idAttribute()], {
                        transaction: t
                    });
		    if (item === null) {
                            throw new Error(\`Record with ID = \${id} does not exist\`);
                        }
                    let updated = await item.update(input, {
                        transaction: t
                    });
                    return updated;
                });
                return result;
            } catch (error) {
                throw error;
            }
        });
}
`

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
    try {                                                                                                                                                                                                      
        let authorization = await checkAuthorization(context, 'Book', 'update');                                                                                                                               
        if (authorization === true) {                                                                                                                                                                          
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);                                                                                                
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);                                                                               
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);                                                                                                
            if(!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }                                                                                                      
            let updatedBook = await book.updateOne(inputSanitized);                                                                                                                                            
            await updatedBook.handleAssociations(inputSanitized, context);                                                                                                                                     
            return updatedBook;                                                                                                                                                                                
        } else {                                                                                                                                                                                               
            throw new Error("You don't have authorization to perform this action");                                                                                                                            
        }                                                                                                                                                                                                      
    } catch (error) {                                                                                                                                                                                          
        console.error(error);                                                                                                                                                                                  
        handleError(error);                                                                                                                                                                                    
    }                                                                                                                                                                                                          
}, 
`

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
}
`

module.exports.bulk_add_resolver = `

    /**
     * bulkAddBookCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookCsv: async function(_, context) {
        try {
            if (await checkAuthorization(context, 'Book', 'create') === true) {
                return book.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },
`
module.exports.table_template_model = `
static csvTableTemplate(){
  return helper.csvTableTemplate(individual);
}
`

module.exports.table_template_resolver = `
/**
     * csvTableTemplateIndividual - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateIndividual: async function(_, context) {
        try {
            if (await checkAuthorization(context, 'individual', 'read') === true) {
                return individual.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    }

}
`
