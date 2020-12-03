#!/usr/bin/env bash

# CONSTANTS

# TEST_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TEST_DIR="$(dirname $(readlink -f $0))"
ROOT_DIR="$(dirname ${TEST_DIR})"
ENV_DIR="${TEST_DIR}/integration_test_env"

GRAPHQL_SERVER_BRANCH=master
GRAPHQL_SERVER_1="${ENV_DIR}/gql_science_db_graphql_server1"
GRAPHQL_SERVER_2="${ENV_DIR}/gql_science_db_graphql_server2"

GRAPHQL_SERVER_1_URL="localhost:3000/graphql"
GRAPHQL_SERVER_2_URL="localhost:3030/graphql"
SERVER_CHECK_WAIT_TIME=60


# EXECUTION

source "${TEST_DIR}/testenv_init_run_env.sh"
source "${TEST_DIR}/testenv_generate_code.sh"
source "${TEST_DIR}/testenv_docker_up.sh"

# Run tests
mocha "${TEST_DIR}/mocha_integration_test.js"

# Remove environment
source "${TEST_DIR}/testenv_remove.sh"