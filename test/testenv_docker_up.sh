#!/usr/bin/env bash

set -e

isServerReadyForRequests() {

  url="${1}"
  max_time="${2}"

  elapsedTime=0
  until curl "$url" &>/dev/null
  do

    if [ $elapsedTime == $max_time ]; then
      echo "${RED}${url}${NC} time limit reached"
      return 1
    fi

    # Retry every two seconds
    sleep 2
    elapsedTime=$(expr $elapsedTime + 2)
  done

  echo -e ${YELLOW}$url${NC} is ${GREEN}ready${NC}

  return 0

}


# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

printBlockHeader "START" "UP DOCKER CONTAINERS"

# Up detached docker containers
if [[ $OPT_ACL_SETUP == "true" ]]; then
  UID_GID="$(id -u):$(id -g)" docker-compose \
    -f "${TEST_DIR}/integration_test_misc/docker-compose-test-acl.yml" up -d \
    --force-recreate \
    --remove-orphans \
    --renew-anon-volumes
else
  UID_GID="$(id -u):$(id -g)" docker-compose \
    -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" up -d \
    --force-recreate \
    --remove-orphans \
    --renew-anon-volumes
fi


# Wait for the graphql server instances to get ready
echo -e "\nWaiting for GraphQL servers to start ..."

# Async check that the servers are ready to take requests
pids=( )
isServerReadyForRequests "$GRAPHQL_SERVER_1_URL" "$SERVER_CHECK_WAIT_TIME" &
pids+="$! "
isServerReadyForRequests "$GRAPHQL_SERVER_2_URL" "$SERVER_CHECK_WAIT_TIME" &
pids+="$! "

# Wait for the check responses
for id in ${pids[@]}; do
  wait $id || exit 0
done

# Restart server2 for using OAUTH2 env variables from server1
if [[ $OPT_ACL_SETUP == "true" ]]; then
  UID_GID="$(id -u):$(id -g)" docker-compose \
    -f "${TEST_DIR}/integration_test_misc/docker-compose-test-acl.yml" restart "gql_science_db_graphql_server2"
  
  isServerReadyForRequests "$GRAPHQL_SERVER_2_URL" "$SERVER_CHECK_WAIT_TIME" &
  pid_restart="$! "

  wait $pid_restart || exit 0
fi

printBlockHeader "END" "UP DOCKER CONTAINERS"
