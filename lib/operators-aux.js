module.exports.getOperators = function(storageType){
	switch (storageType) {
		case 'distributed-data-model':
		case 'generic':
	  case 'zendro-server':
			return 'GenericOperator'
		case 'sql':
		case 'sql-adapter':
			return 'SqlOperator';
		case 'mongodb':
		case 'mongodb-adapter':
			return 'MongodbOperator'
		case 'neo4j':
		case 'neo4j-adapter':
			return 'Neo4jOperator'
		case 'cassandra':
		case 'cassandra-adapter':
			return 'CassandraOperator'
		case 'amazon-s3':
		case 'amazon-s3-adapter':
			return 'AmazonS3Operator'
		case 'trino':
		case 'trino-adapter':
		case 'presto':
		case 'presto-adapter':
			return 'PrestoOperator'
		default:
			break;
	}
}