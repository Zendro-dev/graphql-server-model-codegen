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
  cities: [city]
  pageInfo:pageInfo!
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
  citiesConnection(search:searchCityInput, order: [ orderCityInput ], pagination: paginationCursorInput!): CityConnection
}

type Mutation {
  addCity(city_id: ID!, name: String, intArr: [Int], strArr: [String], floatArr: [Float], boolArr: [Boolean], dateTimeArr: [DateTime]   , addRivers:[ID] , skipAssociationsExistenceChecks:Boolean = false): city!
  updateCity(city_id: ID!, name: String, intArr: [Int], strArr: [String], floatArr: [Float], boolArr: [Boolean], dateTimeArr: [DateTime]   , addRivers:[ID], removeRivers:[ID]  , skipAssociationsExistenceChecks:Boolean = false): city!
  deleteCity(city_id: ID!): String!
  bulkAddCityCsv: String!
}
\`;
`;

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
`;

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
`;

module.exports.cassandra_model_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`;

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
`;

module.exports.cassandra_model_countRecords = `
static async countRecords(search, benignErrorReporter, allowFiltering) {
  let whereOptions = cassandraHelper.searchConditionsToCassandra(search, definition, allowFiltering)
  const query = 'SELECT COUNT(*) AS count FROM "cities"' + whereOptions;
  let queryResult = await this.storageHandler.execute(query);
  let item = queryResult.first();
  return parseInt(item['count']);
}
`;

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

  let startCursor = null;
  let nextCursor = null;
  let hasNextCursor = false;

  /*
   * The pageState attribute is where Cassandra stores its own version of a cursor.
   * We cannot use it directly, because Cassandra uses different conventions. 
   * But its presence shows that there is a following page.
   */
  if (helper.isNotUndefinedAndNotNull(result.pageState)) {
      startCursor = rows[0].cursor;
      nextCursor = rows[rows.length - 1].cursor;
      hasNextCursor = true;
  }

  let pageInfo = {
    startCursor: startCursor,
    endCursor: nextCursor,
    hasNextPage: hasNextCursor,
    hasPreviousPage: false, // since cassandra does not support backward-pagination this will default false
  }
  return {
      edges: rows,
      pageInfo: pageInfo,
      cities: rows.map((edge) => edge.node)      
  };
}
`;

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
`;

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
`;

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
`;

module.exports.cassandra_model_fieldMutation_add = `
static async add_capital_id(incident_id, capital_id) {
  const mutationCql = \`UPDATE "incidents" SET capital_id = ? WHERE incident_id = ?\`;
  await this.storageHandler.execute(mutationCql, [capital_id, incident_id], {
    prepare: true
  });
  const checkCql = \`SELECT * FROM "incidents" WHERE incident_id = ?\`;
  let result = await this.storageHandler.execute(checkCql, [incident_id]);
  return new Incident(result.first());
}

`;
module.exports.cassandra_model_fieldMutation_remove = `
static async remove_capital_id(incident_id, capital_id) {
  const mutationCql = \`UPDATE "incidents" SET capital_id = ? WHERE incident_id = ?\`;
  await this.storageHandler.execute(mutationCql, [null, incident_id], {
    prepare: true
  });
  const checkCql = \`SELECT * FROM "incidents" WHERE incident_id = ?\`;
  let result = await this.storageHandler.execute(checkCql, [incident_id]);
  return new Incident(result.first());
}
`;

module.exports.cassandra_model_fieldMutation_bulkAssociate_add = `
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
`;

module.exports.cassandra_model_fieldMutation_bulkAssociate_remove = `
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
`;

