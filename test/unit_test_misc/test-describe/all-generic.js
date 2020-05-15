module.exports.test1 = `
  type Person{
    """
    @original-field
    """
    id: ID
    """
    @original-field
    
    """
    firstName: String

    """
    @original-field
    
    """
    lastName: String

    """
    @original-field
    
    """
    email: String

      
    }
type PersonConnection{
  edges: [PersonEdge]
  pageInfo: pageInfo!
}

type PersonEdge{
  cursor: String!
  node: Person!
}

  type VueTablePerson{
    data : [Person]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum PersonField {
    id
    firstName
    lastName
    email
  }
  input searchPersonInput {
    field: PersonField
    value: typeValue
    operator: Operator
    search: [searchPersonInput]
  }

  input orderPersonInput{
    field: PersonField
    order: Order
  }
  type Query {
    people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
    readOnePerson(id: ID!): Person
    countPeople(search: searchPersonInput ): Int
    vueTablePerson : VueTablePerson    csvTableTemplatePerson: [String]

    peopleConnection(search:searchPersonInput, order: [ orderPersonInput ], pagination: paginationCursorInput ): PersonConnection
  }
    type Mutation {
    addPerson( firstName: String, lastName: String, email: String    , skipAssociationsExistenceChecks:Boolean = false): Person!
    updatePerson(id: ID!, firstName: String, lastName: String, email: String    , skipAssociationsExistenceChecks:Boolean = false): Person!
  deletePerson(id: ID!): String!
  bulkAddPersonCsv: [Person] }
`

module.exports.test2 = `
  type Person{
    """
    @original-field
    """
    id: ID
    """
    @original-field
    
    """
    firstName: String

    """
    @original-field
    
    """
    lastName: String

    """
    @original-field
    
    """
    email: String

      
    """
    @search-request
    """
    dogsFilter(search: searchDogInput, order: [ orderDogInput ], pagination: paginationInput): [Dog]


    """
    @search-request
    """
    dogsConnection(search: searchDogInput, order: [ orderDogInput ], pagination: paginationCursorInput): DogConnection

    """
    @count-request
    """
    countFilteredDogs(search: searchDogInput) : Int
  
    }
type PersonConnection{
  edges: [PersonEdge]
  pageInfo: pageInfo!
}

type PersonEdge{
  cursor: String!
  node: Person!
}

  type VueTablePerson{
    data : [Person]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum PersonField {
    id
    firstName
    lastName
    email
  }
  input searchPersonInput {
    field: PersonField
    value: typeValue
    operator: Operator
    search: [searchPersonInput]
  }

  input orderPersonInput{
    field: PersonField
    order: Order
  }
  type Query {
    people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
    readOnePerson(id: ID!): Person
    countPeople(search: searchPersonInput ): Int
    vueTablePerson : VueTablePerson    csvTableTemplatePerson: [String]

    peopleConnection(search:searchPersonInput, order: [ orderPersonInput ], pagination: paginationCursorInput ): PersonConnection
  }
    type Mutation {
    addPerson( firstName: String, lastName: String, email: String   , addDogs:[ID] , skipAssociationsExistenceChecks:Boolean = false): Person!
    updatePerson(id: ID!, firstName: String, lastName: String, email: String   , addDogs:[ID], removeDogs:[ID]  , skipAssociationsExistenceChecks:Boolean = false): Person!
  deletePerson(id: ID!): String!
  bulkAddPersonCsv: [Person] }

`

module.exports.test3 = `
  type Dog{
    """
    @original-field
    """
    id: ID
    """
    @original-field
    
    """
    name: String

    """
    @original-field
    
    """
    breed: String

    """
    @original-field
    
    """
    personId: Int

    owner(search: searchPersonInput): Person
    
    }
type DogConnection{
  edges: [DogEdge]
  pageInfo: pageInfo!
}

type DogEdge{
  cursor: String!
  node: Dog!
}

  type VueTableDog{
    data : [Dog]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum DogField {
    id
    name
    breed
    personId
  }
  input searchDogInput {
    field: DogField
    value: typeValue
    operator: Operator
    search: [searchDogInput]
  }

  input orderDogInput{
    field: DogField
    order: Order
  }
  type Query {
    dogs(search: searchDogInput, order: [ orderDogInput ], pagination: paginationInput ): [Dog]
    readOneDog(id: ID!): Dog
    countDogs(search: searchDogInput ): Int
    vueTableDog : VueTableDog    csvTableTemplateDog: [String]

    dogsConnection(search:searchDogInput, order: [ orderDogInput ], pagination: paginationCursorInput ): DogConnection
  }
    type Mutation {
    addDog( name: String, breed: String , addOwner:ID   , skipAssociationsExistenceChecks:Boolean = false): Dog!
    updateDog(id: ID!, name: String, breed: String , addOwner:ID, removeOwner:ID    , skipAssociationsExistenceChecks:Boolean = false): Dog!
  deleteDog(id: ID!): String!
  bulkAddDogCsv: [Dog] }

`

module.exports.test4 = `
  type Person{
    """
    @original-field
    """
    personId: ID
    """
    @original-field
    
    """
    firstName: String

    """
    @original-field
    
    """
    lastName: String

    """
    @original-field
    
    """
    email: String

    """
    @original-field
    
    """
    hometownId: String

    unique_homeTown(search: searchHometownInput): Hometown
    
    }
type PersonConnection{
  edges: [PersonEdge]
  pageInfo: pageInfo!
}

type PersonEdge{
  cursor: String!
  node: Person!
}

  type VueTablePerson{
    data : [Person]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum PersonField {
    personId
    firstName
    lastName
    email
    hometownId
  }
  input searchPersonInput {
    field: PersonField
    value: typeValue
    operator: Operator
    search: [searchPersonInput]
  }

  input orderPersonInput{
    field: PersonField
    order: Order
  }
  type Query {
    people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
    readOnePerson(personId: ID!): Person
    countPeople(search: searchPersonInput ): Int
    vueTablePerson : VueTablePerson    csvTableTemplatePerson: [String]

    peopleConnection(search:searchPersonInput, order: [ orderPersonInput ], pagination: paginationCursorInput ): PersonConnection
  }
    type Mutation {
    addPerson(personId: ID!, firstName: String, lastName: String, email: String , addUnique_homeTown:ID   , skipAssociationsExistenceChecks:Boolean = false): Person!
    updatePerson(personId: ID!, firstName: String, lastName: String, email: String , addUnique_homeTown:ID, removeUnique_homeTown:ID    , skipAssociationsExistenceChecks:Boolean = false): Person!
  deletePerson(personId: ID!): String!
  bulkAddPersonCsv: [Person] }

`

module.exports.test5 = `
  type Hometown{
    """
    @original-field
    """
    hometownId: ID
    """
    @original-field
    
    """
    name: String

    """
    @original-field
    
    """
    address: String

    """
    @original-field
    
    """
    country: String

      
    """
    @search-request
    """
    peopleFilter(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput): [Person]


    """
    @search-request
    """
    peopleConnection(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationCursorInput): PersonConnection

    """
    @count-request
    """
    countFilteredPeople(search: searchPersonInput) : Int
  
    }
type HometownConnection{
  edges: [HometownEdge]
  pageInfo: pageInfo!
}

type HometownEdge{
  cursor: String!
  node: Hometown!
}

  type VueTableHometown{
    data : [Hometown]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum HometownField {
    hometownId
    name
    address
    country
  }
  input searchHometownInput {
    field: HometownField
    value: typeValue
    operator: Operator
    search: [searchHometownInput]
  }

  input orderHometownInput{
    field: HometownField
    order: Order
  }
  type Query {
    hometowns(search: searchHometownInput, order: [ orderHometownInput ], pagination: paginationInput ): [Hometown]
    readOneHometown(hometownId: ID!): Hometown
    countHometowns(search: searchHometownInput ): Int
    vueTableHometown : VueTableHometown    csvTableTemplateHometown: [String]

    hometownsConnection(search:searchHometownInput, order: [ orderHometownInput ], pagination: paginationCursorInput ): HometownConnection
  }
    type Mutation {
    addHometown(hometownId: ID!, name: String, address: String, country: String   , addPeople:[ID] , skipAssociationsExistenceChecks:Boolean = false): Hometown!
    updateHometown(hometownId: ID!, name: String, address: String, country: String   , addPeople:[ID], removePeople:[ID]  , skipAssociationsExistenceChecks:Boolean = false): Hometown!
  deleteHometown(hometownId: ID!): String!
  bulkAddHometownCsv: [Hometown] }

`

