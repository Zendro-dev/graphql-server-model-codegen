#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}RUN GRAPHQL SERVER CODE GENERATOR${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}

# Run the code generator over each of the graphql server instances
GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

for i in ${!GRAPHQL_SERVER_INSTANCES[@]}; do

  GRAPHQL_SERVER=${GRAPHQL_SERVER_INSTANCES[$i]}
  INDEX=$(($i + 1))

  printf -- \
    "${SINGLE_SEP}\nGenerating code for ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n\n" \
    $(basename ${GRAPHQL_SERVER})

  # Restore the graphql server repository to a clean state
  cd $GRAPHQL_SERVER
  echo node_modules > .gitignore
  git clean -fd &>/dev/null
  git reset --hard origin/${GRAPHQL_SERVER_BRANCH} &>/dev/null
  cd - &>/dev/null

  # Run the code generator
  node "${ROOT_DIR}/index.js" \
    -f "${TEST_DIR}/integration_test_misc/integration_test_models_instance${INDEX}" \
    --migrations \
    -o $GRAPHQL_SERVER

  printf \
    "\nGenerating code for ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
    $(basename ${GRAPHQL_SERVER})

done

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}RUN GRAPHQL SERVER CODE GENERATOR${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}APPLY CUSTOM PATCHES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

# Apply test-specific patches to the appropriate graphql server instance
patch -V never \
  "${GRAPHQL_SERVER_1}/models/generic/aminoacidsequence.js" \
  "${TEST_DIR}/integration_test_misc/patches/model_aminoacidsequence.patch"

patch -V never \
  "${GRAPHQL_SERVER_1}/validations/individual.js" \
  "${TEST_DIR}/integration_test_misc/patches/individual_validate.patch"

patch -V never \
  "${GRAPHQL_SERVER_1}/validations/accession.js" \
  "${TEST_DIR}/integration_test_misc/patches/accession_validate_instance1.patch"

patch -V never \
  "${GRAPHQL_SERVER_1}/models/sql/cat.js" \
  "${TEST_DIR}/integration_test_misc/patches/cat_readAllCursor.patch"


echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}APPLY CUSTOM PATCHES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