module.exports.cassandra_ddm_model_readAllCursor = `
static readAllCursor(search, order, pagination, authorizedAdapters, benignErrorReporter, searchAuthorizedAdapters) {
  let authAdapters = [];
  /**
   * Differentiated cases:
   *    if authorizedAdapters is defined:
   *      - called from resolver.
   *      - authorizedAdapters will no be modified.
   *
   *    if authorizedAdapters is not defined:
   *      - called internally
   *      - authorizedAdapters will be set to registered adapters.
   */
  if (authorizedAdapters === undefined) {
    authAdapters = Object.values(this.registeredAdapters);
  } else {
    authAdapters = Array.from(authorizedAdapters)
  }

  // map the adapters authorized for 'search' to cassandra-adapters. This is needed to pass the 'allowFiltering' parameter to the cassandra-adapter
  let searchAuthAdapters = [];
  if (helper.isNotUndefinedAndNotNull(searchAuthorizedAdapters)) {
    searchAuthAdapters = Array.from(searchAuthorizedAdapters).filter(adapter => adapter.adapterType === 'cassandra-adapter').map(adapter => adapter.adapterName);
  }

  //use default BenignErrorReporter if no BenignErrorReporter defined
  benignErrorReporter = errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);


  let isForwardPagination = !pagination || !(pagination.last != undefined);
  let promises = authAdapters.map(adapter => {
    /**
     * Differentiated cases:
     *   sql-adapter:
     *      resolve with current parameters.
     *
     *   ddm-adapter:
     *   zendro-webservice-adapter:
     *   generic-adapter:
     *      add exclusions to search.excludeAdapterNames parameter.
     */
    switch (adapter.adapterType) {
      case 'ddm-adapter':
        let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
        return adapter.readAllCursor(nsearch, order, pagination, benignErrorReporter);

      case 'generic-adapter':
      case 'sql-adapter':
      case 'mongodb-adapter':
      case 'amazon-s3-adapter':
      case 'trino-adapter':
      case 'presto-adapter':
      case 'neo4j-adapter':
      case 'zendro-webservice-adapter':
        return adapter.readAllCursor(search, order, pagination, benignErrorReporter);
      case 'cassandra-adapter':
        return adapter.readAllCursor(search, pagination, benignErrorReporter, searchAuthAdapters.includes(adapter.adapterName));

      default:
        throw new Error(\`Adapter type '\${adapter.adapterType}' is not supported\`);
    }
  });
  let someHasNextPage = false;

  return Promise.allSettled(promises)
    //phase 1: reduce
    .then(results => {
      return results.reduce((total, current) => {
        //check if current is Error
        if (current.status === 'rejected') {
          benignErrorReporter.reportError(current.reason);
        }
        //check current
        else if (current.status === 'fulfilled') {
          if (current.value && current.value.pageInfo && current.value.edges) {
            someHasNextPage |= current.value.pageInfo.hasNextPage;

            total = total.concat(current.value.edges.map(e => e.node));
          }
        }
        return total;
      }, []);
    })
    //phase 2: validate & order & paginate
    .then(async nodes => {
      nodes = await validatorUtil.bulkValidateData('validateAfterRead', this, nodes, benignErrorReporter);

      if (pagination === undefined) {
        pagination = {
          first: Math.min(globals.LIMIT_RECORDS, nodes.length)
        }
      }


      let ordered_records = cassandraHelper.orderCassandraRecords(nodes);
      let paginated_records = helper.paginateRecordsCursor(ordered_records, pagination.limit);
      let hasNextPage = ordered_records.length > pagination.first || someHasNextPage;
      let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, false, "dist_incidents");
      return graphQLConnection;

    });
}
`;

module.exports.cassandra_ddm_cassandra_adapter_readById = `
static async readById(id) {
  const query = \`SELECT incident_id, incident_description, incident_number, token(incident_id) as toke FROM "dist_incidents" WHERE incident_id = ?\`;
  let queryResult = await this.storageHandler.execute(query, [id], {
    prepare: true
  });
  let firstResult = queryResult.first();
  if (firstResult === null) {
    throw new Error(\`Record with ID = "\${id}" does not exist\`);
  }
  let item = new dist_incident_instance1(firstResult);
  return validatorUtil.validateData('validateAfterRead', this, item);
}
`;

module.exports.cassandra_ddm_cassandra_adapter_readAllCursor = `
static async readAllCursor(search, pagination, benignErrorReporter, allowFiltering) {

  let cassandraSearch = pagination && pagination.after ? cassandraHelper.cursorPaginationArgumentsToCassandra(search, pagination, 'incident_id') : search;
  let whereOptions = cassandraHelper.searchConditionsToCassandra(cassandraSearch, definition, allowFiltering);

  let query = 'SELECT incident_id, incident_description, incident_number, token(incident_id) as toke FROM "dist_incidents"' + whereOptions;

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
    let rowAsDist_incident = new dist_incident_instance1(row);
    edge.node = rowAsDist_incident;
    edge.cursor = rowAsDist_incident.base64Enconde();
    return edge;
  });

  let startCursor = null;
  let nextCursor = null;
  let hasNextCursor = false;

  /*
   * The pageState attribute is where Cassandra stores its own version of a cursor.
   * We cannot use it directly, because Cassandra uses different conventions. 
   * But its presence shows that there is a following page.
   */
  if (helper.isNotUndefinedAndNotNull(result.pageState)) {
    startCursor = rows[0].cursor;
    nextCursor = rows[rows.length - 1].cursor;
    hasNextCursor = true;
  }

  let pageInfo = {
    startCursor: startCursor,
    endCursor: nextCursor,
    hasNextPage: hasNextCursor,
    hasPreviousPage: false, // since cassandra does not support backward-pagination this will default false
  }
  return {
    edges: rows,
    pageInfo: pageInfo,
    dist_incidents: rows.map((edge) => edge.node)    
  };
}
`;
