module.exports.getOperators = function (storageType, operatorSet) {
  const storageTypes = [
    "generic",
    "generic-adapter",
    "zendro-server",
    "zendro-adapter",
    "zendro-webservice-adapter",
  ];
  if (operatorSet && storageTypes.includes(storageType)) {
    const operatorSets = [
      "GenericPrestoSqlOperator",
      "MongodbNeo4jOperator",
      "CassandraOperator",
      "AmazonS3Operator",
    ];
    if (operatorSets.includes(operatorSet)) {
      return operatorSet;
    } else {
      console.log("error", operatorSet);
      throw Error(`The given operator set is not defined. Please provide one of following operator sets: 
		GenericPrestoSqlOperator, MongodbNeo4jOperator, CassandraOperator, AmazonS3Operator.`);
    }
  } else {
    switch (storageType) {
      case "distributed-data-model":
      case "generic":
      case "generic-adapter":
      case "zendro-server":
      case "zendro-adapter":
      case "zendro-webservice-adapter":
      case "sql":
      case "sql-adapter":
      case "trino":
      case "trino-adapter":
      case "presto":
      case "presto-adapter":
        return "GenericPrestoSqlOperator";
      case "mongodb":
      case "mongodb-adapter":
      case "neo4j":
      case "neo4j-adapter":
        return "MongodbNeo4jOperator";
      case "cassandra":
      case "cassandra-adapter":
        return "CassandraOperator";
      case "amazon-s3":
      case "amazon-s3-adapter":
        return "AmazonS3Operator";
      default:
        break;
    }
  }
};
