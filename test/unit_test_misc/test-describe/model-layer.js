module.exports.count_in_sequelize_model = `
static countRecords(search){
  let options = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }
  return super.count(options);
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
countDogs: function({
    search
}, context) {
    return checkAuthorization(context, 'Dog', 'read').then(authorization => {
        if (authorization === true) {
            return dog.countRecords(search);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`
module.exports.read_all = `
static readAll(search, order, pagination){
  let options = {};
  if (search !== undefined) {
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
dogs: function({
    search,
    order,
    pagination
}, context) {
    return checkAuthorization(context, 'Dog', 'read').then(authorization => {
        if (authorization === true) {
            return dog.readAll(search, order, pagination);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`

module.exports.add_one_model = `
static addOne(input){
  return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
      .then((valSuccess) => {
          return super.create(input)
              .then(async item => {
                let promises_associations = [];
                  if (input.addAuthors) {
                    promises_associations.push( item.setAuthors(input.addAuthors) );
                  }
                  return  Promise.all(promises_associations).then( () => { return item } );
              }).catch(error => {return error});
      }).catch((err) => {
          return err
      })
}
`

module.exports.add_one_resolver = `
/**
 * addBook - Check user authorization and creates a new record with data specified in the input argument
 *
 * @param  {object} input   Info of each field to create the new record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         New record created
 */
addBook: function(input, context) {
    return checkAuthorization(context, 'Book', 'create').then(authorization => {
        if (authorization === true) {

          return book.addOne(input);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`

module.exports.delete_one_model = `
static deleteOne(id){
  return super.findByPk(id)
      .then(item => {

          if (item === null) return new Error(\`Record with ID = \${id} not exist\`);

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
 * @param  {number} {id}    Id of the record to delete
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {string}         Message indicating if deletion was successfull.
 */
deleteBook: function({
    id
}, context) {
    return checkAuthorization(context, 'Book', 'delete').then(authorization => {
        if (authorization === true) {
          return book.deleteOne(id);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`
module.exports.update_one_model = `
static updateOne(input){

  return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
      .then((valSuccess) => {
          return super.findByPk(input.id)
              .then(async item => {
                  let promises_associations = [];
                  if (input.addAuthors) {
                      promises_associations.push(item.addAuthors(input.addAuthors) );
                  }
                  if (input.removeAuthors) {
                      promises_associations.push(item.removeAuthors(input.removeAuthors));
                  }
                  return  Promise.all(promises_associations).then( () => { return item.update(input); } );
              }).catch(error => {return error});
      }).catch((err) => {
          return err
      })
}
`

module.exports.update_one_resolver = `
/**
 * updateBook - Check user authorization and update the record specified in the input argument
 *
 * @param  {object} input   record to update and new info to update
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         Updated record
 */
updateBook: function(input, context) {
    return checkAuthorization(context, 'Book', 'update').then(authorization => {
        if (authorization === true) {
          return book.updateOne(input);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
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
                    console.log(err);
                });

            } catch (error) {
                console.log(error.message);
            }

            fs.unlinkSync(tmpFile);
        }).catch((error) => {
            email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                'ScienceDB batch add', \`\${error.message}\`).then(function(info) {
                console.log(info);
            }).catch(function(err) {
                console.log(err);
            });

            fs.unlinkSync(tmpFile);
        });

    }).catch((error) => {
        return new Error(error);
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
    bulkAddBookCsv: function(_, context) {
        return checkAuthorization(context, 'Book', 'create').then(authorization => {
            if (authorization === true) {
              return book.bulkAddCsv(context);

            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
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
csvTableTemplateIndividual: function(_, context) {
    return checkAuthorization(context, 'individual', 'read').then(authorization => {
        if (authorization === true) {
            return individual.csvTableTemplate();
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}

}
`
