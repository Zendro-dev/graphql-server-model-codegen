module.exports.book = {
  "model" : "Book",
  "storageType" : "cenzontle-web-service-adapter",
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
        "targetStorageType" : "cenz_server",
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
        "targetStorageType" : "cenz_server",
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
        "targetStorageType": "cenz_server"
      },

      "dogs" :{
        "type": "to_many",
        "target": "Dog",
        "targetKey": "personId",
        "keyIn": "Dog",
        "targetStorageType": "sql"
      }
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