module.exports.test6 = `
/*
    Resolvers for basic CRUD operations for generic models
*/

const path = require('path');
const person = require(path.join(__dirname, '..', 'models_index.js')).person;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));
const globals = require('../config/globals');



const associationArgsDef = {}







/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
person.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];



        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}












/**
 * errorMessageForRecordsLimit(query) - returns error message in case the record limit is exceeded.
 *
 * @param {string} query The query that failed
 */
function errorMessageForRecordsLimit(query) {
    return "Max record limit of " + globals.LIMIT_RECORDS + " exceeded in " + query;
}

/**
 * checkCountAndReduceRecordsLimit(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCountAndReduceRecordsLimit(search, context, query) {
    let count = (await person.countRecords(search)).sum;
    if (count > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= count;
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOnePerson"));
    }
    context.recordsLimit -= 1;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let person = await resolvers.readOnePerson({
        id: id
    }, context);
    //check that record actually exists
    if (person === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];
    let promises_generic_to_many = [];
    let promises_generic_to_one = [];


    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);
    let result_generic_to_many = await Promise.all(promises_generic_to_many);
    let result_generic_to_one = await Promise.all(promises_generic_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;
    let get_generic_to_many_associated = result_generic_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_generic_to_one_associated = result_generic_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated + get_generic_to_many_associated + get_generic_to_one_associated;
}

/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context) {
    if (await countAllAssociatedRecords(id, context) > 0) {
        throw new Error(\`Person with id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
    }
    return true;
}

module.exports = {
    /**
     * people - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    people: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "people");
                return await person.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * peopleConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    peopleConnection: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "peopleConnection");
                return person.readAllCursor(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * readOnePerson - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOnePerson: function({
        id
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                checkCountForOneAndReduceRecordsLimit(context);
                return person.readById(id);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * countPeople - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countPeople: async function({
        search
    }, context) {
        return await checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                return await person.countRecords(search);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * vueTablePerson - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTablePerson: function(_, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, person, ["id", "firstName", "lastName", "email"]);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * addPerson - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addPerson: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Person', 'create');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdPerson = await person.addOne(inputSanitized);
                if (createdPerson) await createdPerson.handleAssociations(inputSanitized, context);
                return createdPerson;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * bulkAddPersonCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddPersonCsv: function(_, context) {
        return checkAuthorization(context, 'Person', 'create').then(authorization => {
            if (authorization === true) {
                return person.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deletePerson - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deletePerson: function({
        id
    }, context) {
        return checkAuthorization(context, 'Person', 'delete').then(async authorization => {
            if (authorization === true) {
                if (await validForDeletion(id, context)) {
                    return person.deleteOne(id);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * updatePerson - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updatePerson: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Person', 'update');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedPerson = await person.updateOne(inputSanitized);
                if (updatedPerson) await updatedPerson.handleAssociations(inputSanitized, context);
                return updatedPerson;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplatePerson - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplatePerson: function(_, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                return person.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}

`

module.exports.test7 = `
/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const person = require(path.join(__dirname, '..', 'models_index.js')).person;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));
const globals = require('../config/globals');


const associationArgsDef = {
    'addDogs': 'dog'
}




/**
 * person.prototype.dogsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
person.prototype.dogsFilter = function({
    search,
    order,
    pagination
}, context) {
    try {
        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "personId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.dogs({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

/**
 * person.prototype.countFilteredDogs - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
person.prototype.countFilteredDogs = function({
    search
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "personId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.countDogs({
            search: nsearch
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

/**
 * person.prototype.dogsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
person.prototype.dogsConnection = function({
    search,
    order,
    pagination
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "personId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.dogsConnection({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}




/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
person.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];
        if (helper.isNonEmptyArray(input.addDogs)) {
            promises.push(this.add_dogs(input, context));
        }
        if (helper.isNonEmptyArray(input.removeDogs)) {
            promises.push(this.remove_dogs(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}
/**
 * add_dogs - field Mutation for to_many associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
person.prototype.add_dogs = async function(input) {
    let results = [];
    for await (associatedRecordId of input.addDogs) {
        results.push(models.dog.add_personId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}


/**
 * remove_dogs - field Mutation for to_many associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
person.prototype.remove_dogs = async function(input) {
    let results = [];
    for await (associatedRecordId of input.removeDogs) {
        results.push(models.dog.remove_personId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}








/**
 * errorMessageForRecordsLimit(query) - returns error message in case the record limit is exceeded.
 *
 * @param {string} query The query that failed
 */
function errorMessageForRecordsLimit(query) {
    return "Max record limit of " + globals.LIMIT_RECORDS + " exceeded in " + query;
}

/**
 * checkCountAndReduceRecordsLimit(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCountAndReduceRecordsLimit(search, context, query) {
    let count = (await person.countRecords(search)).sum;
    if (count > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= count;
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOnePerson"));
    }
    context.recordsLimit -= 1;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let person = await resolvers.readOnePerson({
        id: id
    }, context);
    //check that record actually exists
    if (person === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];
    let promises_generic_to_many = [];
    let promises_generic_to_one = [];

    promises_to_many.push(person.countFilteredDogs({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);
    let result_generic_to_many = await Promise.all(promises_generic_to_many);
    let result_generic_to_one = await Promise.all(promises_generic_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;
    let get_generic_to_many_associated = result_generic_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_generic_to_one_associated = result_generic_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated + get_generic_to_many_associated + get_generic_to_one_associated;
}

/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context) {
    if (await countAllAssociatedRecords(id, context) > 0) {
        throw new Error(\`Person with id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
    }
    return true;
}

module.exports = {
    /**
     * people - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    people: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "people");
                return await person.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * peopleConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    peopleConnection: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "peopleConnection");
                return person.readAllCursor(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * readOnePerson - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOnePerson: function({
        id
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                checkCountForOneAndReduceRecordsLimit(context);
                return person.readById(id);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * countPeople - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countPeople: async function({
        search
    }, context) {
        return await checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                return (await person.countRecords(search)).sum;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * vueTablePerson - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTablePerson: function(_, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, person, ["id", "firstName", "lastName", "email"]);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * addPerson - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addPerson: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Person', 'create');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdPerson = await person.addOne(inputSanitized);
                await createdPerson.handleAssociations(inputSanitized, context);
                return createdPerson;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * bulkAddPersonCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddPersonCsv: function(_, context) {
        return checkAuthorization(context, 'Person', 'create').then(authorization => {
            if (authorization === true) {
                return person.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deletePerson - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deletePerson: function({
        id
    }, context) {
        return checkAuthorization(context, 'Person', 'delete').then(async authorization => {
            if (authorization === true) {
                if (await validForDeletion(id, context)) {
                    return person.deleteOne(id);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * updatePerson - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updatePerson: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Person', 'update');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedPerson = await person.updateOne(inputSanitized);
                await updatedPerson.handleAssociations(inputSanitized, context);
                return updatedPerson;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplatePerson - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplatePerson: function(_, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                return person.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}

`

