const axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');
const FormData = require('form-data');
const fs = require('fs');
const request = require('sync-request');
const graphqlUrl = 'http://0.0.0.0:3000/graphql';
const joinSrvUrl = 'http://0.0.0.0:3000/join';
const metaqueryUrl = 'http://0.0.0.0:3000/meta_query';
const srvUrl = 'http://0.0.0.0:3344';
const graphqlUrlInstance2 = 'http://0.0.0.0:3030/graphql';

/**
 * request_graph_ql_post - Send "POST" request to the local GraphQL server
 *
 * @param  {query} {string}  Any query string in GraphQL format
 * @return {object}          Request response
 */
module.exports.request_graph_ql_post = function (query){
    return request('POST', graphqlUrl, {
        json: {
            query: `${query}`
        }
    });
};

/**
 * request_graph_ql_post - Send "POST" request to the local GraphQL server
 *
 * @param  {query} {string}  Any query string in GraphQL format
 * @return {object}          Request response
 */
module.exports.request_graph_ql_post_instance2 = function (query){
    return request('POST', graphqlUrlInstance2, {
        json: {
            query: `${query}`
        }
    });
};

/**
* request_metaquery_post - Send "POST" request to meta_query route. Either jq or jsonPath must be non-null.
* 
* @param {queries} {string}  Any queries to GraphQL as a string
* @param {jq} {string}       A jq command
* @param {jsonPath} {string} A jsonPath command
* @return {object}           Request response
*/
module.exports.request_metaquery_post = async function(queries, jq, jsonPath) {
    return await request('POST', metaqueryUrl, {
        json: {
            queries:  queries,
            jq:       jq != null ? `${jq}` : null,
            jsonPath: jsonPath != null ? `${jsonPath}` : null
        }
    });
};

/**
 * request_join_post - Send "POST" request to the JOIN service of the local GraphQL server
 *
 * @param  {query} {string}  Any query string in JOIN format
 * @return {object}          Request response
 */
module.exports.request_join_post = async function (modelAdjacencies){

    // some dummy token for no_acl server mode (the const secret-key can be invalid with time)
    let token = jsonwebtoken.sign({
        id: 1,
        email: "sci.db.service@gmail.com",
        roles: "admin"
    }, 'something-secret', { expiresIn: '1h' });

    // returning the response object
    return await axios.post(joinSrvUrl, modelAdjacencies, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/text',
            'authorization': token
        }
    });
};

/**
 * request_graph_ql_get - Send "GET" request to the local GraphQL server
 *
 * @param  {sig_url} {string}  Part that goes after server URL string (the significand part)
 * @return {integer}         Request response
 */
module.exports.request_graph_ql_get = function (sig_url){
    return request('get', srvUrl + sig_url);
};

/**
 * count_all_records - Count all records using given GraphQL query
 *
 * @param  {count_func} {string}  GraphQL count function name for the given table, e.g. 'countIndividuals'
 * @return {integer}         Number of the records in a given table
 */
module.exports.count_all_records = async function (count_func){
    let res = await module.exports.request_graph_ql_post(`{ ${count_func} }`);
    return JSON.parse(res.body.toString('utf8')).data[count_func];
}

/**
 * batch_upload_csv - A helper function that initiates batch upload of a given CSV file using given mutation name.
 *
 * @param  {csvPath} {string}  Full path to the CSV file
 * @param  {mutation} {string} Exact mutation name to be used, e.g. 'bulkAddIndividualCsv'
 * @return {boolean}           Indicate if a response status is 200 (true) or not (false)
 */
module.exports.batch_upload_csv = async function (csvPath, mutation){

    // The user e-mail here is the same that is used for sending data, it is sci.db.service@gmail.com (pwd: SciDbServiceQAZ)
    // but you can place any other recipient address. This test wont add anything into the database, because individual_invalid.csv
    // contains two lines that are rejected by the isAlpha validator for the individual name. If you remove these lines,
    // the test will make a batch add.

    // some dummy token for no_acl server mode (the const secret-key can be invalid with time)
    let token = jsonwebtoken.sign({
        id: 1,
        email: "sci.db.service@gmail.com",
        roles: "admin"
    }, 'something-secret', { expiresIn: '1h' });

    let formData = new FormData();


    formData.append('csv_file', fs.createReadStream(csvPath));
    //mutation {bulkAddIndividualCsv{ id}}
    formData.append('query', `${mutation}`);

    return await axios.post(graphqlUrl, formData,  {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'Accept': 'application/graphql',
            'authorization' : token
        }
    }).then(function(response) {
        return true;
    }).catch(function(res) {
        if (res.response && res.response.data && Array
            .isArray(res.response.data)) {
            console.log("error 1");
        } else {
            let err = (res && res.response && res.response.data && res.response
                .data.message ?
                res.response.data.message : res);
            console.log(err);
        }
        return false;
    });
};
