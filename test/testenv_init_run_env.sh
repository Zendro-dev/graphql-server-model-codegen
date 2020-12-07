#!/usr/bin/env bash

set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"


echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${GRAY}START CLONE GRAPHQL SERVER INSTANCES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""


# (Re-)Create the environment directory
mkdir -p $ENV_DIR

GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

for GRAPHQL_SERVER in ${GRAPHQL_SERVER_INSTANCES[@]}; do

  printf \
    "Cloning ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n${SINGLE_SEP}\n\n" \
    ${GRAPHQL_SERVER_BRANCH} \
    $(basename ${GRAPHQL_SERVER})

  # Clone graphql server instance from the upstream remote, using the appropriate branch
  git clone --branch $GRAPHQL_SERVER_BRANCH https://github.com/Zendro-dev/graphql-server $GRAPHQL_SERVER

  # Install node modules
  cd $GRAPHQL_SERVER
  NODE_JQ_SKIP_INSTALL_BINARY=true npm install
  cd - &>/dev/null

  printf \
    "\nCloning branch ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
    ${GRAPHQL_SERVER_BRANCH} \
    $(basename ${GRAPHQL_SERVER})

done

echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${GRAY}END CLONE GRAPHQL SERVER INSTANCES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
