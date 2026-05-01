#!/bin/bash

git add .

if [ -z "$1" ]; then
  echo "❌ Add a commit message: ./safe-push.sh \"message\""
  exit 1
fi

git commit -m "$1"

git pull --rebase

git push

echo "✅ Safe push complete"
