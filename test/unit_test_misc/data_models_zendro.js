module.exports.book = {
  "model" : "Book",
  "storageType" : "zendro-server",
  "url": "http://something.other:7070/graphql",
  "attributes" : {
    "title" : "String",
    "genre" : "String",
    "publisher_id": "Int"
  },
  "associations":{

      "Authors" : {
          "type" : "many_to_many",
          "implementation": "sql_cross_table",
          "target" : "Person",
          "targetKey" : "personId",
          "sourceKey" : "bookId",
          "keysIn" : "books_to_people",
          "targetStorageType" : "zendro-server",
          "label" : "firstName",
          "sublabel" : "email"
        },
      "publisher" : {
        "type" : "many_to_one",
        "implementation": "foreignkeys",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keysIn" : "Book",
        "targetStorageType" : "generic",
        "label" : "name"
        }
  }
}

module.exports.person = {
  "model" : "Person",
  "storageType" : "zendro-server",
  "url": "http://something.other:7070/graphql",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "companyId": "Int"
  },
  "associations":{
    "works":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "zendro-server",
      "label" : "title"
    },

    "company":{
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "publi_sher",
      "targetKey": "companyId",
      "keysIn": "Person",
      "targetStorageType": "generic"
    }
  }
}

module.exports.dog_one_assoc = {
  "model" : "Dog",
  "storageType" : "zendro-server",
  "url": "http://something.other:7070/graphql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int",
    "veterinarianId": "Int"
  },

  "associations" : {
    "owner" : {
      "type" : "many_to_one",
      "implementation": "foreignkeys",
      "target" : "Person",
      "targetKey" : "personId",
      "keysIn" : "Dog",
      "targetStorageType" : "sql"
    },

    "veterinarian" : {
      "type" : "many_to_one",
      "implementation": "foreignkeys",
      "target" : "Person",
      "targetKey" : "veterinarianId",
      "keysIn" : "Dog",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.person_one_assoc = {
  "model": "Person",
  "storageType": "zendro-server",
  "url": "http://something.other:7070/graphql",
  "attributes" :{
    "firstName": "String",
    "lastName": "String",
    "email" : "String",
    "companyId": "Int"
  },

  "associations" : {
    "unique_pet" :{
      "type": "many_to_one",
      "implementation": "foreignkeys",
      "target": "Dog",
      "targetKey": "personId",
      "keysIn": "Dog",
      "targetStorageType": "sql"
    },

    "patients" : {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "Dog",
      "targetKey": "veterinarianId",
      "keysIn": "Dog",
      "targetStorageType": "sql"
    }
  }
}
