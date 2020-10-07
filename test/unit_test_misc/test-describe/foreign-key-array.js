module.exports.add_and_update = `
addAuthor(id: ID!, name: String, lastname: String, email: String, addBooks: [ID]    , skipAssociationsExistenceChecks:Boolean = false): author!
updateAuthor(id: ID!, name: String, lastname: String, email: String, addBooks: [ID], removeBooks: [ID]    , skipAssociationsExistenceChecks:Boolean = false): author!

`

module.exports.resolver_filter_association = `
author.prototype.booksFilter = function({
    search,
    order,
    pagination
}, context){

  let nsearch = helper.addSearchField({
        "search": search,
        "field": models.book.idAttribute(),
        "value": this.book_ids.join(','),
        "valueType": "Array",
        "operator": "in"
    });

  return resolvers.books({
      search: nsearch,
      order: order,
      pagination: pagination
  }, context);
}

`

module.exports.resolver_connection_association = `
author.prototype.booksConnection = function({
    search,
    order,
    pagination
}, context){

  let nsearch = helper.addSearchField({
        "search": search,
        "field": models.book.idAttribute(),
        "value": this.book_ids.join(','),
        "valueType": "Array",
        "operator": "in"
    });

    return resolvers.booksConnection({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}
`

module.exports.resolver_count_association = `
author.prototype.countFilteredBooks = function({search}, context){
  let nsearch = helper.addSearchField({
        "search": search,
        "field":models.book.idAttribute(),
        "value": this.book_ids.join(','),
        "valueType": "Array",
        "operator": "in"
    });
    return resolvers.countBooks({search: nsearch}, context);
}

`

module.exports.resolver_add_association = `
author.prototype.add_books = async function(input, benignErrorReporter){

  //handle inverse association
  let promises = [];
  input.addBooks.forEach( id => {
    promises.push( models.book.add_author_ids( id ,[ this.getIdValue()], benignErrorReporter ) );
  });
  await Promise.all(promises);

  await author.add_book_ids(this.getIdValue(), input.addBooks, benignErrorReporter);
  this.book_ids =  helper.unionIds(this.book_ids, input.addBooks);
}
`

module.exports.resolver_remove_association = `
author.prototype.remove_books = async function(input, benignErrorReporter){

  //handle inverse association
  let promises = [];
  input.removeBooks.forEach( id => {
    promises.push( models.book.remove_author_ids( id ,[ this.getIdValue()], benignErrorReporter ) );
  });
  await Promise.all(promises);

  await author.remove_book_ids(this.getIdValue(), input.removeBooks, benignErrorReporter);
  this.book_ids = helper.differenceIds(this.book_ids, input.removeBooks);
}
`

 module.exports.model_add_association = `
 static async add_book_ids(id, book_ids){

   let record = await super.findByPk(id);
   let updated_ids = helper.unionIds(record.book_ids, book_ids);
   await record.update( {book_ids: updated_ids} );

 }
 `

 module.exports.model_remove_association = `
 static async remove_book_ids(id, book_ids){
   let record = await super.findByPk(id);
   let updated_ids = helper.differenceIds(record.book_ids, book_ids);
   await record.update( {book_ids: updated_ids} );
 }
 `

 module.exports.remote_model_add_association =`
 static async add_book_ids(id, book_ids,benignErrorReporter) {

   let query = \`
         mutation
           updatePost_author{
             updatePost_author(
               id:"\${id}"
               addBooks:["\${book_ids.join("\\",\\"")}"]
             ){
               id
               book_ids
             }
           }\`
   //use default BenignErrorReporter if no BenignErrorReporter defined
   benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

   try {
     // Send an HTTP request to the remote server
     let response = await axios.post(remoteZendroURL, {query:query});
     //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
     if(helper.isNonEmptyArray(response.data.errors)) {
       benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
     }
     // STATUS-CODE is 200
     // NO ERROR as such has been detected by the server (Express)
     // check if data was send
     if(response && response.data && response.data.data) {
       return new post_author(response.data.data.updatePost_author);
     } else {
       throw new Error(\`Invalid response from remote zendro-server: \${remoteZendroURL}\`);
     }
   } catch(error){
     //handle caught errors
     errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
   }

 }

 `

 module.exports.remote_model_remove_association =`
 static async remove_book_ids(id, book_ids,benignErrorReporter) {

   let query = \`
         mutation
           updatePost_author{
             updatePost_author(
               id:"\${id}"
               removeBooks:["\${book_ids.join("\\",\\"")}"]
             ){
               id
               book_ids
             }
           }\`
   //use default BenignErrorReporter if no BenignErrorReporter defined
   benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

   try {
     // Send an HTTP request to the remote server
     let response = await axios.post(remoteZendroURL, {query:query});
     //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
     if(helper.isNonEmptyArray(response.data.errors)) {
       benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
     }
     // STATUS-CODE is 200
     // NO ERROR as such has been detected by the server (Express)
     // check if data was send
     if(response && response.data && response.data.data) {
       return new post_author(response.data.data.updatePost_author);
     } else {
       throw new Error(\`Invalid response from remote zendro-server: \${remoteZendroURL}\`);
     }
   } catch(error){
     //handle caught errors
     errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
   }
 }

 `

module.exports.ddm_model_add = `
static async add_book_ids(id, book_ids, benignErrorReporter) {
  let responsibleAdapter = this.adapterForIri(id);
  return await adapters[responsibleAdapter].add_book_ids(id, book_ids, benignErrorReporter);

}

`
module.exports.sql_adapter_add = `
static async add_book_ids(id, book_ids) {

    let record = await super.findByPk(id);
    let updated_ids = helper.unionIds(record.book_ids, book_ids);
    await record.update({
        book_ids: updated_ids
    });
}
`

module.exports.zendro_adapter_remove = `
static async remove_book_ids(id, book_ids, benignErrorReporter) {
    let query = \`
            mutation
              updateSq_author{
                updateSq_author(
                  id:"\${id}"
                  removeBooks:["\${book_ids.join("\\",\\"")}"]
                  skipAssociationsExistenceChecks: true
                ){
                  id                      book_ids                    }
              }\`

    try {
        // Send an HTTP request to the remote server
        let response = await axios.post(remoteZendroURL, {
            query: query
        });
        //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
        if (helper.isNonEmptyArray(response.data.errors)) {
            benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
        }
        // STATUS-CODE is 200
        // NO ERROR as such has been detected by the server (Express)
        // check if data was send
        if (response && response.data && response.data.data) {
            return response.data.data.updateSq_author;
        } else {
            throw new Error(\`Invalid response from remote zendro-server: \${remoteZendroURL}\`);
        }
    } catch (error) {
        //handle caught errors
        errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
}
`
