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
      "type": "to_many",
      "target": "river",
      "targetStorageType": "sql",
      "sourceKey": "river_ids",
      "targetKey": "city_ids",
      "keyIn": "city",
      "reverseAssociationType": "to_many"
    }
  },
  "internalId": "city_id"
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
      "type": "to_many",
      "target": "Instant",
      "targetKey": "incident_assoc_id",
      "keyIn" : "Instant",
      "targetStorageType": "cassandra"
    },
    "town": {
      "type": "to_one",
      "target": "capital",
      "targetKey": "capital_id",
      "keyIn" : "Incident",
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
      "type": "to_many",
      "target": "Dist_instant",
      "targetKey": "incident_assoc_id",
      "keyIn" : "Dist_instant",
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
      "type": "to_many",
      "target": "Dist_instant",
      "targetKey": "incident_assoc_id",
      "keyIn": "Dist_instant",
      "targetStorageType": "distributed-data-model"
    }

  },

  "internalId": "incident_id"
}

