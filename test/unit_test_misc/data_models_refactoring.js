module.exports.accession = {
  "model": "Accession",
  "storageType": "sql",
  "attributes": {
    "accession_id": "String",
    "collectors_name": "String",
    "collectors_initials": "String",
    "sampling_date": "Date",
    "locationId": "String"
  },

  "associations": {

    "individuals": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Individual",
      "targetKey": "accessionId",
      "keysIn" : "Individual",
      "targetStorageType": "sql",
      "label": "name"
    },

    "location": {
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "Location",
      "targetKey": "locationId",
      "keysIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Measurement",
      "targetKey": "accessionId",
      "keysIn" : "Measurement",
      "targetStorageType": "sql",
      "label": "name"
    }
  },

  "internalId" : "accession_id"
}


module.exports.accession_ddm = {
  "model": "Accession",
  "storageType": "distributed-data-model",
  "registry": ["ACCESSION_NE014", "ACCESSION_PGMN"],
  "attributes": {
    "accession_id": "String",
    "collectors_name": "String",
    "collectors_initials": "String",
    "sampling_date": "Date",
    "locationId": "String"
  },

  "associations": {

    "individuals": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Individual",
      "targetKey": "accessionId",
      "keysIn" : "Individual",
      "targetStorageType": "distributed-data-model",
      "label": "name"
    },

    "location": {
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "Location",
      "targetKey": "locationId",
      "keysIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Measurement",
      "targetKey": "accessionId",
      "keysIn" : "Measurement",
      "targetStorageType": "sql",
      "label": "name"
    }
  },

  "internalId" : "accession_id"
}

module.exports.accession_sql_adapter = {
  "model": "Accession",
  "storageType": "sql-adapter",
  "adapterName": "ACCESSION_YOLANDAPROJECT",
  "regex": "NE014",
  "url": "http://localhost:4050/graphql",
  "attributes": {
    "accession_id": "String",
    "collectors_name": "String",
    "collectors_initials": "String",
    "sampling_date": "Date",
    "locationId": "String"
  },

  "associations": {

    "individuals": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Individual",
      "targetKey": "accessionId",
      "keysIn" : "Individual",
      "targetStorageType": "sql",
      "label": "name"
    },

    "location": {
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "Location",
      "targetKey": "locationId",
      "keysIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Measurement",
      "targetKey": "accession_id",
      "keysIn" : "Measurement",
      "targetStorageType": "sql",
      "label": "name"
    }
  },

  "internalId" : "accession_id"
}

module.exports.accession_zendro_adapter = {
  "model": "Accession",
  "storageType": "zendro-webservice-adapter",
  "adapterName": "ACCESSION_PGMN",
  "regex": "pgmn",
  "url": "http://instance_1_pgmn_sdb_science_db_graphql_server_1:3001/graphql",
  "attributes": {
    "accession_id": "String",
    "collectors_name": "String",
    "collectors_initials": "String",
    "sampling_date": "Date",
    "locationId": "String"
  },

  "associations": {

    "individuals": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Individual",
      "targetKey": "accessionId",
      "keysIn" : "Individual",
      "targetStorageType": "sql",
      "label": "name"
    },


    "location": {
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "Location",
      "targetKey": "locationId",
      "keysIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Measurement",
      "targetKey": "accession_id",
      "keysIn" : "Measurement",
      "targetStorageType": "sql",
      "label": "name"
    }
  },

  "internalId" : "accession_id"
}
