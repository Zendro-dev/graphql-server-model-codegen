module.exports.server_url = `
  const remoteCenzontleURL = "http://something.other:7000/graphql";
`

module.exports.read_by_id = `
static async readById( id, benignErrorReporter){
  let query = \`query readOneBook{ readOneBook(id: "\${id}"){id  title genre publisher_id} }\`

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if (response && response.data && response.data.data) {
      let item = new Book(response.data.data.readOneBook);
      await validatorUtil.ifHasValidatorFunctionInvoke('validateAfterRead', this, item);
      return item;
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error) {
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}

`

module.exports.read_all = `
static async readAll(search, order, pagination, benignErrorReporter){
  let query = \`query
  books($search: searchBookInput $pagination: paginationInput $order: [orderBookInput] )
 {books(search:$search pagination:$pagination order:$order){id title genre publisher_id } }\`

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query, variables: {search: search, order:order, pagination: pagination}});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response&&response.data&&response.data.data) {
      let data = response.data.data.books;
      return data.map(item => {return new Book(item)});
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error){
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}

`
module.exports.count_records = `
static async countRecords(search, benignErrorReporter){
  let query = \`query countBooks($search: searchBookInput){
    countBooks(search: $search)
  }\`

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);

  try {
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query, variables:{search: search}});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response&&response.data&&response.data.data) {
      return response.data.data.countBooks;
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error){
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`

module.exports.add_one = `
static async addOne(input, benignErrorReporter) {
  let query = \`mutation addBook($title:String $genre:String){
    addBook(title:$title genre:$genre){id  title genre publisher_id   }
  }\`;
  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    await validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input);
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query, variables:input});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response&&response.data&&response.data.data) {
      return new Book(response.data.data.addBook);
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error) {
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`
module.exports.delete_by_id = `
static async deleteOne(id, benignErrorReporter){
  let query = \`mutation deleteBook{ deleteBook(id: "\${id}" )}\`;

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    await validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, id);
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query: query});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response&&response.data&&response.data.data) {
      return response.data.data.deleteBook;
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error) {
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}

`

module.exports.update_one = `
static async updateOne(input, benignErrorReporter){
  let query = \`mutation updateBook($id:ID! $title:String $genre:String){
    updateBook(id:$id title:$title genre:$genre){id  title genre publisher_id  }
  }\`
  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    await validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input);
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query, variables:input});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response&&response.data&&response.data.data) {
      return new Book(response.data.data.updateBook);
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error) {
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}

`

module.exports.csv_template = `
static async csvTableTemplate(benignErrorReporter){
  let query = \`query {csvTableTemplateBook}\`;
  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    let response = await axios.post(remoteCenzontleURL, {query:query});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    return response.data.data.csvTableTemplateBook;
  } catch(error) {
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`
module.exports.bulk_add_csv = `
static async bulkAddCsv(context, benignErrorReporter){
  let tmpFile = path.join(os.tmpdir(), uuidv4()+'.csv');

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    let csvRequestMv = await context.request.files.csv_file.mv(tmpFile);
    let query = \`mutation {bulkAddBookCsv}\`;
    let formData = new FormData();
    formData.append('csv_file', fs.createReadStream(tmpFile));
    formData.append('query', query);

    let response = await axios.post(remoteCenzontleURL, formData,  {
      headers: formData.getHeaders()
    });
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    return response.data.data.bulkAddBookCsv;

  } catch(error) {
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`

module.exports.many_to_many_association=`
const definition = {
    model: 'Person',
    storageType: 'cenz-server',
    url: 'http://something.other:7000/graphql',
    attributes: {
        firstName: 'String',
        lastName: 'String',
        email: 'String',
        companyId: 'Int'
    },
    associations: {
        works: {
            type: 'to_many',
            target: 'Book',
            targetKey: 'bookId',
            sourceKey: 'personId',
            keysIn: 'books_to_people',
            targetStorageType: 'cenz-server',
            label: 'title'
        },
        company: {
            type: 'to_one',
            target: 'publi_sher',
            targetKey: 'companyId',
            keyIn: 'Person',
            targetStorageType: 'generic'
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};




`

module.exports.many_to_many_association_count = `
static async countRecords(search, benignErrorReporter){
  let query = \`query countPeople($search: searchPersonInput){
    countPeople(search: $search)
  }\`

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);

  try {
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query, variables:{search: search}});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response&&response.data&&response.data.data) {
      return response.data.data.countPeople;
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error){
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`

module.exports.add_personId = `
/**
 * add_personId - field Mutation (adapter-layer) for to_one associationsArguments to add
 *
 * @param {Id}   id   IdAttribute of the root model to be updated
 * @param {Id}   personId Foreign Key (stored in "Me") of the Association to be updated.
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote cenzontle services
 */
static async add_personId(id, personId, benignErrorReporter) {
  let query = \`
      mutation
        updateDog{
          updateDog(
            id:"\${id}"
            addOwner:"\${personId}"
          ){
            id                  personId                }
        }\`

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response && response.data && response.data.data) {
      return new Dog(response.data.data.updateDog);
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error){
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`
module.exports.remove_personId = `
/**
 * remove_personId - field Mutation (adapter-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   id   IdAttribute of the root model to be updated
 * @param {Id}   personId Foreign Key (stored in "Me") of the Association to be updated.
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote cenzontle services
 */
static async remove_personId(id, personId, benignErrorReporter) {
  let query = \`
      mutation
        updateDog{
          updateDog(
            id:"\${id}"
            removeOwner:"\${personId}"
          ){
            id                  personId                }
        }\`


  //use default BenignErrorReport er if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

  try {
    // Send an HTTP request to the remote server
    let response = await axios.post(remoteCenzontleURL, {query:query});
    //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
    if(helper.isNonEmptyArray(response.data.errors)) {
      benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteCenzontleURL));
    }
    // STATUS-CODE is 200
    // NO ERROR as such has been detected by the server (Express)
    // check if data was send
    if(response && response.data && response.data.data) {
      return new Dog(response.data.data.updateDog);
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${remoteCenzontleURL}\`);
    }
  } catch(error){
    //handle caught errors
    errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteCenzontleURL);
  }
}
`
