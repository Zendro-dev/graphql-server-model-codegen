
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
      "type" : "one_to_many",
      "implementation": "foreignkeys",
      "target" : "Dog",
      "targetKey" : "personId",
      "keysIn": "Dog",
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
      "type" : "many_to_one",
      "implementation": "foreignkeys",
      "target" : "Person",
      "targetKey" : "personId",
      "keysIn": "Dog",
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
      "type" : "many_to_one",
      "implementation": "foreignkeys",
      "target" : "Hometown",
      "targetKey" : "hometownId",
      "keysIn": "Person",
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
      "type" : "one_to_many",
      "implementation": "foreignkeys",
      "target" : "Person",
      "targetKey" : "hometownId",
      "keysIn": "Person",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    }
  },
  "internalId": "hometownId"
}

// 6. generic <generic_to_one> - dog
module.exports.dogGeneric_genericToOne_person = {
  "model" : "Dog",
  "storageType" : "generic",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },
  "associations" : {
    "owner" : {
      "type" : "many_to_one",
      "implementation": "generic",
      "target" : "Person"
    }
  }
}

// 7. sql <generic_to_many> - person
module.exports.personSql_genericToMany_dog = {
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
    "dogs": {
      "type": "one_to_many",
      "implementation": "generic",
      "target": "Dog"
    }
  },
  "internalId": "personId"
}

// 8. ddm <generic_to_one> - dog
module.exports.dogDdm_genericToOne_person = {
  "model" : "Dog",
  "storageType" : "distributed-data-model",
  "registry": ["dog-a", "dog-b"],
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },
  "associations" : {
    "owner" : {
      "type" : "many_to_one",
      "implementation": "generic",
      "target" : "Person"
    }
  }
}

// 8. dmm <generic_to_many> - person
module.exports.personDdm_genericToMany_dog = {
  "model" : "Person",
  "storageType" : "distributed-data-model",
  "registry": ["person-a", "person-b"],
  "attributes" : {
    "personId": "String",
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "hometownId": "String"
  },
  "associations":{
    "dogs": {
      "type": "one_to_many",
      "implementation": "generic",
      "target": "Dog"
    }
  },
  "internalId": "personId"
}

// 9. generic-adapter - person_a
module.exports.personGenericAdapter = {
  "model" : "Person",
  "storageType" : "generic-adapter",
  "adapterName": "person_a",
  "regex": "_a",
  "url": "http://localhost:3000/graphql",
  "attributes" : {
    "personId": "String",
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "hometownId": "String"
  },
  "internalId": "personId"
}
