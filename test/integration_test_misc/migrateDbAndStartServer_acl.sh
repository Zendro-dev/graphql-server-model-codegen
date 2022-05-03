#!/usr/bin/env bash

dev=false
if [[ $1 = "dev" ]]; then
  dev=true
fi
# Wait until the relational database-server up and running
waited=0
until node ./scripts/testDatabaseConnectionsAvailable.js 1>/dev/null
do
  if [ $waited == 240 ]; then
    echo -e '\nERROR: Time out reached while waiting for relational database server to be available.\n'
    exit 1
  fi
  sleep 2
  waited=$(expr $waited + 2)
done

# Run migrations
node -e 'require("./utils/migration").up()'

# Start GraphQL-server
if [ $dev = true ]; then
  npm run dev acl
else
  npm start acl
fi
