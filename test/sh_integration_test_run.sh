#!/bin/bash

# -------------------------------------------------------------------------------------
# sh_integration_test_run.sh

#
# NAME
#     sh_integration_test_run.sh
#
# USAGE
#
#   Direct execution:
#
#     ./sh_integration_test_run.sh [OPTIONS]
#
#   Execution via npm:
#
#     yarn test-integration [-- OPTIONS]
#
#   cleaup:
#     yarn test-integration-clear
#   or
#     yarn test-integration -c
#
# DESCRIPTION
#     Command line utility to perform graphql server's integration-test.
#
#     The integration-test command creates a docker-compose environment with three servers:
#
#     gql_postgres
#     gql_science_db_graphql_server
#     gql_ncbi_sim_srv
#
#     The default behavior performs the following actions:
#
#         0) Checks the local testing environment (./docker/integration_test_run) and performs an initial setup the first time the command is run.
#         1) Stops and removes Docker containers with docker-compose down command. It also removes Docker images (--rmi) and volumes (-v) created in previous runs.
#         2) Removes any previously generated code located on the project's testing environment: ./docker/integration_test_run.
#         3) Generates the code using the test models located on the project's test directory: ./test/integration_test_models.
#         4) Creates and starts containers with docker-compose up command.
#         5) Execcutes integration tests.
#         6) Do a cleanup as described on steps 1) and 2) (use -k option to skip this step).
#
#     The options are as follows:
#
#     -b, --branch
#
#         This option changes the testing branch of the zendro server instances. Changing the branch is a permanent side effect.
#
#         It can be used alone to execute the default script, or in conjunction with -s or -T.
#
#         The default branch is set to "master". When running tests for the first time, make sure this option is set to the desired branch.
#
#     -c, --cleanup
#
#         This option performs the following actions:
#
#         1) Stops and removes Docker containers with docker-compose down command, also removes Docker images (--rmi) and named or anonymous volumes (-v).
#         2) Removes any previously generated code located on the testing environment server instances: ./docker/integration_test_run/servers.
#
#     -C, --softCleanup
#
#         This option performs the following actions:
#
#         1) Stops and removes Docker containers and volumes with docker-compose down command.
#         2) Removes any previously generated code located on the testing environment server instances: ./docker/integration_test_run/servers.
#
#     -g, --generate-code
#
#         This option performs the following actions:
#
#         1) Stop and removes containers with docker-compose down command (without removing images).
#         2) Removes any previously generated code located on the testing environment server instances: ./docker/integration_test_run/servers.
#         3) Re-generates the code from the test models located on current project's local directory: ./test/integration_test_models. The code is generated on local directory: ./docker/integration_test_run.
#         4) Creates and start containers with docker-compose up command.
#
#     -h, --help
#
#         Display this help and exit.
#
#     -k, --keep-running
#
#         This option skips the cleanup step at the end of the integration-test-suite and keeps the Docker containers running.
#
#         It can be used alone, or in conjunction with the options -t or -T.
#
#         If this option is not specified, then, by default, the cleanup step is performed at the end of the tests (see -c option).
#
#     -r, --restart-containers
#
#         This option performs the following actions:
#
#         1) Stop and removes containers with docker-compose down command (without removing images).
#         2) Creates and start containers with docker-compose up command.
#
#         Because the containers that manages the test-suite's databases do not use docker named volumes, but transient ones, the databases will be re-initialized by this command, too.
#
#     -s, --setup
#
#         This option performs the following actions:
#
#         1) Clones two graphql-server instances, optionally switching to the specified "-b BRANCH".
#         2) Installs a yarn workspace and links node modules to both instances.
#
#     -t, --run-test-only
#
#         This option performs the following actions:
#
#         1) Stops and removes containers with docker-compose down command (without removing images).
#         2) Creates and starts containers with docker-compose up command.
#         3) Excecutes integration tests. The code should exists, otherwise the integration tests are not executed.
#
#         If option -k is also specified, then cleanup step is skipped at the end of the integration-test-suite, otherwise, the cleanup step is performed at the end of the tests (see -c option).
#
#     -T, --generate-code-and-run-tests
#
#         This option performs the following actions:
#
#         1) Stops and removes containers with docker-compose down command (without removing images).
#         2) Removes any previously generated code located on current project's local directory: ./docker/integration_test_run.
#         3) Re-generates the code from the test models located on current project's local directory: ./test/integration_test_models. The code is generated on local directory: ./docker/integration_test_run.
#         4) Creates and starts containers with docker-compose up command.
#         5) Excecutes integration tests. The code should exists, otherwise the integration tests are not executed.
#
#         If option -k is also specified, then cleanup step is skipped at the end of the integration-test-suite, otherwise, the cleanup step is performed at the end of the tests (see -c option).
#
# EXAMPLES
#     Command line utility to perform graphql server's integration-test.
#
#     To see full test-integration info:
#     $ yarn test-integration -h
#
#     To run default behavior (cleanup-genCode-doTests-cleanup):
#     $ yarn test-integration
#
#     To run default behavior but skip final cleanup (cleanup-genCode-doTests):
#     $ yarn test-integration -k
#
#     To restart containers:
#     $ yarn test-integration -r
#
#     To generate code:
#     $ yarn test-integration -g
#
#     To do the tests only and keep the containers running at end:
#     $ yarn test-integration -t -k
#
#     To generate code and do the tests, removing all Docker images at end:
#     $ yarn test-integration -T
#
#     To do a full clean up (removes containers, images and code):
#     $ yarn test-integration -c
#
#     To setup a new testing environment
#     $ yarn test-integration -s [BRANCH]
#
#     To do a soft clean up (removes containers, volumes and code, but preserves images):
#     $ yarn test-integration -C
#

