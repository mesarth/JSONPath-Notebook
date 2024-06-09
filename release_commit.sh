#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: No tag name provided."
  echo "Usage: $0 <tag-name>"
  exit 1
fi

TAG_NAME=$1

if [ -z "$(git status --porcelain)" ]; then
  echo "Error: No changes to commit."
  exit 1
fi

git add .
git commit -m "$TAG_NAME"

git tag $TAG_NAME
git push --force --atomic origin main $TAG_NAME

echo "Successfully tagged the current commit with '$TAG_NAME' and pushed to remote repository."
