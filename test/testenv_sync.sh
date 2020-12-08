
#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

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
