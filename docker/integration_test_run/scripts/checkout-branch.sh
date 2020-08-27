#/usr/bin/env bash

# This script assumes the initial working directory is "integration_test_run"

TARGET_BRANCH=$1


if [[ -d "servers" ]]; then

  for instance in $(ls servers)
  do

    INSTANCE_PATH="servers/$instance"

    if [[ -d "$INSTANCE_PATH" ]]; then

      # Change into instance directory
      cd $INSTANCE_PATH

      # Forcefully checkout to target branch
      # WARNING: discards all changes when switching branches!
      git checkout --force $TARGET_BRANCH

      # Synchronize with remote
      git fetch --all
      git reset --hard

      # Return to previous working directory
      cd - 1>/dev/null

    fi

  done

fi
