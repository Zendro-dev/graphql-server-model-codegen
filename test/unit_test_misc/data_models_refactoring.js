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
      "type": "to_many",
      "target": "Individual",
      "targetKey": "accessionId",
      "keyIn" : "Individual",
      "targetStorageType": "sql",
      "label": "name"
    },

    "location": {
      "type": "to_one",
      "target": "Location",
      "targetKey": "locationId",
      "keyIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "to_many",
      "target": "Measurement",
      "targetKey": "accessionId",
      "keyIn" : "Measurement",
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
      "type": "to_many",
      "target": "Individual",
      "targetKey": "accessionId",
      "keyIn" : "Individual",
      "targetStorageType": "distributed-data-model",
      "label": "name"
    },

    "location": {
      "type": "to_one",
      "target": "Location",
      "targetKey": "locationId",
      "keyIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "to_many",
      "target": "Measurement",
      "targetKey": "accessionId",
      "keyIn" : "Measurement",
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
      "type": "to_many",
      "target": "Individual",
      "targetKey": "accessionId",
      "keyIn" : "Individual",
      "targetStorageType": "sql",
      "label": "name"
    },

    "location": {
      "type": "to_one",
      "target": "Location",
      "targetKey": "locationId",
      "keyIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "to_many",
      "target": "Measurement",
      "targetKey": "accession_id",
      "keyIn" : "Measurement",
      "targetStorageType": "sql",
      "label": "name"
    }
  },

  "internalId" : "accession_id"
}

module.exports.accession_vocen_adapter = {
  "model": "Accession",
  "storageType": "vocen-webservice-adapter",
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
      "type": "to_many",
      "target": "Individual",
      "targetKey": "accessionId",
      "keyIn" : "Individual",
      "targetStorageType": "sql",
      "label": "name"
    },


    "location": {
      "type": "to_one",
      "target": "Location",
      "targetKey": "locationId",
      "keyIn" : "Accession",
      "targetStorageType": "sql",
      "label": "country",
      "sublabel": "state"
    },

    "measurements": {
      "type": "to_many",
      "target": "Measurement",
      "targetKey": "accession_id",
      "keyIn" : "Measurement",
      "targetStorageType": "sql",
      "label": "name"
    }
  },

  "internalId" : "accession_id"
}
