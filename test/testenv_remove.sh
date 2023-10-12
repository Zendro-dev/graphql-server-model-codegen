#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

printBlockHeader "START" "REMOVE TESTING ENVIRONMENT"

# Remove docker containers, images, and volumes
if [[ $OPT_ACL_SETUP == "true" ]]; then
    UID_GID="$(id -u):$(id -g)" docker compose -f "${TEST_DIR}/integration_test_misc/docker-compose-test-acl.yml" down -v --rmi all
else
    UID_GID="$(id -u):$(id -g)" docker compose -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" down -v --rmi all
fi
# Remove testing environment
echo "Removing ${ENV_DIR}"
rm -rf ${ENV_DIR}

printBlockHeader "END" "REMOVE TESTING ENVIRONMENT"
