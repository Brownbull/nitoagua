#!/bin/bash
# Helper script to run commands with production environment variables
# Usage: ./scripts/run-with-prod-env.sh <command>
#
# This loads .env.production.local and runs the specified command

set -e

ENV_FILE=".env.production.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found!"
  echo "Create it with your production Supabase credentials."
  echo "See docs/testing/environment-strategy.md for details."
  exit 1
fi

# Export environment variables from the file
set -a
source "$ENV_FILE"
set +a

# Run the command
exec "$@"
