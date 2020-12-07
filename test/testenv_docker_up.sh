#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

# Function to verify that the graphql server is ready to take requests
checkGqlServer() {

  url="${1}"
  max_time="${2}"

  elapsedTime=0
  until curl "$url" &>/dev/null
  do

    # Exit with error code 1
    if [ $elapsedTime == $max_time ]; then

      echo "${RED}${url}${NC} time limit reached"
      return 1

    fi

    # Wait 2s and rety
    sleep 2
    elapsedTime=$(expr $elapsedTime + 2)
  done

  echo -e ${YELLOW}$url${NC} is ${GREEN}ready${NC}

  return 0

}

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}UP DOCKER CONTAINERS${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

# Up detached docker containers
docker-compose \
  -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" up -d \
  --force-recreate \
  --remove-orphans \
  --renew-anon-volumes


# Wait for the graphql server instances to get ready
echo -e "\nWaiting for GraphQL servers to start ..."

SERVER_URLS=(
  $GRAPHQL_SERVER_1_URL
  $GRAPHQL_SERVER_2_URL
)
pids=( )

for url in ${SERVER_URLS[@]}; do

  checkGqlServer $url $SERVER_CHECK_WAIT_TIME &
  pids+="$! "

done

# Wait until Zendro GraphQL servers are up and running
for id in ${pids[@]}; do

  wait $id || exit 0

done

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}UP DOCKER CONTAINERS${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
