module.exports.getOperators = function(storageType){
	switch (storageType) {
		case 'distributed-data-model':
		case 'generic':
		case 'sql':
			return `
	enum Operator {
		like notLike regexp notRegexp strContains
		eq gt gte lt lte ne between notBetween
		in notIn arrContains
		or and not all
	}	
	`
		case 'mongodb':
			return `
	enum Operator {
		like notLike regexp notRegexp strContains
		eq gt gte lt lte ne
		in notIn arrContains
		or and not
	}	
	`
		case 'neo4j':
			return `
	enum Operator {
		like notLike regexp notRegexp strContains
		eq gt gte lt lte ne
		in notIn arrContains
		or and not
	}	
	`
		case 'cassandra':
			return `
	enum Operator {
		eq gt gte lt lte ne
		in arrContains
		and
	}	
	`
		case 'amazon-s3':
		case 'trino':
		case 'presto':
			return `
				enum Operator {
					like notLike
					eq gt gte lt lte ne between notBetween
					in notIn arrContains
					or and not
				}	
				`
		default:
			break;
	}
}