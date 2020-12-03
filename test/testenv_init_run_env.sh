#!/usr/bin/env bash

# (Re-)Create the environment directory
mkdir -p $ENV_DIR

GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

for GRAPHQL_SERVER in ${GRAPHQL_SERVER_INSTANCES[@]}; do

  # Clone graphql server instance from the upstream remote, using the appropriate branch
  git clone --branch $GRAPHQL_SERVER_BRANCH https://github.com/Zendro-dev/graphql-server $GRAPHQL_SERVER

  echo $GRAPHQL_SERVER

  # Install node modules
  cd $GRAPHQL_SERVER
  NODE_JQ_SKIP_INSTALL_BINARY=true npm install
  cd - &>/dev/null

done
