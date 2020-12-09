const models = require("../../integration_test_env/services/gql_science_db_graphql_server1/models")

module.exports.cassandra_schema = `
module.exports = \`
  type city{
    """
    @original-field
    """
    city_id: ID
    """
    @original-field

    """
    name: String

    """
    @original-field

    """
    intArr: [Int]

    """
    @original-field

    """
    strArr: [String]

    """
    @original-field

    """
    floatArr: [Float]

    """
    @original-field

    """
    boolArr: [Boolean]

    """
    @original-field

    """
    dateTimeArr: [DateTime]

    """
    @original-field

    """
    river_ids: [String]


    """
    @search-request
    """
    riversFilter(search: searchRiverInput, order: [ orderRiverInput ], pagination: paginationInput!): [river]


    """
    @search-request
    """
    riversConnection(search: searchRiverInput, order: [ orderRiverInput ], pagination: paginationCursorInput!): RiverConnection

    """
    @count-request
    """
    countFilteredRivers(search: searchRiverInput) : Int

    }
type CityConnection{
  edges: [CityEdge]
  pageInfo:pageCassandraInfo!
}

type CityEdge{
  cursor: String!
  node: city!
}

type VueTableCity{
  data : [city]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}
enum cityField {
  city_id
  name
  intArr
  strArr
  floatArr
  boolArr
  dateTimeArr
  river_ids
}
input searchCityInput {
  field: cityField
  value: String
  valueType: InputType
  operator: CassandraOperator    search: [searchCityInput]
}

input orderCityInput{
  field: cityField
  order: Order
}



type Query {
  cities(search: searchCityInput, order: [ orderCityInput ], pagination: paginationInput! ): [city]
  readOneCity(city_id: ID!): city
  countCities(search: searchCityInput ): Int
  vueTableCity : VueTableCity    csvTableTemplateCity: [String]
  citiesConnection(search:searchCityInput, pagination: paginationCursorCassandraInput!): CityConnection
}

type Mutation {
  addCity(city_id: ID!, name: String, intArr: [Int], strArr: [String], floatArr: [Float], boolArr: [Boolean], dateTimeArr: [DateTime]   , addRivers:[ID] , skipAssociationsExistenceChecks:Boolean = false): city!
  updateCity(city_id: ID!, name: String, intArr: [Int], strArr: [String], floatArr: [Float], boolArr: [Boolean], dateTimeArr: [DateTime]   , addRivers:[ID], removeRivers:[ID]  , skipAssociationsExistenceChecks:Boolean = false): city!
  deleteCity(city_id: ID!): String!
  bulkAddCityCsv: String!
}
\`;
`

module.exports.cassandra_resolver_Connection = `
citiesConnection: async function({
  search,
  order,
  pagination
}, context) {
  if (await checkAuthorization(context, 'city', 'read') === true) {
      helper.checkCursorBasedPaginationArgument(pagination);
      let limit = helper.isNotUndefinedAndNotNull(pagination.first) ? pagination.first : pagination.last;
      helper.checkCountAndReduceRecordsLimit(limit, context, "citiesConnection");
      let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
      let allowFiltering = await checkAuthorization(context, 'city', 'search');
      return await city.readAllCursor(search, pagination, benignErrorReporter, allowFiltering);
  } else {
      throw new Error("You don't have authorization to perform this action");
  }
}
`

module.exports.cassandra_resolver_Count = `
countCities: async function({
  search
}, context) {
  if (await checkAuthorization(context, 'city', 'read') === true) {
      let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
      let allowFiltering = await checkAuthorization(context, 'city', 'search');
      return await city.countRecords(search, benignErrorReporter, allowFiltering);
  } else {
      throw new Error("You don't have authorization to perform this action");
  }
}
`

