
// 1. generic with no associations - person
module.exports.personGeneric_noAssociations = {
  "model" : "Person",
  "storageType" : "generic",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  }
}


// 2. sql <to_many> generic - person
module.exports.personSql_toMany_dogGeneric = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "to_many",
      "target" : "Dog",
      "targetKey" : "personId",
      "keyIn": "Dog",
      "targetStorageType" : "generic",
      "label": "name"
    }
  }
}
// 3. generic <to_one> sql - dog
module.exports.dogGeneric_toOne_personSql = {
  "model" : "Dog",
  "storageType" : "generic",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },
  "associations" : {
    "owner" : {
      "type" : "to_one",
      "target" : "Person",
      "targetKey" : "personId",
      "keyIn": "Dog",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    }
  }
}

// 4. sql <to_one> generic - person
module.exports.personSql_toOne_hometownGeneric = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "personId": "String",
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "hometownId": "String"
  },
  "associations":{
    "unique_homeTown":{
      "type" : "to_one",
      "target" : "Hometown",
      "targetKey" : "hometownId",
      "keyIn": "Person",
      "targetStorageType" : "generic",
      "label": "name"
    }
  },
  "internalId": "personId"
}
// 5. generic <to_many> sql - hometown
module.exports.hometownGeneric_toMany_personSql = {
  "model" : "Hometown",
  "storageType" : "generic",
  "attributes" : {
    "hometownId": "String",
    "name" : "String",
    "address": "String",
    "country": "String"
  },
  "associations" : {
    "people" : {
      "type" : "to_many",
      "target" : "Person",
      "targetKey" : "hometownId",
      "keyIn": "Person",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    }
  },
  "internalId": "hometownId"
}
