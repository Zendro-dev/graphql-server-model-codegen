(async () => {
  // how to test a query in the distributed setup with ACL:
  // 1. set up the distributed env (set OPT_ACL_SETUP=true and execute `npm run test-integration -- -k`)
  // 2. copy this file into the folder `test/integration_test_env/gql_science_db_graphql_server1/dist_graphql.js`
  // 3. go into the container server1 by `docker exec -it server1 bash`
  // 4. execute the command `node dist_graphql.js`

  // Note: in the docker-compose file with ACL rules, keycloak could not be accessed in multiple networks.
  // So we choose to bind the network of server1, namely instance1.
  try {
    require("dotenv").config({
      path: ".env",
    });
    const { initializeZendro } = require("./utils/zendro.js");
    const zendro = await initializeZendro();
    execute_graphql = zendro.execute_graphql;
    let res = await execute_graphql("{ countParrots }");
    console.log(res);
  } catch (e) {
    console.log(e);
  }
})();
