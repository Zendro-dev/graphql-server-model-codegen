const _ = require('lodash');
const path = require('path');
const models = require(path.join(__dirname, '..', 'models_index.js'));
const axios_general = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const uuidv4 = require('uuidv4');
const globals = require('../config/globals');

// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Person',
    storageType: 'cenz_server',
    attributes: {
        firstName: 'String',
        lastName: 'String',
        email: 'String',
        companyId: 'Int',
        internalPersonId: 'String'
    },
    associations: {
        works: {
            type: 'to_many',
            target: 'Book',
            targetKey: 'internalPersonId',
            keyIn: 'Book',
            targetStorageType: 'cenz_server',
            label: 'title',
            name: 'works',
            name_lc: 'works',
            name_cp: 'Works',
            target_lc: 'book',
            target_lc_pl: 'books',
            target_pl: 'Books',
            target_cp: 'Book',
            target_cp_pl: 'Books',
            keyIn_lc: 'book'
        }
    },
    internalId: 'internalPersonId',
    id: {
        name: 'internalPersonId',
        type: 'String'
    }
};

const url = "";
let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

module.exports = class Person {

    /**
     * constructor - Creates an instance of the model stored in webservice
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        internalPersonId,
        firstName,
        lastName,
        email,
        companyId
    }) {
        this.internalPersonId = internalPersonId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.companyId = companyId;
    }

    static get name() {
        return "person";
    }

    static readById(id) {
        let query = `query readOnePerson{ readOnePerson(internalPersonId: ${id}){internalPersonId        firstName
            lastName
            email
            companyId
      } }`

        return axios.post(url, {
            query: query
        }).then(res => {
            let data = res.data.data.readOnePerson;
            return new Person(data);
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }

    static countRecords(search) {
        let query = `query countPeople($search: searchPersonInput){
      countPeople(search: $search)
    }`

        return axios.post(url, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            return res.data.data.countPeople;
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }

    static readAll(search, order, pagination) {
        let query = `query people($search: searchPersonInput $pagination: paginationInput $order: [orderPersonInput]){
      people(search:$search pagination:$pagination order:$order){internalPersonId          firstName
                lastName
                email
                companyId
        } }`

        return axios.post(url, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            }
        }).then(res => {
            let data = res.data.data.people;
            return data.map(item => {
                return new Person(item)
            });
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });

    }

    static readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let query = `query peopleConnection($search: searchPersonInput $pagination: paginationCursorInput $order: [orderPersonInput]){

      peopleConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  internalPersonId  firstName
        lastName
        email
        companyId
       } } pageInfo{startCursor endCursor hasPreviousPage hasNextPage  } } }`

        return axios.post(url, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            }
        }).then(res => {
            let data_edges = res.data.data.peopleConnection.edges;
            let pageInfo = res.data.data.peopleConnection.pageInfo;

            let edges = data_edges.map(e => {
                return {
                    node: new Person(e.node),
                    cursor: e.cursor
                }
            })

            return {
                edges,
                pageInfo
            };
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }

    static addOne(input) {

        let query = `mutation addPerson( $internalPersonId:ID         $firstName:String
            $lastName:String
            $email:String
            $companyId:Int
     ){
       addPerson( internalPersonId:$internalPersonId            firstName:$firstName
                  lastName:$lastName
                  email:$email
                  companyId:$companyId
        ){internalPersonId            firstName
                    lastName
                    email
                    companyId
         }
     }`;

        return axios.post(url, {
            query: query,
            variables: input
        }).then(res => {
            let data = res.data.data.addPerson;
            return new Person(data);
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }

    static deleteOne(id) {
        let query = `mutation deletePerson{ deletePerson(internalPersonId: ${id}) }`;

        return axios.post(url, {
            query: query
        }).then(res => {
            return res.data.data.deletePerson;
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });

    }

    static updateOne(input) {
        let query = `mutation updatePerson($internalPersonId:ID!        $firstName:String
            $lastName:String
            $email:String
            $companyId:Int
      ){
       updatePerson(internalPersonId:$internalPersonId           firstName:$firstName
                  lastName:$lastName
                  email:$email
                  companyId:$companyId
         ){internalPersonId            firstName
                    lastName
                    email
                    companyId
         }
     }`

        return axios.post(url, {
            query: query,
            variables: input
        }).then(res => {
            let data = res.data.data.updatePerson;
            return new Person(data);
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }

    static bulkAddCsv(context) {
        let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

        return context.request.files.csv_file.mv(tmpFile).then(() => {
            let query = `mutation {bulkAddPersonCsv{internalPersonId}}`;
            let formData = new FormData();
            formData.append('csv_file', fs.createReadStream(tmpFile));
            formData.append('query', query);

            return axios.post(url, formData, {
                headers: formData.getHeaders()
            }).then(res => {
                return res.data.data.bulkAddPersonCsv;
            });

        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }

    static csvTableTemplate() {
        let query = `query { csvTableTemplatePerson }`;
        return axios.post(url, {
            query: query
        }).then(res => {
            return res.data.data.csvTableTemplatePerson;
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }






    _addWorks(ids) {
        super.updateOne({
            internalPersonId: this.internalPersonId,
            addWorks: ids
        });
    }

    _removeWorks(ids) {
        super.updateOne({
            internalPersonId: this.internalPersonId,
            removeWorks: ids
        });
    }

    worksFilterImpl({
        search,
        order,
        pagination
    }) {
        if (search === undefined) {
            return models.book.readAll({
                "field": "internalPersonId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination);
        } else {
            return models.book.readAll({
                "operator": "and",
                "search": [{
                    "field": "internalPersonId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            }, order, pagination)
        }
    }

    countFilteredWorksImpl({
        search
    }) {

        if (search === undefined) {
            return models.book.countRecords({
                "field": "internalPersonId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            });
        } else {
            return models.book.countRecords({
                "operator": "and",
                "search": [{
                    "field": "internalPersonId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            })
        }

    }

    worksConnectionImpl({
        search,
        order,
        pagination
    }) {
        if (search === undefined) {
            return models.book.readAllCursor({
                "field": "internalPersonId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination);
        } else {
            return models.book.readAllCursor({
                "operator": "and",
                "search": [{
                    "field": "internalPersonId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            }, order, pagination)
        }
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
};