module.exports.book = {
  "model" : "Book",
  "storageType" : "cenz-server",
  "url": "http://something.other:7000/graphql",
  "attributes" : {
    "title" : "String",
    "genre" : "String",
    "publisher_id": "Int"
  },
  "associations":{

      "Authors" : {
          "type" : "to_many",
          "target" : "Person",
          "targetKey" : "personId",
          "sourceKey" : "bookId",
          "keysIn" : "books_to_people",
          "targetStorageType" : "cenz-server",
          "label" : "firstName",
          "sublabel" : "email"
        },
      "publisher" : {
        "type" : "to_one",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keyIn" : "Book",
        "targetStorageType" : "webservice",
        "label" : "name"
        }
  }
}

module.exports.person = {
  "model" : "Person",
  "storageType" : "cenz-server",
  "url": "http://something.other:7000/graphql",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "companyId": "Int"
  },
  "associations":{
    "works":{
      "type" : "to_many",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "cenz-server",
      "label" : "title"
    },

    "company":{
      "type": "to_one",
      "target": "publi_sher",
      "targetKey": "companyId",
      "keyIn": "Person",
      "targetStorageType": "webservice"
    }
  }
}

module.exports.dog_one_assoc = {
  "model" : "Dog",
  "storageType" : "cenz-server",
  "url": "http://something.other:7000/graphql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int",
    "veterinarianId": "Int"
  },

  "associations" : {
    "owner" : {
      "type" : "to_one",
      "target" : "Person",
      "targetKey" : "personId",
      "keyIn" : "Dog",
      "targetStorageType" : "sql"
    },

    "veterinarian" : {
      "type" : "to_one",
      "target" : "Person",
      "targetKey" : "veterinarianId",
      "keyIn" : "Dog",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.person_one_assoc = {
  "model": "Person",
  "storageType": "cenz-server",
  "url": "http://something.other:7000/graphql",
  "attributes" :{
    "firstName": "String",
    "lastName": "String",
    "email" : "String",
    "companyId": "Int"
  },

  "associations" : {
    "unique_pet" :{
      "type": "to_one",
      "target": "Dog",
      "targetKey": "personId",
      "keyIn": "Dog",
      "targetStorageType": "sql"
    },

    "patients" : {
      "type": "to_many",
      "target": "Dog",
      "targetKey": "veterinarianId",
      "keyIn": "Dog",
      "targetStorageType": "sql"
    }
  }
}
