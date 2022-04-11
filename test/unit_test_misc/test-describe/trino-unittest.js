module.exports.doctor_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`;
module.exports.doctor_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: doctor.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await doctor.readAllCursor(queryArg);
    cursorRes = cursorRes.doctors.reduce(
        (map, obj) => ((map[obj[doctor.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(doctor.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the trino storage type, based on SQL.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type doctor, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await doctor.readByIdLoader.load(id);
}
`;
module.exports.doctor_countRecords = `
static async countRecords(search, benignErrorReporter) {
    const whereOptions = prestoHelper.searchConditionsToTrino(
      search,
      definition
    );
    const query = \`SELECT COUNT(*) AS num FROM doctors \${whereOptions}\`;
    let num = null;
    try {
      const client = await this.storageHandler;
      const result = await prestoHelper.queryData(query, client);
      num = result[1][0][0];
    } catch (e) {
      throw new Error(e);
    }
    return num;
}
`;
module.exports.doctor_readAll = `
static async readAll(search, order, pagination, benignErrorReporter) {
    // build the whereOptions for limit-offset-based pagination
    const whereOptions = prestoHelper.searchConditionsToTrino(
      search,
      definition
    );
    const orderOptions = prestoHelper.orderConditionsToTrino(
      order,
      this.idAttribute(),
      true
    );

    const limit = pagination.limit;
    const offset = pagination.offset ? pagination.offset : 0;

    let query = \`SELECT * FROM (SELECT row_number() over() AS rn, * FROM doctors) \`;
    query +=
      whereOptions !== ""
        ? \`\${whereOptions} AND (rn BETWEEN \${offset + 1} AND \${offset + limit})\`
        : \`WHERE rn BETWEEN \${offset + 1} AND \${offset + limit}\`;
    query += \` \${orderOptions}\`;
    
    let result = null;
    try {
      const client = await this.storageHandler;
      result = await prestoHelper.queryData(query, client);
    } catch (e) {
      throw new Error(e);
    }
    result = doctor.postReadCast(result);

    return validatorUtil.bulkValidateData(
      "validateAfterRead",
      this,
      result,
      benignErrorReporter
    );
}
`;

module.exports.doctor_readAllCursor = `
static async readAllCursor(search, order, pagination, benignErrorReporter) {
    let isForwardPagination = helper.isForwardPagination(pagination);
    // build the whereOptions.
    let filter = prestoHelper.searchConditionsToTrino(search, definition);
    let newOrder = isForwardPagination ?
        order :
        helper.reverseOrderConditions(order);
    // depending on the direction build the order object
    let sort = prestoHelper.orderConditionsToTrino(
        newOrder,
        this.idAttribute(),
        isForwardPagination
    );
    let orderFields = newOrder ? newOrder.map((x) => x.field) : [];
    // extend the filter for the given order and cursor
    filter = prestoHelper.cursorPaginationArgumentsToTrino(
        pagination,
        sort,
        filter,
        orderFields,
        this.idAttribute(),
        definition.attributes
    );

    // add +1 to the LIMIT to get information about following pages.
    let limit;
    if (pagination) {
        limit = helper.isNotUndefinedAndNotNull(pagination.first) ?
            pagination.first + 1 :
            helper.isNotUndefinedAndNotNull(pagination.last) ?
            pagination.last + 1 :
            undefined;
    }

    let query = \`SELECT * FROM doctors  
      \${filter}  
      \${sort}\`;
    query += limit ? \` LIMIT \${limit}\` : '';
    let result = [];

    const client = await this.storageHandler;
    result = await prestoHelper.queryData(query, client);

    result = doctor.postReadCast(result);
    // validationCheck after read
    result = await validatorUtil.bulkValidateData(
        "validateAfterRead",
        this,
        result,
        benignErrorReporter
    );
    // get the first record (if exists) in the opposite direction to determine pageInfo.
    // if no cursor was given there is no need for an extra query as the results will start at the first (or last) page.
    let oppResult = [];
    if (pagination && (pagination.after || pagination.before)) {
        // reverse the pagination Arguement. after -> before; set first/last to 0, so LIMIT 1 is executed in the reverse Search
        let oppPagination = helper.reversePaginationArgument({
            ...pagination,
            includeCursor: false,
        });
        let oppForwardPagination = helper.isForwardPagination(oppPagination);
        // build the filter object.
        let oppFilter = prestoHelper.searchConditionsToTrino(search, definition);

        let oppOrder = oppForwardPagination ?
            order :
            helper.reverseOrderConditions(order);
        // depending on the direction build the order object
        let oppSort = prestoHelper.orderConditionsToTrino(
            oppOrder,
            this.idAttribute(),
            oppForwardPagination
        );
        let oppOrderFields = oppOrder ? oppOrder.map((x) => x.field) : [];
        // extend the filter for the given order and cursor
        oppFilter = prestoHelper.cursorPaginationArgumentsToTrino(
            oppPagination,
            oppSort,
            oppFilter,
            oppOrderFields,
            this.idAttribute(),
            definition.attributes
        );
        // add +1 to the LIMIT to get information about following pages.
        let oppLimit;
        if (pagination) {
            oppLimit = helper.isNotUndefinedAndNotNull(oppPagination.first) ?
                oppPagination.first + 1 :
                helper.isNotUndefinedAndNotNull(oppPagination.last) ?
                oppPagination.last + 1 :
                undefined;
        }
        query = \`SELECT * FROM doctors 
          \${oppFilter}  
          \${oppSort}\`;
        query += oppLimit ? \` LIMIT \${limit}\` : '';
        oppResult = await prestoHelper.queryData(query, client);
        oppResult = doctor.postReadCast(oppResult);
    }

    // build the graphql Connection Object
    result = result.map((res) => {
        return new doctor(res);
    });
    let edges = result.map((res) => {
        return {
            node: res,
            cursor: res.base64Encode(),
        };
    });
    const pageInfo = helper.buildPageInfo(edges, oppResult, pagination);
    return {
        edges,
        pageInfo,
        doctors: edges.map((edge) => edge.node)
    };
}
`;

module.exports.trino_adapter_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: dist_doctor_instance1.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await dist_doctor_instance1.readAllCursor(queryArg);
    cursorRes = cursorRes.dist_doctors.reduce(
        (map, obj) => ((map[obj[dist_doctor_instance1.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(dist_doctor_instance1.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the trino storage type, based on SQL.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type dist_doctor_instance1, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await dist_doctor_instance1.readByIdLoader.load(id);
}
`;
