#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${GRAY}START REMOVE TESTING ENVIRONMENT${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

# Remove docker containers, images, and volumes
docker-compose -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" down -v --rmi all

# Remove testing environment
echo "Removing ${ENV_DIR}"
rm -rf ${ENV_DIR}

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${GRAY}END REMOVE TESTING ENVIRONMENT${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