# exit on first error
set -e

#
# Constants
#
DOCKER_SERVICES=(
  gql_postgres
  gql_science_db_graphql_server
  gql_ncbi_sim_srv
)
TARGET_BRANCH=master
TARGET_DIR="./docker/integration_test_run"
INSTANCE_DIRS=(
  "servers/instance1"
  "servers/instance2"
)
TEST_MODELS_INSTANCE1="./test/integration_test_models_instance1"
TEST_MODELS_INSTANCE2="./test/integration_test_models_instance2"
MANPAGE="./man/sh_integration_test_run.man"
T1=180
DO_DEFAULT=true
KEEP_RUNNING=false
NUM_ARGS=$#
RED='\033[0;31m'
LGREEN='\033[1;32m'
YEL='\033[1;33m'
LGRAY='\033[38;5;242m'
NC='\033[0m'

#
# Functions
#

#
# Function: changeInstanceBranch()
#
# Attempts to checkout server instances to TARGET_BRANCH
#
changeInstanceBranch() {

  # Check that instances are set to the correct branch
  for instance in ${INSTANCE_DIRS[@]}; do

    instance_path=${TARGET_DIR}/${instance}

    # Verify an instance exists
    if [ -d $instance_path ]; then

      # Checkout to the new branch
      cd $instance_path
      git checkout $TARGET_BRANCH
      cd - 1>/dev/null
    fi

  done
}

#
# Function: checkCode()
#
# Check if generated code exists.
#
checkCode() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Check generated code...${NC}"

  # Remove generated code.
  for instance in "${INSTANCE_DIRS[@]}"
  do
    instance_path="$TARGET_DIR/$instance"
    # Check if directory exists
    if [ -d "$TARGET_DIR/$instance" ]; then
      echo -e "Code directory ${LGREEN}${instance}${NC} exists."

      # Check if directory is empty
      #if [ -n "$(ls -A ${instance} 2>/dev/null)" ]; then
      #  echo -e "@@ Code at: $instance ... ${LGREEN}ok${NC}"
      #else
      #  echo -e "!!${RED}ERROR${NC}: Code directory: ${RED}$instance${NC} exists but is empty!, please try -T option ... ${YEL}exit${NC}"
      #  echo -e "${LGRAY}---------------------------- @@${NC}\n"
      #  exit 0
      #fi
    else
      echo -e "!!${RED}ERROR${NC}: Code directory: ${RED}${instance}${NC} does not exist!, please try -T option ... ${YEL}exit${NC}"
      echo -e "${LGRAY}---------------------------- @@${NC}\n"
      exit 0
    fi
  done

  # Msg
  echo -e "@@ Code check ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: cleanup()