module.exports.test8 = `
/*
    Resolvers for basic CRUD operations for generic models
*/

const path = require('path');
const dog = require(path.join(__dirname, '..', 'models_index.js')).dog;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));
const globals = require('../config/globals');



const associationArgsDef = {
    'addOwner': 'person'
}


/**
 * dog.prototype.owner - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.owner = async function({
    search
}, context) {

    if (helper.isNotUndefinedAndNotNull(this.personId)) {
        try {
            if (search === undefined) {
                return resolvers.readOnePerson({
                    [models.person.idAttribute()]: this.personId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.person.idAttribute(),
                    "value": {
                        "value": this.personId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.people({
                    search: nsearch
                }, context);
                if (found) {
                    return found[0]
                }
                return found;
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        };
    }
}





/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
dog.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];

        if (helper.isNotUndefinedAndNotNull(input.addOwner)) {
            promises.push(this.add_owner(input, context));
        }

        if (helper.isNotUndefinedAndNotNull(input.removeOwner)) {
            promises.push(this.remove_owner(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}


/**
 * add_owner - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
dog.prototype.add_owner = async function(input) {
    await dog.add_personId(this.getIdValue(), input.addOwner);
    this.personId = input.addOwner;
}



/**
 * remove_owner - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
dog.prototype.remove_owner = async function(input) {
    if (input.removeOwner === this.personId) {
        await dog.remove_personId(this.getIdValue(), input.removeOwner);
        this.personId = null;
    }
}







/**
 * errorMessageForRecordsLimit(query) - returns error message in case the record limit is exceeded.
 *
 * @param {string} query The query that failed
 */
function errorMessageForRecordsLimit(query) {
    return "Max record limit of " + globals.LIMIT_RECORDS + " exceeded in " + query;
}

/**
 * checkCountAndReduceRecordsLimit(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCountAndReduceRecordsLimit(search, context, query) {
    let count = (await dog.countRecords(search)).sum;
    if (count > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= count;
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOneDog"));
    }
    context.recordsLimit -= 1;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let dog = await resolvers.readOneDog({
        id: id
    }, context);
    //check that record actually exists
    if (dog === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];
    let promises_generic_to_many = [];
    let promises_generic_to_one = [];

    promises_to_one.push(dog.owner({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);
    let result_generic_to_many = await Promise.all(promises_generic_to_many);
    let result_generic_to_one = await Promise.all(promises_generic_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;
    let get_generic_to_many_associated = result_generic_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_generic_to_one_associated = result_generic_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated + get_generic_to_many_associated + get_generic_to_one_associated;
}

/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context) {
    if (await countAllAssociatedRecords(id, context) > 0) {
        throw new Error(\`Dog with id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
    }
    return true;
}

module.exports = {
    /**
     * dogs - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    dogs: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Dog', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "dogs");
                return await dog.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * dogsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    dogsConnection: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Dog', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "dogsConnection");
                return dog.readAllCursor(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * readOneDog - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneDog: function({
        id
    }, context) {
        return checkAuthorization(context, 'Dog', 'read').then(authorization => {
            if (authorization === true) {
                checkCountForOneAndReduceRecordsLimit(context);
                return dog.readById(id);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * countDogs - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countDogs: async function({
        search
    }, context) {
        return await checkAuthorization(context, 'Dog', 'read').then(async authorization => {
            if (authorization === true) {
                return await dog.countRecords(search);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * vueTableDog - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableDog: function(_, context) {
        return checkAuthorization(context, 'Dog', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, dog, ["id", "name", "breed"]);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * addDog - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addDog: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Dog', 'create');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdDog = await dog.addOne(inputSanitized);
                if (createdDog) await createdDog.handleAssociations(inputSanitized, context);
                return createdDog;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * bulkAddDogCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddDogCsv: function(_, context) {
        return checkAuthorization(context, 'Dog', 'create').then(authorization => {
            if (authorization === true) {
                return dog.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteDog - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteDog: function({
        id
    }, context) {
        return checkAuthorization(context, 'Dog', 'delete').then(async authorization => {
            if (authorization === true) {
                if (await validForDeletion(id, context)) {
                    return dog.deleteOne(id);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * updateDog - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateDog: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Dog', 'update');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedDog = await dog.updateOne(inputSanitized);
                if (updatedDog) await updatedDog.handleAssociations(inputSanitized, context);
                return updatedDog;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateDog - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateDog: function(_, context) {
        return checkAuthorization(context, 'Dog', 'read').then(authorization => {
            if (authorization === true) {
                return dog.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}

`

module.exports.test9 = `
/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const person = require(path.join(__dirname, '..', 'models_index.js')).person;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));
const globals = require('../config/globals');


const associationArgsDef = {
    'addUnique_homeTown': 'hometown'
}



/**
 * person.prototype.unique_homeTown - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
person.prototype.unique_homeTown = async function({
    search
}, context) {

    if (helper.isNotUndefinedAndNotNull(this.hometownId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneHometown({
                    [models.hometown.idAttribute()]: this.hometownId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.hometown.idAttribute(),
                    "value": {
                        "value": this.hometownId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.hometowns({
                    search: nsearch
                }, context);
                if (found) {
                    return found[0]
                }
                return found;
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        };
    }
}





/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
person.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];

        if (helper.isNotUndefinedAndNotNull(input.addUnique_homeTown)) {
            promises.push(this.add_unique_homeTown(input, context));
        }

        if (helper.isNotUndefinedAndNotNull(input.removeUnique_homeTown)) {
            promises.push(this.remove_unique_homeTown(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}
/**
 * add_unique_homeTown - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
person.prototype.add_unique_homeTown = async function(input) {
    await person.add_hometownId(this.getIdValue(), input.addUnique_homeTown);
    this.hometownId = input.addUnique_homeTown;
}

/**
 * remove_unique_homeTown - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
person.prototype.remove_unique_homeTown = async function(input) {
    if (input.removeUnique_homeTown === this.hometownId) {
        await person.remove_hometownId(this.getIdValue(), input.removeUnique_homeTown);
        this.hometownId = null;
    }
}







/**
 * errorMessageForRecordsLimit(query) - returns error message in case the record limit is exceeded.
 *
 * @param {string} query The query that failed
 */
function errorMessageForRecordsLimit(query) {
    return "Max record limit of " + globals.LIMIT_RECORDS + " exceeded in " + query;
}

/**
 * checkCountAndReduceRecordsLimit(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCountAndReduceRecordsLimit(search, context, query) {
    let count = (await person.countRecords(search)).sum;
    if (count > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= count;
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOnePerson"));
    }
    context.recordsLimit -= 1;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let person = await resolvers.readOnePerson({
        personId: id
    }, context);
    //check that record actually exists
    if (person === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];
    let promises_generic_to_many = [];
    let promises_generic_to_one = [];

    promises_to_one.push(person.unique_homeTown({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);
    let result_generic_to_many = await Promise.all(promises_generic_to_many);
    let result_generic_to_one = await Promise.all(promises_generic_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;
    let get_generic_to_many_associated = result_generic_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_generic_to_one_associated = result_generic_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated + get_generic_to_many_associated + get_generic_to_one_associated;
}

/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context) {
    if (await countAllAssociatedRecords(id, context) > 0) {
        throw new Error(\`Person with personId \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
    }
    return true;
}

module.exports = {
    /**
     * people - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    people: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "people");
                return await person.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * peopleConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    peopleConnection: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "peopleConnection");
                return person.readAllCursor(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * readOnePerson - Check user authorization and return one record with the specified personId in the personId argument.
     *
     * @param  {number} {personId}    personId of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with personId requested
     */
    readOnePerson: function({
        personId
    }, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                checkCountForOneAndReduceRecordsLimit(context);
                return person.readById(personId);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * countPeople - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countPeople: async function({
        search
    }, context) {
        return await checkAuthorization(context, 'Person', 'read').then(async authorization => {
            if (authorization === true) {
                return (await person.countRecords(search)).sum;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * vueTablePerson - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTablePerson: function(_, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, person, ["id", "personId", "firstName", "lastName", "email", "hometownId"]);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * addPerson - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addPerson: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Person', 'create');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdPerson = await person.addOne(inputSanitized);
                await createdPerson.handleAssociations(inputSanitized, context);
                return createdPerson;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * bulkAddPersonCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddPersonCsv: function(_, context) {
        return checkAuthorization(context, 'Person', 'create').then(authorization => {
            if (authorization === true) {
                return person.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deletePerson - Check user authorization and delete a record with the specified personId in the personId argument.
     *
     * @param  {number} {personId}    personId of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deletePerson: function({
        personId
    }, context) {
        return checkAuthorization(context, 'Person', 'delete').then(async authorization => {
            if (authorization === true) {
                if (await validForDeletion(personId, context)) {
                    return person.deleteOne(personId);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * updatePerson - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updatePerson: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Person', 'update');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedPerson = await person.updateOne(inputSanitized);
                await updatedPerson.handleAssociations(inputSanitized, context);
                return updatedPerson;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplatePerson - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplatePerson: function(_, context) {
        return checkAuthorization(context, 'Person', 'read').then(authorization => {
            if (authorization === true) {
                return person.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}

`

