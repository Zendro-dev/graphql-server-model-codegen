module.exports.connection_book_schema = `
type BookConnection{
  edges: [BookEdge]
  pageInfo: pageInfo!
}

type BookEdge{
  cursor: String!
  node: Book!
}
`

module.exports.connection_book_query = `
booksConnection(search: searchBookInput, order: [orderBookInput], pagination: paginationCursorInput!): BookConnection
`

module.exports.model_read_all_connection = `
static async readAllCursor(search, order, pagination, benignErrorReporter){
    //use default BenignErrorReporter if no BenignErrorReporter defined
    benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);
    
    // build the sequelize options object for cursor-based pagination
    let options = helper.buildCursorBasedSequelizeOptions(search, order, pagination, this.idAttribute());
    let records = await super.findAll(options);

    records = records.map(x => Book.postReadCast(x))

    // validationCheck after read
    records = await validatorUtil.bulkValidateData('validateAfterRead', this, records, benignErrorReporter);
    // get the first record (if exists) in the opposite direction to determine pageInfo.
    // if no cursor was given there is no need for an extra query as the results will start at the first (or last) page.
    let oppRecords = [];
    if (pagination && (pagination.after || pagination.before)) {
      let oppOptions = helper.buildOppositeSearchSequelize(search, order, {...pagination, includeCursor: false}, this.idAttribute());
      oppRecords = await super.findAll(oppOptions);
    }
    // build the graphql Connection Object
    let edges = helper.buildEdgeObject(records);
    let pageInfo = helper.buildPageInfo(edges, oppRecords, pagination);
    return {edges, pageInfo};
}
`

module.exports.resolver_read_all_connection = `
/**
     * booksConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    booksConnection: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'Book', 'read') === true) {
            helper.checkCursorBasedPaginationArgument(pagination);
            let limit = helper.isNotUndefinedAndNotNull(pagination.first) ? pagination.first : pagination.last;
            helper.checkCountAndReduceRecordsLimit(limit, context, "booksConnection");
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await book.readAllCursor(search, order, pagination, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }

    },
`

module.exports.schema_to_many_association = `
"""
@search-request
"""
booksConnection(search: searchBookInput, order: [ orderBookInput ], pagination: paginationCursorInput!): BookConnection

`

module.exports.resolver_to_many_association = `
/**
 * person.prototype.booksConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
person.prototype.booksConnection = async function({
    search,
    order,
    pagination
}, context) {
if (await checkAuthorization(context, 'Book', 'read') === true) {
            helper.checkCursorBasedPaginationArgument(pagination);
            let limit = helper.isNotUndefinedAndNotNull(pagination.first) ? pagination.first : pagination.last;
            helper.checkCountAndReduceRecordsLimit(limit, context, "booksConnection");
            return this.booksConnectionImpl({
                search,
                order,
                pagination
            });
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
}
`

module.exports.model_many_to_many_association =`
booksConnectionImpl({
  search,
  order,
  pagination
}) {
    
    // build the sequelize options object for cursor-based pagination
    let options = helper.buildCursorBasedSequelizeOptions(search, order, pagination, models.book.idAttribute());
    let records = await this.getBooks(options);
    // get the first record (if exists) in the opposite direction to determine pageInfo.
    // if no cursor was given there is no need for an extra query as the results will start at the first (or last) page.
    let oppRecords = [];
    if (pagination && (pagination.after || pagination.before)) {
      let oppOptions = helper.buildOppositeSearchSequelize(search, order, {...pagination, includeCursor: false}, models.book.idAttribute());
      oppRecords = await this.getBooks(oppOptions);
    }
    // build the graphql Connection Object
    let edges = helper.buildEdgeObject(records);
    let pageInfo = helper.buildPageInfo(edges, oppRecords, pagination);
    return {edges, pageInfo};
}
`

module.exports.read_all_zendro_server = `
static async readAllCursor(search, order, pagination, benignErrorReporter){
    let query = \`query booksConnection($search: searchBookInput $pagination: paginationCursorInput! $order: [orderBookInput]){
        booksConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  id  title
          genre
          publisher_id
         } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }\`

    //use default BenignErrorReporter if no BenignErrorReporter defined
    benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

    try {
      // Send an HTTP request to the remote server
      let response = await axios.post(remoteZendroURL, {query:query, variables: {search: search, order:order, pagination: pagination}});
      //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
      if(helper.isNonEmptyArray(response.data.errors)) {
        benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
      }
      // STATUS-CODE is 200
      // NO ERROR as such has been detected by the server (Express)
      // check if data was send
      if(response&&response.data&&response.data.data&&response.data.data.booksConnection !== null) {
        let data_edges = response.data.data.booksConnection.edges;
        let pageInfo = response.data.data.booksConnection.pageInfo;
        //validate after read
        let nodes = data_edges.map(e => e.node);
        let valid_nodes = await validatorUtil.bulkValidateData('validateAfterRead', this, nodes, benignErrorReporter);

        let edges = valid_nodes.map( e =>{
          let temp_node = new Book(e);
          return {
            node: temp_node,
            cursor: temp_node.base64Enconde()
          }
        })

        return { edges, pageInfo };
      } else {
        throw new Error(\`Remote server (\${remoteZendroURL}) did not respond with data.\`);
      }
    } catch(error) {
      //handle caught errors
      errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
  }
`

module.exports.many_to_many_association_connection_zendro_server = `
static async updateOne(input, benignErrorReporter){
  //validate input
  await validatorUtil.validateData('validateForUpdate', this, input);
    let query = \`mutation updatePerson($id:ID!        $firstName:String
        $lastName:String
        $email:String){
    updatePerson(id:$id           firstName:$firstName
                lastName:$lastName
                email:$email){
        id            firstName
                lastName
                email
                companyId
        }
    }\`

    //use default BenignErrorReporter if no BenignErrorReporter defined
    benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef( benignErrorReporter );

    try {

        // Send an HTTP request to the remote server
        let response = await axios.post(remoteZendroURL, {query:query, variables:input});
        //check if remote service returned benign Errors in the response and add them to the benignErrorReporter
        if(helper.isNonEmptyArray(response.data.errors)) {
            benignErrorReporter.reportError(errorHelper.handleRemoteErrors(response.data.errors, remoteZendroURL));
        }

        // STATUS-CODE is 200
        // NO ERROR as such has been detected by the server (Express)
        // check if data was send
        if(response&&response.data&&response.data.data) {
        return new Person(response.data.data.updatePerson);
        } else {
        throw new Error(\`Remote zendro-server (\${remoteZendroURL}) did not respond with data.\`);
        }
    } catch(error) {
        //handle caught errors
        errorHelper.handleCaughtErrorAndBenignErrors(error, benignErrorReporter, remoteZendroURL);
    }
}
`