#
# Default actions (without --keep-running):
#   Remove docker items (containers, images, etc.).
#   Remove generated code.
#
cleanup() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Starting cleanup...${NC}"

  # Hard down
  docker-compose -f ./docker/docker-compose-test.yml down -v --rmi all

  # Delete code
  deleteServerSetup

  # Msg
  echo -e "@@ Cleanup ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"

}

#
# Function: consumeArgs()
#
# Shift the remaining arguments on $# list, and sets the flag KEEP_RUNNING=true if
# argument -k or --keep-running is found.
#
consumeArgs() {

  while [[ $NUM_ARGS -gt 0 ]]
  do
      a="$1"

      case $a in
        -k|--keep-running)

          # set flag
          KEEP_RUNNING=true
          # Msg
          echo -e "@@ Keep containers running at end: $KEEP_RUNNING"
          # Past argument
          shift
          let "NUM_ARGS--"
        ;;

        *)
          # Msg
          echo -e "@@ Discarting option: ${RED}$a${NC}"
          # Past argument
          shift
          let "NUM_ARGS--"
        ;;
      esac
  done
}

#
# Function: deleteGenCode()
#
# Delete generated code.
#
deleteGenCode() {

  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Removing generated code...${NC}"

  # Change to workspace root
  cd $TARGET_DIR

  # Remove generated files
  bash scripts/clean-workspace.sh

  # Change to project root
  cd - 1>/dev/null

  echo -e "@@ All code removed ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"

}

