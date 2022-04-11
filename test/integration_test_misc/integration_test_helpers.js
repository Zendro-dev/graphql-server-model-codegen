const axios = require("axios");
const request = require("sync-request");
const graphqlUrl = "http://0.0.0.0:3000/graphql";
const csvExportUrl = "http://0.0.0.0:3000/export";
const metaqueryUrl = "http://0.0.0.0:3000/meta_query";
const srvUrl = "http://0.0.0.0:3344";
const graphqlUrlInstance2 = "http://0.0.0.0:3030/graphql";

/**
 * request_graph_ql_post - Send "POST" request to the local GraphQL server
 *
 * @param  {query} {string}  Any query string in GraphQL format
 * @return {object}          Request response
 */
module.exports.request_graph_ql_post = function (query) {
  return request("POST", graphqlUrl, {
    json: {
      query: `${query}`,
    },
  });
};

/**
 * request_graph_ql_post - Send "POST" request to the local GraphQL server
 *
 * @param  {query} {string}  Any query string in GraphQL format
 * @return {object}          Request response
 */
module.exports.request_graph_ql_post_instance2 = function (query) {
  return request("POST", graphqlUrlInstance2, {
    json: {
      query: `${query}`,
    },
  });
};

/**
 * request_metaquery_post - Send "POST" request to meta_query route. Either jq or jsonPath must be non-null.
 *
 * @param {query} {string}  Any queries to GraphQL as a string
 * @param {jq} {string}       A jq command
 * @param {jsonPath} {string} A jsonPath command
 * @return {object}           Request response
 */
module.exports.request_metaquery_post = async function (query, jq, jsonPath) {
  return await request("POST", metaqueryUrl, {
    json: {
      query: `${query}`,
    },
    headers: {
      ...(jq && { jq: `${jq}` }),
      ...(jsonPath && { jsonPath: `${jsonPath}` }),
    },
  });
};

module.exports.request_export = async function (model) {
  return await axios.get(csvExportUrl + "?model=" + model);
};

/**
 * request_graph_ql_get - Send "GET" request to the local GraphQL server
 *
 * @param  {sig_url} {string}  Part that goes after server URL string (the significand part)
 * @return {integer}         Request response
 */
module.exports.request_graph_ql_get = function (sig_url) {
  return request("get", srvUrl + sig_url);
};

/**
 * count_all_records - Count all records using given GraphQL query
 *
 * @param  {count_func} {string}  GraphQL count function name for the given table, e.g. 'countIndividuals'
 * @return {integer}         Number of the records in a given table
 */
module.exports.count_all_records = async function (count_func) {
  let res = await module.exports.request_graph_ql_post(`{ ${count_func} }`);
  return JSON.parse(res.body.toString("utf8")).data[count_func];
};
