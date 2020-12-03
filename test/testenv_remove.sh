#!/usr/bin/env bash

# Remove docker containers, images, and volumes
# docker-compose -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" down -v --rmi all
docker-compose -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" down -v

# Remove testing environment
rm -rf ${ENV_DIR}
