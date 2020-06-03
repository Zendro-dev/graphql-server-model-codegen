module.exports.book = {
  "model" : "Book",
  "storageType" : "cenzontle-webservice-adapter",
  "adapterName": "BooksOne",
  "regex": "one",
  "url": "http://localhost:3000/graphql",
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
        "targetStorageType" : "sql",
        "label" : "firstName",
        "sublabel" : "email"
        },
      "publisher" : {
        "type" : "to_one",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keyIn" : "Book",
        "targetStorageType" : "cenz-server",
        "label" : "name"
        }
  }

}

module.exports.book_ddm =
{
  "model" : "Book",
  "storageType" : "distributed-data-model",
  "registry": ["BooksOne", "BooksTwo"],
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
        "targetStorageType" : "sql",
        "label" : "firstName",
        "sublabel" : "email"
        },
      "publisher" : {
        "type" : "to_one",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keyIn" : "Book",
        "targetStorageType" : "cenz-server",
        "label" : "name"
        }
  }

}

module.exports.person_ddm =  {
    "model": "Person",
    "storageType": "distributed-data-model",
    "registry": ["PeopleOne","PeopleTwo" ],
    "attributes" :{
      "firstName": "String",
      "lastName": "String",
      "email" : "String",
      "companyId": "Int"
    },

    "associations" : {
      "works" : {
        "type": "to_many",
        "target": "Book",
        "targetKey": "bookId",
        "sourceKey": "personId",
        "keysIn" : "books_to_people",
        "targetStorageType": "sql"
      },

      "company":{
        "type": "to_one",
        "target": "publi_sher",
        "targetKey": "companyId",
        "keyIn": "Person",
        "targetStorageType": "cenz-server"
      },

      "dogs" :{
        "type": "to_many",
        "target": "Dog",
        "targetKey": "personId",
        "keyIn": "Dog",
        "targetStorageType": "sql"
      },

      "parrot" :{
        "type": "to_one",
        "target": "Parrot",
        "targetKey": "personId",
        "keyIn": "Parrot",
        "targetStorageType": "sql"
      },
    }

  }


module.exports.dog_ddm =  {
    "model" : "Dog",
    "storageType" : "distributed-data-model",
    "registry": ["DogsOne", "DogsTwo"],
    "attributes" : {
      "name" : "String",
      "breed" : "String",
      "personId": "String"
    },

    "associations" : {
      "owner" : {
        "type" : "to_one",
        "target" : "Person",
        "targetKey" : "personId",
        "keyIn" : "Dog",
        "targetStorageType" : "sql"
      }
    }
  }


  module.exports.person_adapter_sql = {
      "model": "Person",
      "storageType": "sql-adapter",
      "adapterName": "peopleLocalSql",
      "regex": "peopleLocal",
      "url": "http://localhost:3030/graphql",
      "attributes": {
          "firstName": "String",
          "lastName": "String",
          "email": "String",
          "companyId": "Int",
          "internalPersonId": "String"
      },
      "associations": {
          "works": {
              "type": "to_many",
              "target": "Book",
              "targetKey": "internalPersonId",
              "keyIn": "Book",
              "targetStorageType": "sql",
              "label": "title"
          }
      },
      "internalId": "internalPersonId"
  }


  module.exports.book_ddm_association = {
    "model": "Book",
    "storageType": "distributed-data-model",
    "registry": [
      "booksRemote",
      "booksLocalSql"
    ],
    "attributes": {
      "title": "String",
      "genre": "String",
      "internalPersonId": "String",
      "internalBookId": "String"
    },
    "associations": {
      "author": {
        "type": "to_one",
        "target": "Person",
        "targetKey": "internalPersonId",
        "keyIn": "Book",
        "targetStorageType": "cenz-server",
        "label": "email"
      }
    },
    "internalId": "internalBookId"
  }

module.exports.dog_ddm_integration_test = {
    "model" : "dog",
    "storageType" : "distributed-data-model",
    "registry": ["dog_instance1", "dog_instance2"],
    "attributes" : {
        "name": "String",
      "dog_id": "String",
      "person_id": "String"
    },
    "associations": {
      "person": {
        "type" : "to_one",
        "target" : "person",
        "targetKey" : "person_id",
        "keyIn": "dog",
        "targetStorageType" : "distributed-data-model"
      }
    },
    "internalId": "dog_id"
  }