module.exports.test10 = `
/*
    Resolvers for basic CRUD operations for generic models
*/

const path = require('path');
const hometown = require(path.join(__dirname, '..', 'models_index.js')).hometown;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));
const globals = require('../config/globals');



const associationArgsDef = {
    'addPeople': 'person'
}



/**
 * hometown.prototype.peopleFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
hometown.prototype.peopleFilter = function({
    search,
    order,
    pagination
}, context) {
    try {
        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "hometownId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.people({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

/**
 * hometown.prototype.countFilteredPeople - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
hometown.prototype.countFilteredPeople = function({
    search
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "hometownId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.countPeople({
            search: nsearch
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

/**
 * hometown.prototype.peopleConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
hometown.prototype.peopleConnection = function({
    search,
    order,
    pagination
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "hometownId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.peopleConnection({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}




/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
hometown.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];
        if (helper.isNonEmptyArray(input.addPeople)) {
            promises.push(this.add_people(input, context));
        }
        if (helper.isNonEmptyArray(input.removePeople)) {
            promises.push(this.remove_people(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}

/**
 * add_people - field Mutation for to_many associations to add 
 *
 * @param {object} input   Info of input Ids to add  the association
 */
hometown.prototype.add_people = async function(input) {
    let results = [];
    for await (associatedRecordId of input.addPeople) {
        results.push(models.person.add_hometownId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}




/**
 * remove_people - field Mutation for to_many associations to remove 
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
hometown.prototype.remove_people = async function(input) {
    let results = [];
    for await (associatedRecordId of input.removePeople) {
        results.push(models.person.remove_hometownId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}









/**
 * errorMessageForRecordsLimit(query) - returns error message in case the record limit is exceeded.
 *
 * @param {string} query The query that failed
 */
function errorMessageForRecordsLimit(query) {
    return "Max record limit of " + globals.LIMIT_RECORDS + " exceeded in " + query;
}

/**
 * checkCountAndReduceRecordsLimit(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCountAndReduceRecordsLimit(search, context, query) {
    let count = (await hometown.countRecords(search)).sum;
    if (count > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= count;
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOneHometown"));
    }
    context.recordsLimit -= 1;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let hometown = await resolvers.readOneHometown({
        hometownId: id
    }, context);
    //check that record actually exists
    if (hometown === null) throw new Error(\`Record with ID = \${id} does not exist\`);
    let promises_to_many = [];
    let promises_to_one = [];
    let promises_generic_to_many = [];
    let promises_generic_to_one = [];

    promises_to_many.push(hometown.countFilteredPeople({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);
    let result_generic_to_many = await Promise.all(promises_generic_to_many);
    let result_generic_to_one = await Promise.all(promises_generic_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;
    let get_generic_to_many_associated = result_generic_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_generic_to_one_associated = result_generic_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated + get_generic_to_many_associated + get_generic_to_one_associated;
}

/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context) {
    if (await countAllAssociatedRecords(id, context) > 0) {
        throw new Error(\`Hometown with hometownId \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
    }
    return true;
}

module.exports = {
    /**
     * hometowns - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    hometowns: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Hometown', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "hometowns");
                return await hometown.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * hometownsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    hometownsConnection: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Hometown', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCountAndReduceRecordsLimit(search, context, "hometownsConnection");
                return hometown.readAllCursor(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * readOneHometown - Check user authorization and return one record with the specified hometownId in the hometownId argument.
     *
     * @param  {number} {hometownId}    hometownId of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with hometownId requested
     */
    readOneHometown: function({
        hometownId
    }, context) {
        return checkAuthorization(context, 'Hometown', 'read').then(authorization => {
            if (authorization === true) {
                checkCountForOneAndReduceRecordsLimit(context);
                return hometown.readById(hometownId);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * countHometowns - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countHometowns: async function({
        search
    }, context) {
        return await checkAuthorization(context, 'Hometown', 'read').then(async authorization => {
            if (authorization === true) {
                return await hometown.countRecords(search);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * vueTableHometown - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableHometown: function(_, context) {
        return checkAuthorization(context, 'Hometown', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, hometown, ["id", "hometownId", "name", "address", "country"]);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * addHometown - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addHometown: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Hometown', 'create');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdHometown = await hometown.addOne(inputSanitized);
                if (createdHometown) await createdHometown.handleAssociations(inputSanitized, context);
                return createdHometown;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * bulkAddHometownCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddHometownCsv: function(_, context) {
        return checkAuthorization(context, 'Hometown', 'create').then(authorization => {
            if (authorization === true) {
                return hometown.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteHometown - Check user authorization and delete a record with the specified hometownId in the hometownId argument.
     *
     * @param  {number} {hometownId}    hometownId of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteHometown: function({
        hometownId
    }, context) {
        return checkAuthorization(context, 'Hometown', 'delete').then(async authorization => {
            if (authorization === true) {
                if (await validForDeletion(hometownId, context)) {
                    return hometown.deleteOne(hometownId);
                }
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * updateHometown - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateHometown: async function(input, context) {
        try {
            let authorization = await checkAuthorization(context, 'Hometown', 'update');
            if (authorization === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedHometown = await hometown.updateOne(inputSanitized);
                if (updatedHometown) await updatedHometown.handleAssociations(inputSanitized, context);
                return updatedHometown;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateHometown - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateHometown: function(_, context) {
        return checkAuthorization(context, 'Hometown', 'read').then(authorization => {
            if (authorization === true) {
                return hometown.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}

`

