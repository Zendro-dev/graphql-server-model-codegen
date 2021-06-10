<h1 align=center>Code Generator</h1>

Command line utility to generate the structure files that Zendro [graphql-server](https://github.com/Zendro-dev/graphql-server) will use to perform CRUD operations for each model created.


## Set up

Clone the repository and run:
```sh
$ npm install -g
```
If you only want to install it locally run `npm install` instead


### Examples of use - Code Generator

In the same directory of this repository run:

```bash
# -f <input-json-files>   directory where json models are stored
# -o <output-directory>   directory where the generated code will be written
$ code-generator -f ./example_json_files -o /your_path_directory
```

For help using this command:

```bash
$ code-generator -h

# Code generator for the GraphQL server
#
# Options:
#
#   -f, --jsonFiles <filesFolder>      Folder containing one json file for each model
#   -o, --outputDirectory <directory>  Directory where generated code will be written
#   -h, --help                         output usage information
```

This command will create four sub-folders within the `output-directory` folder, containing the generated files for each model:


```
models/      -> sequelize model
schemas/     -> graphQL schema
resolvers/   -> basic CRUD resolvers
migrations/  -> create and delete table migration file
```

To use the code generator with the [graphql-server](https://github.com/Zendro-dev/graphql-server),
use its path in the `output-directory`.


## Development

To run the unit-test suite
```bash
$ npm run test-unit
```

To run the integration-test suite
```bash
$ npm run test-integration [-- OPTIONS]
```

To view the different integration-test commands and some examples
```bash
$ npm run test-integration -- -h
```


## JSON files Spec

Each json file describes one and only one model. (i.e if an association involves two models, this association needs to be specified in both json files, corresponding to each model).

For each model we need to specify the following fields in the json file:

Name | Type | Description
------- | ------- | --------------
*model*       | String | Name of the model (it is recommended to Capitalize the name).
*storageType* | String | Type of storage where the model is stored. Currently supported types are __sql__, __Webservice__, and __zendro\_server__
*url*         | String | This field is only mandatory for __zendro\_server__ stored models. Indicates the URL of the Zendro server storing the model.
*attributes*  | Object | The key of each entry is the name of the attribute. There are two options for the value: a string indicating the type of the attribute, or an object with two properties: _type_ (the type of the attribute) and _description_ (attribute description). See [types-spec](#types-spec) table below for allowed types. Example of option one: ```{ "attribute1" : "String", "attribute2: "Int" }``` Example of option two: ``` { "attribute1" : {"type" :"String", "description": "Some description"}, "attribute2: "Int ```
*associations* | Object | The key of each entry is the name of the association and the value should be an object describing the associations. See [Associations Spec](associations-spec) section below for the specifications of the associations.

EXAMPLES OF VALID JSON FILES

```jsonc
//Dog.json
{
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },

  "associations" : {
    "person" : {
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "reverseAssociation": "dogs",
      "target" : "Person",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql"
    }
  }
}

```

```jsonc
//Publisher.json
{
  "model" : "Publisher",
  "storageType" : "webservice",
  "attributes" : {
    "name" : "String",
    "phone" : "String"
  },
  "associations":{
      "books" : {
          "type" : "one_to_many",
          "implementation": "foreignkey",
          "reverseAssociation": "publisher",
          "target" : "Book",
          "targetKey" : "publisherId",
          "keysIn" : "Book",
          "targetStorageType" : "sql"
        }
  }
}
```



### Types Spec
The following types are allowed for the attributes field

 Type |
------- |
String |
Int |
Float |
Boolean |
Date |
Time |
DateTime |

For more info about `Date`, `Time`, and `DateTime` types, please see the [graphql-iso-date/rfc3339.txt](https://github.com/excitement-engineer/graphql-iso-date/blob/HEAD/rfc3339.txt).

Example:
* Date: A date string, such as `2007-12-03`.
* Time: A time string at UTC, such as `10:15:30Z`.
* DateTime: A date-time string at UTC, such as `2007-12-03T10:15:30Z`

### Associations Spec

We will consider four types of associations according to the relation between associated records of the two models:
1. one_to_one
2. many_to_one
3. one_to_many
4. many_to_many

For both type of association, the necessary arguments would be:

name | Type | Description
------- | ------- | --------------
*type* | String | Type of association (`one_to_one`, `one_to_many`, etc.)
*implementation* | String | implementation type of the association. Can be one of `foreignkey`, `generic` or `sql_cross_table` (only for `many_to_many`)`
*reverseAssociation* | String | The name of the reverse association from the other model. This field is only mandatory for building the [single-page-app](https://github.com/Zendro-dev/single-page-app), *not* for generating the the graphql-server code via this repository.
*target* | String | Name of model to which the current model will be associated with.
*targetKey* | String | A unique identifier of the association for the case where there appear more than one association with the same model.
*keysIn* | String | Name of the model where the targetKey is stored.
*targetStorageType* | String | Type of storage where the target model is stored. So far can be one of __sql__ or __Webservice__.
*label* | String | Name of the column in the target model to be used as a display name in the GUI.
*sublabel* | String | Optional name of the column in the target model to be used as a sub-label in the GUI.

When the association is of type *many_to_many* it's necessary to describe two extra arguments given that the association is made with a cross table. These arguments are:

name | Type | Description
------- | ------- | --------------
*sourceKey* | String | Key to identify the source id
*keysIn* | String | Name of the cross table

## NOTE:
Be aware that in the case of this type of association the user is required to describe the cross table used in the field _keysIn_ as a model in its own. For example, if we have a model `User` and a model `Role` and they are associated in a `many_to_many` way, then we also need to describe the `role_to_user` model:

```jsonc
//User model
{
  "model" : "User",
  "storageType" : "SQL",
  "attributes" : {
    "email" : "String",
    "password" : "String"
  },
  "associations" :{
    "roles" : {
      "type" : "many_to_many",
      "implementation": "foreignkey",
      "reverseAssociation": "dogs",
      "target" : "Role",
      "targetKey" : "role_Id",
      "sourceKey" : "user_Id",
      "keysIn" : "role_to_user",
      "targetStorageType" : "sql",
      "label": "name"
    }
  }

}
```

```jsonc
//Role model
{
  "model" : "Role",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "description" : "String"
  },
  "associations" : {
    "users" : {
      "type" : "to_many",
      "target" : "User",
      "implementation": "sql_cross_table",
      "reverseAssociation": "roles",
      "targetKey" : "user_Id",
      "sourceKey" : "role_Id",
      "keysIn" : "role_to_user",
      "targetStorageType" : "sql",
      "label": "email"
    }
  }
}
```

```jsonc
//role_to_user model
{
  "model" : "role_to_user",
  "storageType" : "SQL",
  "attributes" : {
    "user_Id" : "Int",
    "role_Id" : "Int"
  }
}

```

## NOTE:
 It's important to notice that when a model involves a foreign key for the association, this key should be explicitly written into the attributes field of the given local model.

Example:
```jsonc
{
  "model" : "book",
  "storageType" : "sql",
  "attributes" : {
    "title" : {"type":"String", "description": "The book's title"},
    "publisher_id": "Int"
  },
  "associations":{
      "publisher" : {
        "type" : "to_one", // association type
        "implementation": "foreignkey", // standard implementation via foreign keys
        "reverseAssociation": "dogs", // name of the association in the publisher model
        "target" : "publisher", // Model's name is `publisher`
        "targetKey" : "publisher_id", // Local alias for this association
        "keysIn": "book", // FK to publisher will be stored in the Book model
        "targetStorageType" : "Webservice", //  It's a remote database
        "label" : "name" // Show in GUI the name of the publisher taken from external DB
        }
  }
}
```

## NOTE:
THE SAME DATA MODELS DESCRIPTION(.json files) WILL BE USEFUL FOR GENERATING BOTH, THE BACKEND DESCRIBED HERE AND [THE FRONTEND OR GUI](https://github.com/ScienceDb/single-page-app-codegen).

Fields *`label`* and *`sublabel`* in the specification are only needed by the GUI generator, but backend generator will only read required information, therefore extra fields such as *`label`* and *`sublabel`* will be ignored by the backend generator.
Example:
```jsonc
//book.json
{
 "model" : "Book",
 "storageType" : "SQL",
 "attributes" : {
        "id" : "Int",
        "title" : {"type":"String", "description": "The book's title"},
        "ISBN": "Int"
    },
 "associations" : {
        "authors" : {
            "type" : "many_to_many",
            "implementation": "sql_cross_table",
            "reverseAssociation": "books",
            "target" : "Person",
            "targetKey" : "person_id",
            "sourceKey" : "book_id",
            "keysIn" : "person_to_book",
            "targetStorageType" : "sql",
            "label": "name",
            "sublabel": "lastname"
        }
    }
}
```

## Testing

For relevant files see `package.json` (section scripts), directories `.test` and `docker`. Test framework is `mocha` and `chai`.
