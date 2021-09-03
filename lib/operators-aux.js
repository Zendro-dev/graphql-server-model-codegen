module.exports.getOperators = function(storageType){
	switch (storageType) {
		case 'distributed-data-model':
		case 'generic':
	  case 'generic-adapter':
	  case 'zendro-server':
		case 'zendro-adapter':
		case 'sql':
		case 'sql-adapter':
		case 'trino':
		case 'trino-adapter':
		case 'presto':
		case 'presto-adapter':
			return 'PrestoSqlOperator'
		case 'mongodb':
		case 'mongodb-adapter':
		case 'neo4j':
		case 'neo4j-adapter':
			return 'MongodbNeo4jOperator'
		case 'cassandra':
		case 'cassandra-adapter':
			return 'CassandraOperator'
		case 'amazon-s3':
		case 'amazon-s3-adapter':
			return 'AmazonS3Operator'
		default:
			break;
	}
}