module.exports.cassandra_model_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`

module.exports.cassandra_model_readById = `
static async readById(id) {
  const query = \`SELECT * FROM "cities" WHERE city_id = ?\`;
  let queryResult = await this.storageHandler.execute(query, [id], {
      prepare: true
  });
  let firstResult = queryResult.first();
  if (firstResult === null) {
      throw new Error(\`Record with ID = "\${id}" does not exist\`);
  }
  let item = new city(firstResult);
  return validatorUtil.validateData('validateAfterRead', this, item);
}
`

module.exports.cassandra_model_countRecords = `
static async countRecords(search, benignErrorReporter, allowFiltering) {
  let whereOptions = cassandraHelper.searchConditionsToCassandra(search, definition, allowFiltering)
  const query = 'SELECT COUNT(*) AS count FROM "cities"' + whereOptions;
  let queryResult = await this.storageHandler.execute(query);
  let item = queryResult.first();
  return parseInt(item['count']);
}
`

module.exports.cassandra_model_readAllCursor = `
static async readAllCursor(search, pagination, benignErrorReporter, allowFiltering) {

  let cassandraSearch = pagination && pagination.after ? cassandraHelper.cursorPaginationArgumentsToCassandra(search, pagination,'city_id') : search; 
  let whereOptions = cassandraHelper.searchConditionsToCassandra(cassandraSearch, definition, allowFiltering);

  let query = 'SELECT * FROM "cities"' + whereOptions;

  // Set page size if needed
  let options = {};
  if (pagination && pagination.first) {
      options.fetchSize = parseInt(pagination.first);
  }

  // Call to database 
  const result = await this.storageHandler.execute(query, [], options);

  // Construct return object
  const rows = result.rows.map(row => {
      let edge = {};
      let rowAscity = new city(row);
      edge.node = rowAscity;
      edge.cursor = rowAscity.base64Enconde();
      return edge;
  });

  let nextCursor = null;
  let hasNextCursor = false;

  /*
   * The pageState attribute is where Cassandra stores its own version of a cursor.
   * We cannot use it directly, because Cassandra uses different conventions. 
   * But its presence shows that there is a following page.
   */
  if (helper.isNotUndefinedAndNotNull(result.pageState)) {
      nextCursor = rows[rows.length - 1].cursor;
      hasNextCursor = true;
  }

  let pageInfo = {
      endCursor: nextCursor,
      hasNextPage: hasNextCursor
  }
  return {
      edges: rows,
      pageInfo: pageInfo
  };
}
`

module.exports.cassandra_model_addOne = `
static async addOne({
  city_id,
  name,
  intArr,
  strArr,
  floatArr,
  boolArr,
  dateTimeArr
}) {
  let input = helper.copyWithoutUnsetAttributes({
      city_id,
      name,
      intArr,
      strArr,
      floatArr,
      boolArr,
      dateTimeArr
  });
  await validatorUtil.validateData('validateForCreate', this, input);
  try {
      const fields = '"' + Object.keys(input).join('", "') + '"';
      const inputValues = Object.values(input);
      const prepareString = new Array(Object.keys(input).length).fill('?').join(', ');
      const mutation = 'INSERT INTO "cities" (' + fields + ') VALUES (' + prepareString + ')';
      // Call to database
      await this.storageHandler.execute(mutation, inputValues, {
          prepare: true
      });
      // return the newly created record by reading it
      return await this.readById(city_id);
  } catch (error) {
      throw error;
  }
}
`

module.exports.cassandra_model_deleteOne = `
static async deleteOne(id) {
  await validatorUtil.validateData('validateForDelete', this, id);
  const mutation = \`DELETE FROM "cities" WHERE city_id = ? IF EXISTS\`;
  let mutationResponse = await this.storageHandler.execute(mutation, [id]);
  if (mutationResponse) {
      return 'Item successfully deleted';
  } else {
      throw new Error(\`Record with ID = \${id} does not exist or could not been deleted\`)
  }
}
`

module.exports.cassandra_model_updateOne = `
static async updateOne({
  city_id,
  name,
  intArr,
  strArr,
  floatArr,
  boolArr,
  dateTimeArr
}) {
  let input = helper.copyWithoutUnsetAttributes({
      city_id,
      name,
      intArr,
      strArr,
      floatArr,
      boolArr,
      dateTimeArr
  });
  await validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input);
  try {
      let idValue = input[this.idAttribute()];
      delete input[this.idAttribute()];
      let inputKeys = Object.keys(input);
      let inputValues = Object.values(input);
      inputValues.push(idValue);
      // An update that does not change the attributes must not execute the following CQL statement
      if (inputKeys.length > 0) {
          let mutation = \`UPDATE "cities" SET \`;
          mutation += inputKeys.map(key => \`"\${key}" = ?\`).join(', ');
          mutation += \` WHERE city_id = ?;\`;
          await this.storageHandler.execute(mutation, inputValues, {
              prepare: true
          });
      }
      // return the newly created record by reading it
      return await this.readById(city_id);
  } catch (error) {
      throw error;
  }
}
`

module.exports.cassandra_model_fieldMutation = `
/**
 * add_capital_id - field Mutation (model-layer) for to_one associationsArguments to add 
 *
 * @param {Id}   incident_id   IdAttribute of the root model to be updated
 * @param {Id}   capital_id Foreign Key (stored in "Me") of the Association to be updated. 
 */
static async add_capital_id(incident_id, capital_id) {
    const mutationCql = \`UPDATE "incidents" SET capital_id = ? WHERE incident_id = ?\`;
    await this.storageHandler.execute(mutationCql, [capital_id, incident_id], {
        prepare: true
    });
    const checkCql = \`SELECT * FROM "incidents" WHERE incident_id = ?\`;
    let result = await this.storageHandler.execute(checkCql, [incident_id]);
    return new Incident(result.first());
}


/**
 * remove_capital_id - field Mutation (model-layer) for to_one associationsArguments to remove 
 *
 * @param {Id}   incident_id   IdAttribute of the root model to be updated
 * @param {Id}   capital_id Foreign Key (stored in "Me") of the Association to be updated. 
 */
static async remove_capital_id(incident_id, capital_id) {
    const mutationCql = \`UPDATE "incidents" SET capital_id = ? WHERE incident_id = ?\`;
    await this.storageHandler.execute(mutationCql, [null, incident_id], {
        prepare: true
    });
    const checkCql = \`SELECT * FROM "incidents" WHERE incident_id = ?\`;
    let result = await this.storageHandler.execute(checkCql, [incident_id]);
    return new Incident(result.first());
}
`

module.exports.cassandra_model_fieldMutation_bulkAssociate = `
/**
 * bulkAssociateIncidentWithCapital_id - bulkAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to add
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkAssociateIncidentWithCapital_id(bulkAssociationInput, benignErrorReporter) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "incident_id", "capital_id");
    let promises = [];
    let mutationCql = \`UPDATE "incidents" SET capital_id = ? WHERE incident_id IN ?\`
    mappedForeignKeys.forEach(({
        capital_id,
        incident_id
    }) => {
        promises.push(this.storageHandler.execute(mutationCql, [capital_id, incident_id], {
            prepare: true
        }))
    });


    await Promise.all(promises);
    return "Records successfully updated!"
}


/**
 * bulkDisAssociateIncidentWithCapital_id - bulkDisAssociaton of given ids
 *
 * @param  {array} bulkAssociationInput Array of associations to remove
 * @param  {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 * @return {string} returns message on success
 */
static async bulkDisAssociateIncidentWithCapital_id(bulkAssociationInput, benignErrorReporter) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "incident_id", "capital_id");
    let promises = [];
    let mutationCql = \`UPDATE "incidents" SET capital_id = ? WHERE incident_id IN ?\`
    mappedForeignKeys.forEach(({
        capital_id,
        incident_id
    }) => {
        promises.push(this.storageHandler.execute(mutationCql, [null, incident_id], {
            prepare: true
        }))
    });


    await Promise.all(promises);
    return "Records successfully updated!"
}
`