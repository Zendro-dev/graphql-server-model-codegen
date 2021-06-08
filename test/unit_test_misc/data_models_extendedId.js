module.exports.book_adapter = {
    "model": "Book",
    "storageType": "zendro-webservice-adapter",
    "adapterName": "booksRemote_one",
    "regex": "one",
    "url": "http://localhost:3030/graphql",
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
            "targetStorageType": "sql",
            "label": "email"
        }
    },
    "internalId": "internalBookId"
}

module.exports.book_ddm = {
    "model": "Book",
    "storageType": "distributed-data-model",
    "registry": [
        "booksRemote_one",
        "booksRemote_two"
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

module.exports.person_adapter = {
    "model": "Person",
    "storageType": "zendro-webservice-adapter",
    "adapterName": "peopleRemote_one",
    "regex": "one",
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

module.exports.person_ddm = {
    "model": "Person",
    "storageType": "distributed-data-model",
    "registry": [
        "peopleRemote_one",
        "peopleRemote_two"
    ],
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
            "targetStorageType": "zendro-server",
            "label": "title"
        }
    },
    "internalId": "internalPersonId"
}


