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
#     npm run test-integration [-- OPTIONS]
#
#   cleaup:
#     npm run test-integration-clear
#   or
#     npm run test-integration -- -c
#
# DESCRIPTION
#     Command line utility to perform graphql server's integration-test.
#
#     Intergation-test case creates a docker-compose ambient with three servers:
#
#     gql_postgres
#     gql_science_db_graphql_server
#     gql_ncbi_sim_srv
#
#     By default, after the test run, all corresponding Docker images will be completely removed from the docker, this cleanup step can be skiped with -k option as described below.
#
#     Default behavior performs the following actions:
#
#         1) Stop and removes Docker containers with docker-compose down command, also removes Docker images (--rmi) and named or anonymous volumes (-v).
#         2) Removes any previously generated code located on current project's local directory: ./docker/integration_test_run.
#         3) Re-generates the code from the test models located on current project's local directory: ./test/integration_test_models. The code is generated on local directory: ./docker/integration_test_run.
#         4) Creates and start containers with docker-compose up command.
#         5) Excecutes integration tests. The code should exists, otherwise the integration tests are not executed.
#         6) Do cleanup as described on 1) and 2) steps (use -k option to skip this step).
#
#     The options are as follows:
#
#     -h, --help
#
#         Display this help and exit.
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
#     -g, --generate-code
#
#         This option performs the following actions:
#
#         1) Stop and removes containers with docker-compose down command (without removing images).
#         2) Removes any previously generated code located on current project's local directory: ./docker/integration_test_run.
#         3) Re-generates the code from the test models located on current project's local directory: ./test/integration_test_models. The code is generated on local directory: ./docker/integration_test_run.
#         4) Creates and start containers with docker-compose up command.
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
#     -k, --keep-running
#
#         This option skips the cleanup step at the end of the integration-test-suite and keeps the Docker containers running.
#
#         This option can be used alone, or in conjunction with the options -t or -T.
#
#         If this option is not specified, then, by default, the cleanup step is performed at the end of the tests (see -c option).
#
#     -c, --cleanup
#
#         This option performs the following actions:
#
#         1) Stops and removes Docker containers with docker-compose down command, also removes Docker images (--rmi) and named or anonymous volumes (-v).
#         2) Removes any previously generated code located on current project's local directory: ./docker/integration_test_run.
#
# EXAMPLES
#     Command line utility to perform graphql server's integration-test.
#
#     To see full test-integration info:
#     $ npm run test-integration -- -h
#
#     To run default behavior (cleanup-genCode-doTests-cleanup):
#     $ npm run test-integration
#
#     To run default behavior but skip final cleanup (cleanup-genCode-doTests):
#     $ npm run test-integration -- -k
#
#     To restart containers:
#     $ npm run test-integration -- -r
#
#     To generate code and start containers:
#     $ npm run test-integration -- -g
#
#     To do the tests only and keep the containers running at end:
#     $ npm run test-integration -- -t -k
#
#     To generate code and do the tests, removing all Docker images at end:
#     $ npm run test-integration -- -T

#     To do a full clean up (removes containers, images and code):
#     $ npm run test-integration -- -c
#
#

# exit on first error
set -e

#
# Constants
#
DOCKER_SERVICES=(gql_postgres \
                 gql_science_db_graphql_server \
                 gql_ncbi_sim_srv)