module.exports.test11 = ` 
const _ = require('lodash');
const globals = require('../config/globals');
const helper = require('../utils/helper');

// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Person',
    storageType: 'generic',
    attributes: {
        firstName: 'String',
        lastName: 'String',
        email: 'String'
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};

module.exports = class Person {

    /**
     * constructor - Creates an instance of the generic model Person.
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */
    constructor({
        id,
        firstName,
        lastName,
        email
    }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    static get name() {
        return "person";
    }

    static get definition() {
        return definition;
    }

    /**
     * readById - Search for the Person record whose id is equal to the @id received as parameter.
     * Returns an instance of this class (Person), with all its properties
     * set from the values of the record fetched.
     * 
     * Returned value:
     *    new Person(record)
     * 
     * Thrown on:
     *    * No record found.
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from the record fetched.
     * @see: constructor() of the class Person;
     * 
     * @param  {Int} id The id of the record that needs to be fetched.
     * @return {Person} Instance of Person class.
     */
    static async readById(id) {

        /*
        YOUR CODE GOES HERE
         */
        throw new Error('readOnePerson is not implemented');
    }

    /**
     * countRecords - Count the number of records of model Person that match the filters provided
     * in the @search parameter. Returns the number of records counted.
     * @see: Cenzontle specifications for search object.
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * @param  {object} search Object with search filters.
     * @return {int} Number of records counted, that match the search filters.
     */
    static async countRecords(search) {

        /*
        YOUR CODE GOES HERE
        */
        throw new Error('countPeople is not implemented');
    }

    /**
     * readAll - Search for the multiple records that match the filters received
     * in the @search parameter. The final set of records is constrained by the 
     * limit/offset pagination properties received in the @pagination parameter 
     * and ordered by the specifications received in the @order parameter.
     * Returns an array of instances of this class (Person), where each instance
     * has its properties set from the values of one of the records fetched.
     * 
     * Returned value:
     *    for each record
     *    array.push( new Person(record) )
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from a record fetched.
     * @see: constructor() of the class Person;
     * @see: Cenzontle specifications for limit-offset pagination.
     * @see: Cenzontle specifications for search and order objects.
     * 
     * @param  {object} search     Object with search filters.
     * @param  {object} order      Object with order specifications.
     * @param  {object} pagination Object with limit/offset pagination properties.
     * @return {[Person]}    Array of instances of Person class.
     */
    static async readAll(search, order, pagination) {

        /*
        YOUR CODE GOES HERE
        */
        throw new Error('Read all people is not implemented');
    }

    /**
     * readAll - Search for the multiple records that match the filters received
     * in the @search parameter. The final set of records is constrained by the 
     * cursor based pagination properties received in the @pagination parameter 
     * and ordered by the specifications received in the @order parameter.
     * Returns an array of instances of this class (Person), where each instance
     * has its properties set from the values of one of the records fetched.
     * 
     * Returned value:
     *    { edges, pageInfo }
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from a record fetched.
     * @see: constructor() of the class Person;
     * @see: Cenzontle specificatons for cursor based pagination.
     * @see: Cenzontle specifications for search and order objects.
     * 
     * @param  {object} search     Object with search filters.
     * @param  {object} order      Object with order specifications.
     * @param  {object} pagination Object with pagination properties.
     * @return { edges, pageInfo } Object with edges and pageInfo.
     */
    static async readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }
        }
        let paginationSearch = null;

        /*
         * Count
         */
        return Person.countRecords(search).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("id")) {
                options['order'] = [...options['order'], ...[
                    ["id", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        paginationSearch = helper.parseOrderCursorGeneric(search, options['order'], decoded_cursor, "id", pagination.includeCursor);
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        paginationSearch = helper.parseOrderCursorGenericBefore(search, options['order'], decoded_cursor, "id", pagination.includeCursor);
                    }
                }
            }

            /*
             *  Count (with pagination search filters)
             */
            return Person.countRecords(paginationSearch).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }

                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }

                //set equivalent limit/offset pagination
                let paginationLimitOffset = {
                    limit: options['limit'],
                    offset: options['offset'],
                }

                /*
                 * Get records
                 * 
                 * paginationSearch: includes order.
                 *
                 */
                return Person.readAll(paginationSearch, order, paginationLimitOffset).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    /**
     * addOne - Creates a new record of model Person with the values provided
     * on @input object.
     * Only if record was created successfully, returns an instance of this class 
     * (Person), with all its properties set from the new record created.
     * If this function fails to create the new record, should throw an error.
     * 
     * Conventions on input's attributes values.
     *    1. undefined value: attributes with value equal to undefined are set to 
     *       null at creation time.
     *    2. non-existent: attributes not listed on the input are set to null at 
     *       creation time.
     *    3. null: attributes with value equal to null are set to null.
     * 
     * Returned value:
     *    new Person(newRecord)
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where newRecord is an object with all its properties set from the new record created.
     * @see: constructor() of the class Person;
     * 
     * @param  {Int} id The id of the record that needs to be fetched.
     * @return {Person} If successfully created, returns an instance of 
     * Person class constructed with the new record, otherwise throws an error.
     */
    static async addOne(input) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('addPerson is not implemented');
    }

    /**
     * updateOne - Updates the Person record whose id is equal to the value
     * of id attribute: 'id', which should be on received as input.
     * Only if record was updated successfully, returns an instance of this class 
     * (Person), with all its properties set from the record updated.
     * If this function fails to update the record, should throw an error.
     * 
     * Conventions on input's attributes values.
     *    1. undefined value: attributes with value equal to undefined are NOT
     *       updated.
     *    2. non-existent: attributes not listed on the input are NOT updated.
     *    3. null: attributes with value equal to null are set to null.
     * 
     * Returned value:
     *    new Person(updatedRecord)
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where updatedRecord is an object with all its properties set from the record updated.
     * @see: constructor() of the class Person;
     * 
     * @param  {object} input Input with properties to be updated. The special id 
     * attribute: 'id' should contains the id value of the record
     * that will be updated. 
     * @return {Person} If successfully created, returns an instance of 
     * Person class constructed with the new record, otherwise throws an error.
     */
    static async updateOne(input) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('updatePerson is not implemented');
    }

    /**
     * deleteOne - Delete the record whose id is equal to the @id received as parameter.
     * Only if record was deleted successfully, returns the id of the deleted record.
     * If this function fails to delete the record, should throw an error.
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * @param  {Int} id The id of the record that will be deleted.
     * @return {int} id of the record deleted or throws an error if the operation failed.
     */
    static async deleteOne(id) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('deletePerson is not implemented');
    }

    static async bulkAddCsv(context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('bulkAddPersonCsv is not implemented');
    }

    static async csvTableTemplate() {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('csvTableTemplatePerson is not implemented');
    }









    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Person.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Person.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Person.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Person.idAttribute()]
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(Person.definition.attributes);
        attributes.push('id');
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

};

`

module.exports.test12 = ` 
'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const searchArg = require('../utils/search-argument');
const globals = require('../config/globals');
const validatorUtil = require('../utils/validatorUtil');
const fileTools = require('../utils/file-tools');
const helpersAcl = require('../utils/helpers-acl');
const email = require('../utils/email');
const fs = require('fs');
const path = require('path');
const os = require('os');
const uuidv4 = require('uuidv4');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));
const moment = require('moment');
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Person',
    storageType: 'SQL',
    attributes: {
        firstName: 'String',
        lastName: 'String',
        email: 'String'
    },
    associations: {
        dogs: {
            type: 'to_many',
            target: 'Dog',
            targetKey: 'personId',
            keyIn: 'Dog',
            targetStorageType: 'generic',
            label: 'name',
            name: 'dogs',
            name_lc: 'dogs',
            name_cp: 'Dogs',
            target_lc: 'dog',
            target_lc_pl: 'dogs',
            target_pl: 'Dogs',
            target_cp: 'Dog',
            target_cp_pl: 'Dogs',
            keyIn_lc: 'dog',
            holdsForeignKey: false
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */

module.exports = class Person extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({

            firstName: {
                type: Sequelize[dict['String']]
            },
            lastName: {
                type: Sequelize[dict['String']]
            },
            email: {
                type: Sequelize[dict['String']]
            }


        }, {
            modelName: "person",
            tableName: "people",
            sequelize
        });
    }

    static associate(models) {}

    static readById(id) {
        let options = {};
        options['where'] = {};
        options['where'][this.idAttribute()] = id;
        return Person.findOne(options);
    }

    static async countRecords(search) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return {
            sum: await super.count(options),
            errors: []
        };
    }

    static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return super.count(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["id", "ASC"]
                ];
            }

            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }

            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
            }
            return super.findAll(options);
        });
    }

    static readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        /*
         * Count
         */
        return super.count(options).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("id")) {
                options['order'] = [...options['order'], ...[
                    ["id", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "id", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "id", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = {
                ...options['where']
            };
            /*
             *  Count (with only where-options)
             */
            return super.count(woptions).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }
                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }

                /*
                 * Get records
                 */
                return super.findAll(options).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    static addOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then(async (valSuccess) => {
                try {
                    const result = await sequelize.transaction(async (t) => {
                        let item = await super.create(input, {
                            transaction: t
                        });
                        return item;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static deleteOne(id) {
        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(\`Record with ID = \${id} does not exist\`);

                return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
                    .then((valSuccess) => {
                        return item
                            .destroy()
                            .then(() => {
                                return 'Item successfully deleted';
                            });
                    }).catch((err) => {
                        return err
                    })
            });

    }

    static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {
                    let result = await sequelize.transaction(async (t) => {
                        let promises_associations = [];
                        let item = await super.findByPk(input[this.idAttribute()], {
                            transaction: t
                        });
                        if (item === null) {
                            throw new Error(\`Record with ID = \${id} does not exist\`);
                        }
                        let updated = await item.update(input, {
                            transaction: t
                        });
                        return updated;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static bulkAddCsv(context) {

        let delim = context.request.body.delim;
        let cols = context.request.body.cols;
        let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

        context.request.files.csv_file.mv(tmpFile).then(() => {

            fileTools.parseCsvStream(tmpFile, this, delim, cols).then((addedZipFilePath) => {
                try {
                    console.log(\`Sending \${addedZipFilePath} to the user.\`);

                    let attach = [];
                    attach.push({
                        filename: path.basename("added_data.zip"),
                        path: addedZipFilePath
                    });

                    email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                        'ScienceDB batch add',
                        'Your data has been successfully added to the database.',
                        attach).then(function(info) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.log(info);
                    }).catch(function(err) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.error(err);
                    });

                } catch (error) {
                    console.error(error.message);
                }

                fs.unlinkSync(tmpFile);
            }).catch((error) => {
                email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                    'ScienceDB batch add', \`\${error.message}\`).then(function(info) {
                    console.error(info);
                }).catch(function(err) {
                    console.error(err);
                });

                fs.unlinkSync(tmpFile);
            });

        }).catch((error) => {
            throw new Error(error);
        });
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(Person);
    }











    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Person.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Person.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Person.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Person.idAttribute()]
    }

    static get definition() {
        return definition;
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(Person.definition.attributes);
        attributes.push('id');
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

}

`

