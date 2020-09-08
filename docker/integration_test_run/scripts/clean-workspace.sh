#!/usr/bin/env bash

PATHS=(
  migrations
  models/adapters
  models/distributed
  models/generic
  models/sql
  models/zendro-server
  patches
  resolvers
  schemas
  validations
  acl_rules.js
)

for instance in servers/*
do

  # Change to graphql-server directory
  if [ -d $instance ]
  then

    cd $instance

    # Forcefully delete all generated files
    for d in ${PATHS[@]}
    do
      echo $instance/${d}
      rm -rf ${d}
    done

    # Checkout deleted static files
    git checkout $(git diff --no-renames --name-only --diff-filter=D)

    # Return to previous working directory
    cd - 1>/dev/null

  fi

done
