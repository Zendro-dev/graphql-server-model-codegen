#/usr/bin/env bash

# This script assumes the initial working directory is "integration_test_run"

TARGET_BRANCH=$1

if [[ -d "servers" ]]; then

  for instance in $(ls servers)
  do

    if [[ -d "$instance" ]]; then

      # Change into instance directory
      cd $instance

      # Forcefully checkout target branch
      # WARNING: discards all changes!
      git checkout --force $TARGET_BRANCH

      # Return to previous working directory
      cd - 1>/dev/null

    fi

  done

fi