module.exports.test13 = ` 
const _ = require('lodash');
const globals = require('../config/globals');
const helper = require('../utils/helper');

// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Dog',
    storageType: 'generic',
    attributes: {
        name: 'String',
        breed: 'String',
        personId: 'Int'
    },
    associations: {
        owner: {
            type: 'to_one',
            target: 'Person',
            targetKey: 'personId',
            keyIn: 'Dog',
            targetStorageType: 'sql',
            label: 'firstName',
            sublabel: 'lastName',
            name: 'owner',
            name_lc: 'owner',
            name_cp: 'Owner',
            target_lc: 'person',
            target_lc_pl: 'people',
            target_pl: 'People',
            target_cp: 'Person',
            target_cp_pl: 'People',
            keyIn_lc: 'dog',
            holdsForeignKey: true
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};

module.exports = class Dog {

    /**
     * constructor - Creates an instance of the generic model Dog.
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */
    constructor({
        id,
        name,
        breed,
        personId
    }) {
        this.id = id;
        this.name = name;
        this.breed = breed;
        this.personId = personId;
    }

    static get name() {
        return "dog";
    }

    static get definition() {
        return definition;
    }

    /**
     * readById - Search for the Dog record whose id is equal to the @id received as parameter.
     * Returns an instance of this class (Dog), with all its properties
     * set from the values of the record fetched.
     * 
     * Returned value:
     *    new Dog(record)
     * 
     * Thrown on:
     *    * No record found.
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from the record fetched.
     * @see: constructor() of the class Dog;
     * 
     * @param  {Int} id The id of the record that needs to be fetched.
     * @return {Dog} Instance of Dog class.
     */
    static async readById(id) {

        /*
        YOUR CODE GOES HERE
         */
        throw new Error('readOneDog is not implemented');
    }

    /**
     * countRecords - Count the number of records of model Dog that match the filters provided
     * in the @search parameter. Returns the number of records counted.
     * @see: Cenzontle specifications for search object.
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * @param  {object} search Object with search filters.
     * @return {int} Number of records counted, that match the search filters.
     */
    static async countRecords(search) {

        /*
        YOUR CODE GOES HERE
        */
        throw new Error('countDogs is not implemented');
    }

    /**
     * readAll - Search for the multiple records that match the filters received
     * in the @search parameter. The final set of records is constrained by the 
     * limit/offset pagination properties received in the @pagination parameter 
     * and ordered by the specifications received in the @order parameter.
     * Returns an array of instances of this class (Dog), where each instance
     * has its properties set from the values of one of the records fetched.
     * 
     * Returned value:
     *    for each record
     *    array.push( new Dog(record) )
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from a record fetched.
     * @see: constructor() of the class Dog;
     * @see: Cenzontle specifications for limit-offset pagination.
     * @see: Cenzontle specifications for search and order objects.
     * 
     * @param  {object} search     Object with search filters.
     * @param  {object} order      Object with order specifications.
     * @param  {object} pagination Object with limit/offset pagination properties.
     * @return {[Dog]}    Array of instances of Dog class.
     */
    static async readAll(search, order, pagination) {

        /*
        YOUR CODE GOES HERE
        */
        throw new Error('Read all dogs is not implemented');
    }

    /**
     * readAll - Search for the multiple records that match the filters received
     * in the @search parameter. The final set of records is constrained by the 
     * cursor based pagination properties received in the @pagination parameter 
     * and ordered by the specifications received in the @order parameter.
     * Returns an array of instances of this class (Dog), where each instance
     * has its properties set from the values of one of the records fetched.
     * 
     * Returned value:
     *    { edges, pageInfo }
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from a record fetched.
     * @see: constructor() of the class Dog;
     * @see: Cenzontle specificatons for cursor based pagination.
     * @see: Cenzontle specifications for search and order objects.
     * 
     * @param  {object} search     Object with search filters.
     * @param  {object} order      Object with order specifications.
     * @param  {object} pagination Object with pagination properties.
     * @return { edges, pageInfo } Object with edges and pageInfo.
     */
    static async readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }
        }
        let paginationSearch = null;

        /*
         * Count
         */
        return Dog.countRecords(search).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("id")) {
                options['order'] = [...options['order'], ...[
                    ["id", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        paginationSearch = helper.parseOrderCursorGeneric(search, options['order'], decoded_cursor, "id", pagination.includeCursor);
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        paginationSearch = helper.parseOrderCursorGenericBefore(search, options['order'], decoded_cursor, "id", pagination.includeCursor);
                    }
                }
            }

            /*
             *  Count (with pagination search filters)
             */
            return Dog.countRecords(paginationSearch).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }

                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total dogs exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }

                //set equivalent limit/offset pagination
                let paginationLimitOffset = {
                    limit: options['limit'],
                    offset: options['offset'],
                }

                /*
                 * Get records
                 * 
                 * paginationSearch: includes order.
                 *
                 */
                return Dog.readAll(paginationSearch, order, paginationLimitOffset).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    /**
     * addOne - Creates a new record of model Dog with the values provided
     * on @input object.
     * Only if record was created successfully, returns an instance of this class 
     * (Dog), with all its properties set from the new record created.
     * If this function fails to create the new record, should throw an error.
     * 
     * Conventions on input's attributes values.
     *    1. undefined value: attributes with value equal to undefined are set to 
     *       null at creation time.
     *    2. non-existent: attributes not listed on the input are set to null at 
     *       creation time.
     *    3. null: attributes with value equal to null are set to null.
     * 
     * Returned value:
     *    new Dog(newRecord)
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where newRecord is an object with all its properties set from the new record created.
     * @see: constructor() of the class Dog;
     * 
     * @param  {Int} id The id of the record that needs to be fetched.
     * @return {Dog} If successfully created, returns an instance of 
     * Dog class constructed with the new record, otherwise throws an error.
     */
    static async addOne(input) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('addDog is not implemented');
    }

    /**
     * updateOne - Updates the Dog record whose id is equal to the value
     * of id attribute: 'id', which should be on received as input.
     * Only if record was updated successfully, returns an instance of this class 
     * (Dog), with all its properties set from the record updated.
     * If this function fails to update the record, should throw an error.
     * 
     * Conventions on input's attributes values.
     *    1. undefined value: attributes with value equal to undefined are NOT
     *       updated.
     *    2. non-existent: attributes not listed on the input are NOT updated.
     *    3. null: attributes with value equal to null are set to null.
     * 
     * Returned value:
     *    new Dog(updatedRecord)
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where updatedRecord is an object with all its properties set from the record updated.
     * @see: constructor() of the class Dog;
     * 
     * @param  {object} input Input with properties to be updated. The special id 
     * attribute: 'id' should contains the id value of the record
     * that will be updated. 
     * @return {Dog} If successfully created, returns an instance of 
     * Dog class constructed with the new record, otherwise throws an error.
     */
    static async updateOne(input) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('updateDog is not implemented');
    }

    /**
     * deleteOne - Delete the record whose id is equal to the @id received as parameter.
     * Only if record was deleted successfully, returns the id of the deleted record.
     * If this function fails to delete the record, should throw an error.
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * @param  {Int} id The id of the record that will be deleted.
     * @return {int} id of the record deleted or throws an error if the operation failed.
     */
    static async deleteOne(id) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('deleteDog is not implemented');
    }

    static async bulkAddCsv(context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('bulkAddDogCsv is not implemented');
    }

    static async csvTableTemplate() {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('csvTableTemplateDog is not implemented');
    }


    /**
     * add_personId - field Mutation (model-layer) for to_one associationsArguments to add 
     *
     * @param {Id}   id   IdAttribute of the root model to be updated
     * @param {Id}   personId Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async add_personId(id, personId) {
        let updated = await Dog.updateOne({
            id: id,
            personId: personId
        });
        return updated;
    }

    /**
     * remove_personId - field Mutation (model-layer) for to_one associationsArguments to remove 
     *
     * @param {Id}   id   IdAttribute of the root model to be updated
     * @param {Id}   personId Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async remove_personId(id, personId) {
        let updated = await Dog.updateOne({
            id: id,
            personId: null
        });
        return updated;
    }






    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Dog.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Dog.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Dog.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Dog.idAttribute()]
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(Dog.definition.attributes);
        attributes.push('id');
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

};

`

