module.exports.city = {
  "model": "city",
  "storageType": "cassandra",
  "attributes": {
    "city_id": "String",
    "name": "String",

    "intArr": "[Int]",
    "strArr": "[String]",
    "floatArr": "[Float]",
    "boolArr": "[Boolean]",
    "dateTimeArr": "[DateTime]",

    "river_ids": "[String]"
  },
  "associations": {
    "rivers": {
      "type": "many_to_many",
      "implementation": "foreignkeys",
      "target": "river",
      "targetStorageType": "sql",
      "sourceKey": "river_ids",
      "targetKey": "city_ids",
      "keysIn": "city",
    }
  },
  "internalId": "city_id"
}

module.exports.river = {
  "model": "river",
  "storageType": "SQL",
  "attributes": {
    "name": "String",
    "length": "Int",
    "river_id": "String",
    
    "city_ids": "[String]"
  },
  "associations": {
    "countries": {
      "type": "many_to_many",
      "implementation": "sql_cross_table",
      "target": "country",
      "sourceKey": "river_id",
      "targetKey": "country_id",
      "keysIn": "country_to_river",
      "targetStorageType": "sql"
    },
    "cities": {
      "type": "many_to_many",
      "implementation": "foreignkeys",
      "target": "city",
      "targetStorageType": "cassandra",
      "sourceKey": "city_ids",
      "targetKey": "river_ids",
      "keysIn": "river"
    }
  },
  "internalId": "river_id"
}

module.exports.incident = {
  "model": "Incident",
  "storageType": "cassandra",
  "attributes": {
    "incident_id": "String",
    "incident_description": "String",
    "incident_number": "Int",
    "capital_id": "String"
  },

  "associations": {

    "instants": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Instant",
      "targetKey": "incident_assoc_id",
      "keysIn" : "Instant",
      "targetStorageType": "cassandra"
    },
    "town": {
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "capital",
      "targetKey": "capital_id",
      "keysIn" : "Incident",
      "targetStorageType": "sql"
    }

  },

  "internalId" : "incident_id"
}

module.exports.dist_incident = {
  "model": "Dist_incident",
  "storageType" : "distributed-data-model",
  "registry": ["dist_incident_instance1"],
  "cassandraRestrictions": true,
  "attributes": {
    "incident_id": "String",
    "incident_description": "String",
    "incident_number": "Int"
  },

  "associations": {

    "dist_instants": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Dist_instant",
      "targetKey": "incident_assoc_id",
      "keysIn" : "Dist_instant",
      "targetStorageType": "distributed-data-model"
    }

  },

  "internalId" : "incident_id"
}

module.exports.dist_instant_instance1 = {
  "model": "Dist_incident",
  "storageType": "cassandra-adapter",
  "adapterName": "dist_incident_instance1",
  "regex": "instance1",
  "attributes": {
    "incident_id": "String",
    "incident_description": "String",
    "incident_number": "Int"
  },

  "associations": {

    "dist_instants": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Dist_instant",
      "targetKey": "incident_assoc_id",
      "keysIn": "Dist_instant",
      "targetStorageType": "distributed-data-model"
    }

  },

  "internalId": "incident_id"
}

