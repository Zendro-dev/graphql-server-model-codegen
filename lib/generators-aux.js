/**
 * Get the default database key of a given model.
 * @param {string} dataModel data model definition object
 */
exports.getModelDatabase = function (dataModel) {
  // Sanity check: storageType is a required property, but database
  // should be set only for supported storage types.
  const validStorage = {
    sql: "default-sql",
    "sql-adapter": "default-sql",
    cassandra: "default-cassandra",
    "cassandra-adapter": "default-cassandra",
    mongodb: "default-mongodb",
    "mongodb-adapter": "default-mongodb",
    "amazon-s3": "default-amazonS3",
    "amazon-s3-adapter": "default-amazonS3",
    trino: "default-trino",
    "trino-adapter": "default-trino",
    presto: "default-presto",
    "presto-adapter": "default-presto",
    neo4j: "default-neo4j",
    "neo4j-adapter": "default-neo4j",
  };

  const storageType = dataModel.storageType.toLowerCase();

  const defaultDb = validStorage[storageType];

  return dataModel.database || defaultDb || "";
};