module.exports.test14 = ` 
'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const searchArg = require('../utils/search-argument');
const globals = require('../config/globals');
const validatorUtil = require('../utils/validatorUtil');
const fileTools = require('../utils/file-tools');
const helpersAcl = require('../utils/helpers-acl');
const email = require('../utils/email');
const fs = require('fs');
const path = require('path');
const os = require('os');
const uuidv4 = require('uuidv4');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));
const moment = require('moment');
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Person',
    storageType: 'SQL',
    attributes: {
        personId: 'String',
        firstName: 'String',
        lastName: 'String',
        email: 'String',
        hometownId: 'String'
    },
    associations: {
        unique_homeTown: {
            type: 'to_one',
            target: 'Hometown',
            targetKey: 'hometownId',
            keyIn: 'Person',
            targetStorageType: 'generic',
            label: 'name',
            name: 'unique_homeTown',
            name_lc: 'unique_homeTown',
            name_cp: 'Unique_homeTown',
            target_lc: 'hometown',
            target_lc_pl: 'hometowns',
            target_pl: 'Hometowns',
            target_cp: 'Hometown',
            target_cp_pl: 'Hometowns',
            keyIn_lc: 'person',
            holdsForeignKey: true
        }
    },
    internalId: 'personId',
    id: {
        name: 'personId',
        type: 'String'
    }
};

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */

module.exports = class Person extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({

            personId: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },
            firstName: {
                type: Sequelize[dict['String']]
            },
            lastName: {
                type: Sequelize[dict['String']]
            },
            email: {
                type: Sequelize[dict['String']]
            },
            hometownId: {
                type: Sequelize[dict['String']]
            }


        }, {
            modelName: "person",
            tableName: "people",
            sequelize
        });
    }

    static associate(models) {}

    static readById(id) {
        let options = {};
        options['where'] = {};
        options['where'][this.idAttribute()] = id;
        return Person.findOne(options);
    }

    static async countRecords(search) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return {
            sum: await super.count(options),
            errors: []
        };
    }

    static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return super.count(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["personId", "ASC"]
                ];
            }

            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }

            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
            }
            return super.findAll(options);
        });
    }

    static readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        /*
         * Count
         */
        return super.count(options).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("personId")) {
                options['order'] = [...options['order'], ...[
                    ["personId", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "personId", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "personId", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = {
                ...options['where']
            };
            /*
             *  Count (with only where-options)
             */
            return super.count(woptions).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }
                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }

                /*
                 * Get records
                 */
                return super.findAll(options).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    static addOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then(async (valSuccess) => {
                try {
                    const result = await sequelize.transaction(async (t) => {
                        let item = await super.create(input, {
                            transaction: t
                        });
                        return item;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static deleteOne(id) {
        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(\`Record with ID = \${id} does not exist\`);

                return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
                    .then((valSuccess) => {
                        return item
                            .destroy()
                            .then(() => {
                                return 'Item successfully deleted';
                            });
                    }).catch((err) => {
                        return err
                    })
            });

    }

    static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {
                    let result = await sequelize.transaction(async (t) => {
                        let promises_associations = [];
                        let item = await super.findByPk(input[this.idAttribute()], {
                            transaction: t
                        });
                        if (item === null) {
                            throw new Error(\`Record with ID = \${id} does not exist\`);
                        }
                        let updated = await item.update(input, {
                            transaction: t
                        });
                        return updated;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static bulkAddCsv(context) {

        let delim = context.request.body.delim;
        let cols = context.request.body.cols;
        let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

        context.request.files.csv_file.mv(tmpFile).then(() => {

            fileTools.parseCsvStream(tmpFile, this, delim, cols).then((addedZipFilePath) => {
                try {
                    console.log(\`Sending \${addedZipFilePath} to the user.\`);

                    let attach = [];
                    attach.push({
                        filename: path.basename("added_data.zip"),
                        path: addedZipFilePath
                    });

                    email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                        'ScienceDB batch add',
                        'Your data has been successfully added to the database.',
                        attach).then(function(info) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.log(info);
                    }).catch(function(err) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.error(err);
                    });

                } catch (error) {
                    console.error(error.message);
                }

                fs.unlinkSync(tmpFile);
            }).catch((error) => {
                email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                    'ScienceDB batch add', \`\${error.message}\`).then(function(info) {
                    console.error(info);
                }).catch(function(err) {
                    console.error(err);
                });

                fs.unlinkSync(tmpFile);
            });

        }).catch((error) => {
            throw new Error(error);
        });
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(Person);
    }




    /**
     * add_hometownId - field Mutation (model-layer) for to_one associationsArguments to add 
     *
     * @param {Id}   personId   IdAttribute of the root model to be updated
     * @param {Id}   hometownId Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async add_hometownId(personId, hometownId) {
        let updated = await sequelize.transaction(async transaction => {
            try {
                return Person.update({
                    hometownId: hometownId
                }, {
                    where: {
                        personId: personId
                    }
                }, {
                    transaction: transaction
                })
            } catch (error) {
                throw error;
            }
        });
        return updated;
    }

    /**
     * remove_hometownId - field Mutation (model-layer) for to_one associationsArguments to remove 
     *
     * @param {Id}   personId   IdAttribute of the root model to be updated
     * @param {Id}   hometownId Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async remove_hometownId(personId, hometownId) {
        let updated = await sequelize.transaction(async transaction => {
            try {
                return Person.update({
                    hometownId: null
                }, {
                    where: {
                        personId: personId
                    }
                }, {
                    transaction: transaction
                })
            } catch (error) {
                throw error;
            }
        });
        return updated;
    }






    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Person.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Person.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Person.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Person.idAttribute()]
    }

    static get definition() {
        return definition;
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(Person.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

}

`