#
# Function: deleteServerSetup()
#
# Delete testing environment.
#
deleteServerSetup() {

  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Removing Zendro instances...${NC}"

  # Remove workspace modules and server instances
  rm -rf $TARGET_DIR/{graphql-server,servers}

  echo -e "@@ Zendro instances deleted ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: doTests()
#
# Do the mocha integration tests.
#
doTests() {
 # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Starting mocha tests...${NC}"

  # Wait for graphql server
  waitForGql

  # Do tests
  mocha ./test/mocha_integration_test.js

  # Msg
  echo -e "@@ Mocha tests ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: genCode()
#
# Generate code.
#
genCode() {

  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Generating code...${NC}"


  TARGET_DIR_INSTANCE1="${TARGET_DIR}/${INSTANCE_DIRS[0]}"
  TARGET_DIR_INSTANCE2="${TARGET_DIR}/${INSTANCE_DIRS[1]}"

  # Generate code
  node ./index.js -f ${TEST_MODELS_INSTANCE1} -o ${TARGET_DIR_INSTANCE1}
  node ./index.js -f ${TEST_MODELS_INSTANCE2} -o ${TARGET_DIR_INSTANCE2}

  # Patch the resolver for web-server
  # patch -V never ${TARGET_DIR_INSTANCE1}/resolvers/aminoacidsequence.js ./docker/ncbi_sim_srv/amino_acid_sequence_resolver.patch
  patch -V never ${TARGET_DIR_INSTANCE1}/models/generic/aminoacidsequence.js ./docker/ncbi_sim_srv/model_aminoacidsequence.patch
  # Add monkey-patching validation with AJV
  patch -V never ${TARGET_DIR_INSTANCE1}/validations/individual.js ./test/integration_test_misc/individual_validate.patch
  # Add patch for model webservice (generic) association
  # patch -V never ${TARGET_DIR_INSTANCE1}/models/transcript_count.js ./docker/ncbi_sim_srv/model_transcript_count.patch

  # Add patch for sql model accession validation
  patch -V never ${TARGET_DIR_INSTANCE1}/validations/accession.js ./test/integration_test_misc/accession_validate_instance1.patch

  # Msg
  echo -e "@@ Code generated on ${TARGET_DIR_INSTANCE1} and ${TARGET_DIR_INSTANCE2}: ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: man()
#
# Show man page of this script.
#
man() {
  # Show
  more ${MANPAGE}
}

#
# Function: restartContainers()
#
# Downs and ups containers
#
restartContainers() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Restarting containers...${NC}"

  # Soft down
  docker-compose -f ./docker/docker-compose-test.yml down
  # Msg
  echo -e "@@ Containers down ... ${LGREEN}done${NC}"

  # Install
  npm install
  # Msg
  echo -e "@@ Installing ... ${LGREEN}done${NC}"

  # Up
  docker-compose -f ./docker/docker-compose-test.yml up -d
  # Msg
  echo -e "@@ Containers up ... ${LGREEN}done${NC}"

  # List
  docker-compose -f ./docker/docker-compose-test.yml ps

  # Msg
  echo -e "@@ Containers restarted ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: softCleanup()
#
# restart & removeCodeGen
#
softCleanup() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Starting soft cleanup...${NC}"

  # Down
  docker-compose -f ./docker/docker-compose-test.yml down -v
  # Msg
  echo -e "@@ Containers down ... ${LGREEN}done${NC}"

  # Delete code
  deleteGenCode

  # Msg
  echo -e "@@ Soft cleanup ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: setupTestingEnvironment
#
# Clones and initializes a two-server environment using yarn workspaces.
#
setupTestingEnvironment() {

  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Creating Zendro instances...${NC}"

  # Store current working
  ROOT_DIR=$(pwd)
  MAIN_SERVER="graphql-server"

  # Change working directory
  cd $TARGET_DIR

  # Recreate server instances
  rm -rf servers/ && mkdir servers/

  # Clone graphql-server and checkout the feature branch
  git clone \
    --branch $TARGET_BRANCH \
    git@github.com:Zendro-dev/graphql-server.git \
    $MAIN_SERVER

  # Force "node-jq" to use the docke image "jq"
  export NODE_JQ_SKIP_INSTALL_BINARY=true

  # Install module dependencies
  cd $MAIN_SERVER && npm install
  echo -e "@@ Installing Zendro server modules ... ${LGREEN}done${NC}"
  cd -

  # Copy graphql-server instances
  for instance in ${INSTANCE_DIRS[@]}; do cp -r $MAIN_SERVER $instance; done

  # Return to root directory
  cd $ROOT_DIR

  echo -e "@@ Zendro instances created ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: upContainers()
#
# Up docker containers.
#
upContainers() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Starting up containers...${NC}"

  # Install
  # npm install
  # Msg
  echo -e "@@ Installing ... ${LGREEN}done${NC}"

  # Up
  docker-compose -f ./docker/docker-compose-test.yml up -d --no-recreate
  # Msg
  echo -e "@@ Containers up ... ${LGREEN}done${NC}"

  # List
  docker-compose -f ./docker/docker-compose-test.yml ps

  # Msg
  echo -e "@@ Containers up ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Function: waitForGql()
#
# Waits for GraphQL Server to start, for a maximum amount of T1 seconds.
#
waitForGql() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Waiting for GraphQL server to start...${NC}"

  # Wait until the Zendro GraphQL web-server is up and running
  waited=0
  until curl 'localhost:3000/graphql' > /dev/null 2>&1
  do
    if [ $waited == $T1 ]; then
      # Msg: error
      echo -e "!!${RED}ERROR${NC}: zendro graphql web server does not start, the wait time limit was reached ($T1).\n"
      echo -e "${LGRAY}---------------------------- @@${NC}\n"
      exit 0
    fi
    sleep 2
    waited=$(expr $waited + 2)
  done

  # Msg
  echo -e "@@ First GraphQL server is up! ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"

  until curl 'localhost:3030/graphql' > /dev/null 2>&1
  do
    if [ $waited == $T1 ]; then
      # Msg: error
      echo -e "!!${RED}ERROR${NC}: zendro graphql web server does not start, the wait time limit was reached ($T1).\n"
      echo -e "${LGRAY}---------------------------- @@${NC}\n"
      exit 0
    fi
    sleep 2
    waited=$(expr $waited + 2)
  done

  # Msg
  echo -e "@@ Second GraphQL server is up! ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
}

#
# Main
#
if [ $# -gt 0 ]; then
    # Process comand line arguments.
    while [[ $NUM_ARGS -gt 0 ]]
    do
        key="$1"

        case $key in
            -b|--branch)

              shift
              let "NUM_ARGS--"

              TARGET_BRANCH=$1

              if [[ -z $TARGET_BRANCH || $TARGET_BRANCH =~ ^-|^-- ]]; then
                echo -e "@@ -b requires a value: ... ${key} ${RED}<BRANCH>${NC} $@ ... ${YEL}exit${NC}"
                exit 1
              fi

              echo -e "@@ setting test environment branch to: $TARGET_BRANCH"

              # Reset any branch changes
              deleteGenCode

              # Checkout instances to the specified branch
              changeInstanceBranch

              shift
              let "NUM_ARGS--"
            ;;

            -k|--keep-running)
              # Set flag
              KEEP_RUNNING=true
              # Msg
              echo -e "@@ keep containers running at end: $KEEP_RUNNING"

              # Past argument
              shift
              let "NUM_ARGS--"
            ;;

            -h|--help)
              # show man page
              man

              # Done
              exit 0
            ;;

            -s|--setup)

              # Setup testing environment
              setupTestingEnvironment

              # Done
              exit 0
            ;;

            -r|--restart-containers)
              # Restart containers
              restartContainers

              # Done
              exit 0
            ;;

            -g|--generate-code)
              # Light cleanup
              softCleanup
              # Generate code
              genCode

              # Done
              exit 0
            ;;

            -t|--run-tests-only)
              # Check code
              checkCode
              # Restart containers
              upContainers
              # Do the tests
              doTests

              # Past argument
              shift
              let "NUM_ARGS--"

              # Consume remaining arguments
              consumeArgs $@

              # Clear flag
              DO_DEFAULT=false
            ;;

            -T|--generate-code-and-run-tests)
              # Light cleanup
              softCleanup
              # Generate code
              genCode
              # Up containers
              upContainers
              # Do the tests
              doTests

              # Past argument
              shift
              let "NUM_ARGS--"

              # Consume remaining arguments
              consumeArgs $@

              # Clear flag
              DO_DEFAULT=false
            ;;

            -c|--cleanup)
              # Cleanup
              cleanup

              # Done
              exit 0
            ;;

            -C|--soft-cleanup)
              # Soft cleanup
              softCleanup

              # Done
              exit 0
            ;;

            *)
              # Msg
              echo -e "@@ Bad option: ... ${RED}$key${NC} ... ${YEL}exit${NC}"
              exit 1
            ;;
        esac
    done
fi

#
# Default
#
if [ $DO_DEFAULT = true ]; then
  # Default: no arguments
    # Cleanup
    cleanup
    # Clone and install testing environment
    setupTestingEnvironment
    # Generate code
    genCode
    # Ups containers
    upContainers
    # Do the tests
    doTests
fi

#
# Last cleanup
#
if [ $KEEP_RUNNING = false ]; then

  # Msg
  echo -e "@@ Doing final cleanup..."
  # Cleanup
  cleanup
else
  # Msg
  echo -e "@@ Keeping containers running ... ${LGREEN}done${NC}"
  # List
  docker-compose -f ./docker/docker-compose-test.yml ps
fi
