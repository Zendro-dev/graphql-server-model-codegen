#!/usr/bin/env bash

checkGqlServer() {

  url="${1}"

  elapsedTime=0
  until curl "$url" &>/dev/null
  do

    # Exit with error code 1
    if [ $elapsedTime == $SERVER_CHECK_WAIT_TIME ]; then

      echo "time limit reached while waiting for ${url}"
      return 1

    fi

    # Wait 2s and rety
    sleep 2
    elapsedTime=$(expr $elapsedTime + 2)
  done

  return 0

}

# Up detached docker containers
docker-compose \
  -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" up -d \
  --force-recreate \
  --remove-orphans \
  --renew-anon-volumes


# Wait for the graphql server instances to get ready
echo "Waiting for GraphQL servers to start"

HOSTS=(
  $GRAPHQL_SERVER_1_URL
  $GRAPHQL_SERVER_2_URL
)
pids=( )

for url in ${HOSTS[@]}; do

  checkGqlServer $url &
  pids+="$! "

done

# Wait until Zendro GraphQL servers are up and running
for id in ${pids[@]}; do

  wait $id || exit 0

done
