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
