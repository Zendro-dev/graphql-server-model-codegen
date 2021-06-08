module.exports.book = {
  "model" : "Book",
  "storageType" : "zendro-webservice-adapter",
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
        "type" : "many_to_many",
        "implementation": "sql_cross_table",
        "target" : "Person",
        "targetKey" : "personId",
        "sourceKey" : "bookId",
        "keysIn" : "books_to_people",
        "targetStorageType" : "sql",
        "label" : "firstName",
        "sublabel" : "email"
        },
      "publisher" : {
        "type" : "many_to_one",
        "implementation": "foreignkey",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keyIn" : "Book",
        "targetStorageType" : "zendro-server",
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
        "type" : "many_to_many",
        "implementation": "sql_cross_table",
        "target" : "Person",
        "targetKey" : "personId",
        "sourceKey" : "bookId",
        "keysIn" : "books_to_people",
        "targetStorageType" : "sql",
        "label" : "firstName",
        "sublabel" : "email"
        },
      "publisher" : {
        "type" : "many_to_one",
        "implementation": "foreignkey",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keyIn" : "Book",
        "targetStorageType" : "zendro-server",
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
        "type": "many_to_many",
        "implementation": "sql_cross_table",
        "target": "Book",
        "targetKey": "bookId",
        "sourceKey": "personId",
        "keysIn" : "books_to_people",
        "targetStorageType": "sql"
      },

      "company":{
        "type": "many_to_one",
        "implementation": "foreignkey",
        "target": "publi_sher",
        "targetKey": "companyId",
        "keyIn": "Person",
        "targetStorageType": "zendro-server"
      },

      "dogs" :{
        "type": "one_to_many",
        "implementation": "foreignkey",
        "target": "Dog",
        "targetKey": "personId",
        "keyIn": "Dog",
        "targetStorageType": "sql"
      },

      "parrot" :{
        "type": "many_to_one",
        "implementation": "foreignkey",
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
        "type" : "many_to_one",
        "implementation": "foreignkey",
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
              "type": "one_to_many",
              "implementation": "foreignkey",
              "target": "Book",
              "targetKey": "internalPersonId",
              "keyIn": "Book",
              "targetStorageType": "sql",
              "label": "title"
          }
      },
      "internalId": "internalPersonId"
  }

  module.exports.array_adapter_sql = {
      "model": "Arr",
      "storageType": "sql-adapter",
      "adapterName": "arrayLocalSql",
      "regex": "arrayLocal",
      "url": "http://localhost:3030/graphql",
      "attributes" : {
        "arrId": "String",
        "country": "String",
        "arrStr": "[String]",
        "arrInt": "[Int]",
        "arrFloat": "[Float]",
        "arrBool": "[Boolean]",
        "arrDate": "[Date]",
        "arrTime": "[Time]",
        "arrDateTime": "[DateTime]"
      },
      "internalId" : "arrId"
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
        "type": "many_to_one",
        "implementation": "foreignkey",
        "target": "Person",
        "targetKey": "internalPersonId",
        "keyIn": "Book",
        "targetStorageType": "zendro-server",
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
        "type" : "many_to_one",
        "implementation": "foreignkey",
        "target" : "person",
        "targetKey" : "person_id",
        "keyIn": "dog",
        "targetStorageType" : "distributed-data-model"
      }
    },
    "internalId": "dog_id"
  }


module.exports.dog_zendro_adapter_integration_test =
{
    "model" : "dog",
    "storageType" : "ddm-adapter",
    "adapterName": "dog_instance1",
    "regex": "instance1",
    "url": "http://server1:3000/graphql",
    "attributes" : {
        "name": "String",
      "dog_id": "String",
      "person_id": "String"
    },
    "associations": {
      "person": {
        "type" : "many_to_one",
        "implementation": "foreignkey",
        "target" : "person",
        "targetKey" : "person_id",
        "keyIn": "dog",
        "targetStorageType" : "distributed-data-model"
      }
    },
    "internalId": "dog_id"
  }
