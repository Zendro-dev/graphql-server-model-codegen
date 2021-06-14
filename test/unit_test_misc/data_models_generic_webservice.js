module.exports.book =
{
  "model": "book",
  "storageType": "generic",
  "attributes": {
    "title": "String",
    "subject": "String",
    "Price": "Float",
    "publisher_id": "Int"
  },
  "associations": {
      "publisher" : {
        "type": "many_to_one",
        "implementation": "foreignkeys",
        "target": "publi_sher",
        "targetKey": "publisher_id",
        "keysIn": "book",
        "targetStorageType": "generic"
      },

      "authors": {
        "type": "one_to_many",
        "implementation": "foreignkeys",
        "target": "Person",
        "targetKey": "person_id",
        "sourceKey": "book_id",
        "targetStorageType": "generic"
      }
  }
}

module.exports.person =
{
  "model": "Person",
  "storageType": "generic",
  "attributes" :{
    "firstName": "String",
    "lastName": "String",
    "Age": "Int",
    "companyId": "Int"
  },

  "associations" : {
    "works" : {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "book",
      "targetKey": "book_id",
      "sourceKey": "person_id",
      "targetStorageType": "generic"
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

module.exports.publisher =
{
  "model" : "publi_sher",
  "storageType" : "generic",
  "attributes": {
    "name" : "String",
    "phone" : "String"
  },

  "associations": {
    "publications" : {
      "type": "one_to_many",
      "implementation": "foreignkeys",
      "target": "book",
      "targetKey": "publisher_id",
      "keysIn": "book",
      "targetStorageType": "generic"
    },

    "director":{
      "type":"many_to_one",
      "implementation": "foreignkeys",
      "target": "Person",
      "targetKey": "companyId",
      "keysIn": "Person",
      "targetStorageType": "generic"
    }
  }
}
