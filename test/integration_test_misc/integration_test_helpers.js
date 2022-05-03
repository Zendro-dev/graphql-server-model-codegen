const axios = require("axios");
const request = require("sync-request");
const graphqlUrl = "http://0.0.0.0:3000/graphql";
const csvExportUrl = "http://0.0.0.0:3000/export";
const metaqueryUrl = "http://0.0.0.0:3000/meta_query";
const srvUrl = "http://0.0.0.0:3344";
const graphqlUrlInstance2 = "http://0.0.0.0:3030/graphql";
const tokenUri =
  "http://10.5.0.11:8081/auth/realms/zendro/protocol/openid-connect/token";
const clientId = "zendro_graphql-server";
const username = "zendro-admin";
const password = "admin";

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
 * get_token - get token for authorization
 *
 * @return {string}          token
 */
module.exports.get_token = async () => {
  const res = await axios({
    method: "post",
    url: tokenUri,
    data: `username=${username}&password=${password}&grant_type=password&client_id=${clientId}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });
  if (res && res.data) {
    return res.data.access_token;
  } else {
    throw new Error("No token found");
  }
};
/**
 * axios_graph_ql_post - Send "POST" request to the local GraphQL server 1 with token
 *
 * @param  {query} {string}  Any query string in GraphQL format
 * @param  {string} token    The token used for authorization
 * @return {object}          Request response
 */
module.exports.axios_graph_ql_post = async (query, token) => {
  try {
    const response = await axios.post(
      graphqlUrl,
      { query: query },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql",
          authorization: "Bearer " + token,
        },
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * axios_graph_ql_post_instance2 - Send "POST" request to the local GraphQL server 2 with token
 *
 * @param  {query} {string}  Any query string in GraphQL format
 * @param  {string} token    The token used for authorization
 * @return {object}          Request response
 */
module.exports.axios_graph_ql_post_instance2 = async (query, token) => {
  try {
    const response = await axios.post(
      graphqlUrlInstance2,
      { query: query },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql",
          authorization: "Bearer " + token,
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
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
