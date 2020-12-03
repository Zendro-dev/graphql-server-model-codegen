#!/usr/bin/env bash

GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

# Run the code generator over each of the graphql server instances
for i in ${!GRAPHQL_SERVER_INSTANCES[@]}; do

  GRAPHQL_SERVER=${GRAPHQL_SERVER_INSTANCES[$i]}
  INDEX=$(($i + 1))

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

done


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
