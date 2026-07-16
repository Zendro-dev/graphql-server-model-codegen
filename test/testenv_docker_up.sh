#!/usr/bin/env bash

set -e

isServerReadyForRequests() {

  # app.listen() binds the port (making curl succeed) before its callback
  # awaits initializeStorageHandlers() for models and adapters - so a bare
  # curl only proves Express is up, not that storage handlers (e.g. the
  # MongoDB connection) have finished loading. The callback's own
  # "App listening on port" log line is the only signal that's actually
  # true once storage handlers are ready, so wait on that instead - a
  # container reachable via curl but still mid-initialization causes
  # ECONNRESET storms in the very first test suite that runs against it.
  container="${1}"
  max_time="${2}"
  # docker logs is cumulative across restarts, so a plain grep would match
  # a stale line left over from before a restart (see the ACL branch below,
  # which restarts an already-logged container) instead of waiting for the
  # new one - scope the check to only what's been logged since this
  # (re)start.
  since="${3:-$(docker inspect -f '{{.State.StartedAt}}' "$container")}"

  elapsedTime=0
  until docker logs --since "$since" "$container" 2>&1 | grep -q "App listening on port"
  do

    if [ $elapsedTime == $max_time ]; then
      echo "${RED}${container}${NC} time limit reached"
      return 1
    fi

    # Retry every two seconds
    sleep 2
    elapsedTime=$(expr $elapsedTime + 2)
  done

  echo -e ${YELLOW}$container${NC} is ${GREEN}ready${NC}

  return 0

}


# Load integration test constants
SCRIPT_DIR="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
cd "$SCRIPT_DIR"
source "./testenv_constants.sh"

printBlockHeader "START" "UP DOCKER CONTAINERS"

# Up detached docker containers
if [[ $OPT_ACL_SETUP == "true" ]]; then
  UID_GID="$(id -u):$(id -g)" docker compose \
    -f "${TEST_DIR}/integration_test_misc/docker-compose-test-acl.yml" up -d \
    --force-recreate \
    --remove-orphans \
    --renew-anon-volumes
else
  UID_GID="$(id -u):$(id -g)" docker compose \
    -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" up -d \
    --force-recreate \
    --remove-orphans \
    --renew-anon-volumes
fi


# Wait for the graphql server instances to get ready
echo -e "\nWaiting for GraphQL servers to start ..."

# Async check that the servers are ready to take requests
pids=( )
isServerReadyForRequests "server1" "$SERVER_CHECK_WAIT_TIME" &
pids+="$! "
isServerReadyForRequests "server2" "$SERVER_CHECK_WAIT_TIME" &
pids+="$! "

# Wait for the check responses
for id in ${pids[@]}; do
  wait $id || exit 1
done

# Restart server2 for using OAUTH2 env variables from server1
if [[ $OPT_ACL_SETUP == "true" ]]; then
  UID_GID="$(id -u):$(id -g)" docker compose \
    -f "${TEST_DIR}/integration_test_misc/docker-compose-test-acl.yml" restart "gql_science_db_graphql_server2"

  isServerReadyForRequests "server2" "$SERVER_CHECK_WAIT_TIME" &
  pid_restart="$! "

  wait $pid_restart || exit 1
fi

printBlockHeader "END" "UP DOCKER CONTAINERS"
