module.exports.reader_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`;

module.exports.reader_readById = `
static async readById(id) {
    const query = {
      ...params,
      Expression: \`SELECT * FROM S3Object WHERE \${this.idAttribute()} = '\${id}'\`,
    };
    let item = null;
    try {
      const s3 = await this.storageHandler;
      const result = await s3.selectObjectContent(query).promise();
      const events = result.Payload;
      for await (const event of events) {
        // Check the top-level field to determine which event this is.
        if (event.Records) {
          // handle Records event
          item = event.Records.Payload.toString();
          item = JSON.parse(item.slice(0, item.length - 1));
        }
      }
      if (!item) {
        throw new Error(\`Record with ID = "\${id}" does not exist\`);
      }
    } catch (e) {
      throw new Error(e);
    }
    item = new reader(reader.postReadCast(item));
    return validatorUtil.validateData("validateAfterRead", this, item);
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
      query += \` LIMIT \${pagination.first}\`;
    }
  
    let records = null;
    let num = 0;
    try {
      const s3 = await this.storageHandler;
      let result = await s3
        .selectObjectContent({
          ...params,
          Expression: query,
          })
        .promise();
      let events = result.Payload;
      for await (const event of events) {
        // Check the top-level field to determine which event this is.
        if (event.Records) {
          // handle Records event
          records = event.Records.Payload.toString();
          records = JSON.parse("[" + records.slice(0, records.length - 1) + "]");
        }
      }
      query = \`SELECT COUNT(*) AS num FROM S3Object \${whereOptions}\`;
      result = await s3
        .selectObjectContent({
          ...params,
          Expression: query,
          })
        .promise();
        events = result.Payload;
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
  
    // Construct return object
    records = records.map( row => { return new reader(reader.postReadCast(row))})
    let rows = records.map( row => {
        return {
          node: row,
          cursor: row.base64Enconde(),
        }
    })
  
    let startCursor = null;
    let nextCursor = null;
    let hasNextCursor = false;
  
    if (pagination && pagination.first && num > pagination.first) {
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
    return { edges: rows, pageInfo: pageInfo, readers: rows.map((edge) => edge.node) };
  }
`;

module.exports.reader_bulkAddCsv = `
static async bulkAddCsv(context){
  let tmpFile = path.join(os.tmpdir(), uuidv4() + ".csv");
  try {
    await context.request.files.csv_file.mv(tmpFile);
    let file_param = {
      Bucket: config.bucket,
      Key: "reader.csv",
      Body: fs.createReadStream(tmpFile),
    };
    const s3 = await this.storageHandler;
    await s3.upload(file_param).promise();
    fs.unlinkSync(tmpFile);
  } catch (e) {
    fs.unlinkSync(tmpFile);
    throw new Error(e);
  }
  return \`Successfully upload file\`;
  }
`;

module.exports.amazonS3_adapter_readById = `
static async readById(id) {
    const query = {
      ...params,
      Expression: \`SELECT * FROM S3Object WHERE \${this.idAttribute()} = '\${id}'\`,
    };
    let item = null;
    try {
      const s3 = await this.storageHandler;
      const result = await s3.selectObjectContent(query).promise();
      const events = result.Payload;
      for await (const event of events) {
        // Check the top-level field to determine which event this is.
        if (event.Records) {
          // handle Records event
          item = event.Records.Payload.toString();
          item = JSON.parse(item.slice(0, item.length - 1));
        }
      }
      if (!item) {
        throw new Error(\`Record with ID = "\${id}" does not exist\`);
      }
    } catch (e) {
      throw new Error(e);
    }
    item = new dist_reader_instance1(dist_reader_instance1.postReadCast(item));
    return validatorUtil.validateData("validateAfterRead", this, item);
  }
`;
