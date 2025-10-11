#!/bin/bash
set -e

SERVER_REPO_PATH="../server"
PACKAGE_NAME="@wger-project/react-components"
MAIN_BRANCH="master"

NEW_VERSION=$(date +%Y-%m-%d)

echo "Updating package.json version to ${NEW_VERSION}..."
npm version "${NEW_VERSION}" --no-git-tag-version

git add package.json
git commit -m "Bump version to ${NEW_VERSION} for publishing."
echo "Pushing new version commit to GitHub..."
git push origin "$MAIN_BRANCH"

echo "Triggering GitHub Actions workflow to publish ${NEW_VERSION}..."
gh workflow run publish.yml -f version_tag=latest --ref "$MAIN_BRANCH"

echo "Waiting 30 seconds for npm publish to complete..."
sleep 30

echo "Changing directory to server repo: ${SERVER_REPO_PATH}"
cd "$SERVER_REPO_PATH"

echo "Updating ${PACKAGE_NAME} dependency in server package.json to ${NEW_VERSION}..."
npm install "${PACKAGE_NAME}@${NEW_VERSION}"

git add package.json package-lock.json
git commit -m "Update ${PACKAGE_NAME} to ${NEW_VERSION}."
echo "Pushing dependency update to server repository..."
git push origin "$MAIN_BRANCH"

cd -

echo "✅ SUCCESS: Components version ${NEW_VERSION} published and server updated."