TEST_MODELS_INSTANCE1="./test/integration_test_models_instance1"
TEST_MODELS_INSTANCE2="./test/integration_test_models_instance2"
TARGET_DIR_INSTANCE1="./docker/integration_test_run/instance1"
TARGET_DIR_INSTANCE2="./docker/integration_test_run/instance2"
CODEGEN_DIRS=($TARGET_DIR_INSTANCE1"/adapters" \
              $TARGET_DIR_INSTANCE1"/models" \
              $TARGET_DIR_INSTANCE1"/models-distributed" \
              $TARGET_DIR_INSTANCE1"/models-webservice" \
              $TARGET_DIR_INSTANCE1"/models-cenz-server"
              $TARGET_DIR_INSTANCE1"/migrations" \
              $TARGET_DIR_INSTANCE1"/schemas" \
              $TARGET_DIR_INSTANCE1"/resolvers" \
              $TARGET_DIR_INSTANCE1"/validations" \
              $TARGET_DIR_INSTANCE1"/patches" \
              $TARGET_DIR_INSTANCE2"/adapters" \
              $TARGET_DIR_INSTANCE2"/models" \
              $TARGET_DIR_INSTANCE2"/models-distributed" \
              $TARGET_DIR_INSTANCE2"/models-webservice" \
              $TARGET_DIR_INSTANCE2"/models-cenz-server"
              $TARGET_DIR_INSTANCE2"/migrations" \
              $TARGET_DIR_INSTANCE2"/schemas" \
              $TARGET_DIR_INSTANCE2"/resolvers" \
              $TARGET_DIR_INSTANCE2"/validations" \
              $TARGET_DIR_INSTANCE2"/patches")
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
# Function: deleteGenCode()
#
# Delete generated code.
#
deleteGenCode() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Removing generated code...${NC}"

  # Remove generated code.
  for i in "${CODEGEN_DIRS[@]}"
  do
    if [ -d $i ]; then
      rm -rf $i
      if [ $? -eq 0 ]; then
          echo -e "@ Removed: $i ... ${LGREEN}done${NC}"
      else
          echo -e "!!${RED}ERROR${NC}: trying to remove: ${RED}$i${NC} fails ... ${YEL}exit${NC}"
          exit 0
      fi
    fi
  done


  # Msg
  echo -e "@@ All code removed ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
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
  for i in "${CODEGEN_DIRS[@]}"
  do
    # Check if directory exists
    if [ -d $i ]; then
      echo -e "Code directory ${LGREEN}$i${NC} exists."

      # Check if directory is empty
      #if [ -n "$(ls -A ${i} 2>/dev/null)" ]; then
      #  echo -e "@@ Code at: $i ... ${LGREEN}ok${NC}"
      #else
      #  echo -e "!!${RED}ERROR${NC}: Code directory: ${RED}$i${NC} exists but is empty!, please try -T option ... ${YEL}exit${NC}"
      #  echo -e "${LGRAY}---------------------------- @@${NC}\n"
      #  exit 0
      #fi
    else
      echo -e "!!${RED}ERROR${NC}: Code directory: ${RED}$i${NC} does not exists!, please try -T option ... ${YEL}exit${NC}"
      echo -e "${LGRAY}---------------------------- @@${NC}\n"
      exit 0
    fi
  done

  # Msg
  echo -e "@@ Code check ... ${LGREEN}done${NC}"
  echo -e "${LGRAY}---------------------------- @@${NC}\n"
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
  deleteGenCode

  # Msg
  echo -e "@@ Cleanup ... ${LGREEN}done${NC}"
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
  docker-compose -f ./docker/docker-compose-test.yml down
  # Msg
  echo -e "@@ Containers down ... ${LGREEN}done${NC}"

  # Delete code
  deleteGenCode

  # Msg
  echo -e "@@ Soft cleanup ... ${LGREEN}done${NC}"
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

  # Wait until the Science-DB GraphQL web-server is up and running
  waited=0
  until curl 'localhost:3000/graphql' > /dev/null 2>&1
  do
    if [ $waited == $T1 ]; then
      # Msg: error
      echo -e "!!${RED}ERROR${NC}: science-db graphql web server does not start, the wait time limit was reached ($T1).\n"
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
      echo -e "!!${RED}ERROR${NC}: science-db graphql web server does not start, the wait time limit was reached ($T1).\n"
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
# Function: genCode()
#
# Generate code.
#
genCode() {
  # Msg
  echo -e "\n${LGRAY}@@ ----------------------------${NC}"
  echo -e "${LGRAY}@@ Generating code...${NC}"

  # Install
  npm install
  # Msg
  echo -e "@@ Installing ... ${LGREEN}done${NC}"

  # Generate
  node ./index.js -f ${TEST_MODELS_INSTANCE1} -o ${TARGET_DIR_INSTANCE1}
  node ./index.js -f ${TEST_MODELS_INSTANCE2} -o ${TARGET_DIR_INSTANCE2}

  # Patch the resolver for web-server
  #patch -V never ${TARGET_DIR_INSTANCE1}/resolvers/aminoacidsequence.js ./docker/ncbi_sim_srv/amino_acid_sequence_resolver.patch
  patch -V never ${TARGET_DIR_INSTANCE1}/models-webservice/aminoacidsequence.js ./docker/ncbi_sim_srv/model_aminoacidsequence.patch
  # Add monkey-patching validation with AJV
  patch -V never ${TARGET_DIR_INSTANCE1}/validations/individual.js ./test/integration_test_misc/individual_validate.patch
  # Add patch for model webservice association
  # patch -V never ${TARGET_DIR_INSTANCE1}/models/transcript_count.js ./docker/ncbi_sim_srv/model_transcript_count.patch

  # Msg
  echo -e "@@ Code generated on ${TARGET_DIR_INSTANCE1} and ${TARGET_DIR_INSTANCE2}: ... ${LGREEN}done${NC}"
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
  echo -e "@@ Containers up ... ${LGREEN}done${NC}"
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
# Function: man()
#
# Show man page of this script.
#
man() {
  # Show
  more ${MANPAGE}
}

#
# Main
#
if [ $# -gt 0 ]; then
    #Processes comand line arguments.
    while [[ $NUM_ARGS -gt 0 ]]
    do
        key="$1"

        case $key in
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
              # Ups containers
              upContainers

              # Done
              exit 0
            ;;

            -t|--run-tests-only)
              # Check code
              checkCode
              # Restart containers
              restartContainers
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

            *)
              # Msg
              echo -e "@@ Bad option: ... ${RED}$key${NC} ... ${YEL}exit${NC}"
              exit 0
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
