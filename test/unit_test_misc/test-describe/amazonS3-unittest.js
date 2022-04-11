module.exports.reader_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`;

module.exports.reader_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: reader.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await reader.readAllCursor(queryArg);
    cursorRes = cursorRes.readers.reduce(
        (map, obj) => ((map[obj[reader.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(reader.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the Amazon S3 storage type, based on SQL.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type reader, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await reader.readByIdLoader.load(id);
}
`;

module.exports.reader_countRecords = `
static async countRecords(search, benignErrorReporter) {
    const whereOptions = amazonS3Helper.searchConditionsToAmazonS3(
      search,
      definition,
      config.arrayDelimiter
    );
    const query = {
      ...params,
      Expression: \`SELECT COUNT(*) AS num FROM S3Object \${whereOptions}\`,
    };
    let num = null;
    try {
      const s3 = await this.storageHandler;
      const result = await s3.selectObjectContent(query).promise();
      const events = result.Payload;
      for await (const event of events) {
        // Check the top-level field to determine which event this is.
        if (event.Records) {
          // handle Records event
          num = event.Records.Payload.toString();
          num = JSON.parse(num.slice(0, num.length - 1)).num;
        }
      }
    } catch (e) {
      throw new Error(e);
    }
    return num;
}
`;

module.exports.reader_readAllCursor = `
static async readAllCursor(search, order, pagination, benignErrorReporter){
  if (order) {
    console.log(\`order would be ignored because S3 doesn't support sorting\`);
  }
  let amazonS3Search =
   pagination && pagination.after
    ? amazonS3Helper.cursorPaginationArgumentsToAmazonS3(
      search,
      pagination,
      this.idAttribute()
      )
      : search;
  let whereOptions = amazonS3Helper.searchConditionsToAmazonS3(
    amazonS3Search,
    definition,
    config.arrayDelimiter
  );
  let query = \`SELECT * FROM S3Object \${whereOptions} \`;

  if (pagination && pagination.first) {
    query += \` LIMIT \${pagination.first+1}\`;
  }

  let records = [];
  try {
    const s3 = await this.storageHandler;
    const result = await s3
      .selectObjectContent({
        ...params,
        Expression: query,
        })
      .promise();
    const events = result.Payload;
    for await (const event of events) {
      // Check the top-level field to determine which event this is.
      if (event.Records) {
        // handle Records event
        records = event.Records.Payload.toString();
        records = JSON.parse("[" + records.slice(0, records.length - 1) + "]");
      }
    }
  } catch (e) {
    throw new Error(e);
  }

  // Construct return object
  records = records.map( row => { return new reader(reader.postReadCast(row))})
  let rows = records.map( row => {
      return {
        node: row,
        cursor: row.base64Encode(),
      }
  })

  let startCursor = null;
  let nextCursor = null;
  let hasNextCursor = false;

  if (pagination && pagination.first && rows.length > pagination.first) {
    rows.pop();
    startCursor = rows[0].cursor;
    nextCursor = rows[rows.length - 1].cursor;
    hasNextCursor = true;
  }

  let pageInfo = {
    startCursor: startCursor,
    endCursor: nextCursor,
    hasNextPage: hasNextCursor,
    hasPreviousPage: false,
  };
  return { edges: rows, pageInfo: pageInfo, readers: rows.map((edge) => edge.node)};
  }
`;

module.exports.amazonS3_adapter_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: dist_reader_instance1.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await dist_reader_instance1.readAllCursor(queryArg);
    cursorRes = cursorRes.dist_readers.reduce(
        (map, obj) => ((map[obj[dist_reader_instance1.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(dist_reader_instance1.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the Amazon S3 storage type, based on SQL.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type dist_reader_instance1, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await dist_reader_instance1.readByIdLoader.load(id);
}
`;