module.exports.test15 = ` 
const _ = require('lodash');
const globals = require('../config/globals');
const helper = require('../utils/helper');

// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Hometown',
    storageType: 'generic',
    attributes: {
        hometownId: 'String',
        name: 'String',
        address: 'String',
        country: 'String'
    },
    associations: {
        people: {
            type: 'to_many',
            target: 'Person',
            targetKey: 'hometownId',
            keyIn: 'Person',
            targetStorageType: 'sql',
            label: 'firstName',
            sublabel: 'lastName',
            name: 'people',
            name_lc: 'people',
            name_cp: 'People',
            target_lc: 'person',
            target_lc_pl: 'people',
            target_pl: 'People',
            target_cp: 'Person',
            target_cp_pl: 'People',
            keyIn_lc: 'person',
            holdsForeignKey: false
        }
    },
    internalId: 'hometownId',
    id: {
        name: 'hometownId',
        type: 'String'
    }
};

module.exports = class Hometown {

    /**
     * constructor - Creates an instance of the generic model Hometown.
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */
    constructor({
        hometownId,
        name,
        address,
        country
    }) {
        this.hometownId = hometownId;
        this.name = name;
        this.address = address;
        this.country = country;
    }

    static get name() {
        return "hometown";
    }

    static get definition() {
        return definition;
    }

    /**
     * readById - Search for the Hometown record whose id is equal to the @id received as parameter.
     * Returns an instance of this class (Hometown), with all its properties
     * set from the values of the record fetched.
     * 
     * Returned value:
     *    new Hometown(record)
     * 
     * Thrown on:
     *    * No record found.
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from the record fetched.
     * @see: constructor() of the class Hometown;
     * 
     * @param  {String} id The id of the record that needs to be fetched.
     * @return {Hometown} Instance of Hometown class.
     */
    static async readById(id) {

        /*
        YOUR CODE GOES HERE
         */
        throw new Error('readOneHometown is not implemented');
    }

    /**
     * countRecords - Count the number of records of model Hometown that match the filters provided
     * in the @search parameter. Returns the number of records counted.
     * @see: Cenzontle specifications for search object.
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * @param  {object} search Object with search filters.
     * @return {int} Number of records counted, that match the search filters.
     */
    static async countRecords(search) {

        /*
        YOUR CODE GOES HERE
        */
        throw new Error('countHometowns is not implemented');
    }

    /**
     * readAll - Search for the multiple records that match the filters received
     * in the @search parameter. The final set of records is constrained by the 
     * limit/offset pagination properties received in the @pagination parameter 
     * and ordered by the specifications received in the @order parameter.
     * Returns an array of instances of this class (Hometown), where each instance
     * has its properties set from the values of one of the records fetched.
     * 
     * Returned value:
     *    for each record
     *    array.push( new Hometown(record) )
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from a record fetched.
     * @see: constructor() of the class Hometown;
     * @see: Cenzontle specifications for limit-offset pagination.
     * @see: Cenzontle specifications for search and order objects.
     * 
     * @param  {object} search     Object with search filters.
     * @param  {object} order      Object with order specifications.
     * @param  {object} pagination Object with limit/offset pagination properties.
     * @return {[Hometown]}    Array of instances of Hometown class.
     */
    static async readAll(search, order, pagination) {

        /*
        YOUR CODE GOES HERE
        */
        throw new Error('Read all hometowns is not implemented');
    }

    /**
     * readAll - Search for the multiple records that match the filters received
     * in the @search parameter. The final set of records is constrained by the 
     * cursor based pagination properties received in the @pagination parameter 
     * and ordered by the specifications received in the @order parameter.
     * Returns an array of instances of this class (Hometown), where each instance
     * has its properties set from the values of one of the records fetched.
     * 
     * Returned value:
     *    { edges, pageInfo }
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where record is an object with all its properties set from a record fetched.
     * @see: constructor() of the class Hometown;
     * @see: Cenzontle specificatons for cursor based pagination.
     * @see: Cenzontle specifications for search and order objects.
     * 
     * @param  {object} search     Object with search filters.
     * @param  {object} order      Object with order specifications.
     * @param  {object} pagination Object with pagination properties.
     * @return { edges, pageInfo } Object with edges and pageInfo.
     */
    static async readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }
        }
        let paginationSearch = null;

        /*
         * Count
         */
        return Hometown.countRecords(search).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("hometownId")) {
                options['order'] = [...options['order'], ...[
                    ["hometownId", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        paginationSearch = helper.parseOrderCursorGeneric(search, options['order'], decoded_cursor, "hometownId", pagination.includeCursor);
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        paginationSearch = helper.parseOrderCursorGenericBefore(search, options['order'], decoded_cursor, "hometownId", pagination.includeCursor);
                    }
                }
            }

            /*
             *  Count (with pagination search filters)
             */
            return Hometown.countRecords(paginationSearch).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }

                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total hometowns exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }

                //set equivalent limit/offset pagination
                let paginationLimitOffset = {
                    limit: options['limit'],
                    offset: options['offset'],
                }

                /*
                 * Get records
                 * 
                 * paginationSearch: includes order.
                 *
                 */
                return Hometown.readAll(paginationSearch, order, paginationLimitOffset).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    /**
     * addOne - Creates a new record of model Hometown with the values provided
     * on @input object.
     * Only if record was created successfully, returns an instance of this class 
     * (Hometown), with all its properties set from the new record created.
     * If this function fails to create the new record, should throw an error.
     * 
     * Conventions on input's attributes values.
     *    1. undefined value: attributes with value equal to undefined are set to 
     *       null at creation time.
     *    2. non-existent: attributes not listed on the input are set to null at 
     *       creation time.
     *    3. null: attributes with value equal to null are set to null.
     * 
     * Returned value:
     *    new Hometown(newRecord)
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where newRecord is an object with all its properties set from the new record created.
     * @see: constructor() of the class Hometown;
     * 
     * @param  {String} id The id of the record that needs to be fetched.
     * @return {Hometown} If successfully created, returns an instance of 
     * Hometown class constructed with the new record, otherwise throws an error.
     */
    static async addOne(input) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('addHometown is not implemented');
    }

    /**
     * updateOne - Updates the Hometown record whose id is equal to the value
     * of id attribute: 'hometownId', which should be on received as input.
     * Only if record was updated successfully, returns an instance of this class 
     * (Hometown), with all its properties set from the record updated.
     * If this function fails to update the record, should throw an error.
     * 
     * Conventions on input's attributes values.
     *    1. undefined value: attributes with value equal to undefined are NOT
     *       updated.
     *    2. non-existent: attributes not listed on the input are NOT updated.
     *    3. null: attributes with value equal to null are set to null.
     * 
     * Returned value:
     *    new Hometown(updatedRecord)
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * where updatedRecord is an object with all its properties set from the record updated.
     * @see: constructor() of the class Hometown;
     * 
     * @param  {object} input Input with properties to be updated. The special id 
     * attribute: 'hometownId' should contains the id value of the record
     * that will be updated. 
     * @return {Hometown} If successfully created, returns an instance of 
     * Hometown class constructed with the new record, otherwise throws an error.
     */
    static async updateOne(input) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('updateHometown is not implemented');
    }

    /**
     * deleteOne - Delete the record whose id is equal to the @id received as parameter.
     * Only if record was deleted successfully, returns the id of the deleted record.
     * If this function fails to delete the record, should throw an error.
     * 
     * Thrown on:
     *    * Error.
     *    * Operation failed.
     * 
     * @param  {String} id The id of the record that will be deleted.
     * @return {int} id of the record deleted or throws an error if the operation failed.
     */
    static async deleteOne(id) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('deleteHometown is not implemented');
    }

    static async bulkAddCsv(context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('bulkAddHometownCsv is not implemented');
    }

    static async csvTableTemplate() {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('csvTableTemplateHometown is not implemented');
    }









    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Hometown.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Hometown.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Hometown.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Hometown.idAttribute()]
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(Hometown.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

};

`