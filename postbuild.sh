#!/bin/bash

# TODO: this is a horrible hack to remove Roboto font from the app. For some reason
#       the font appears in the production build, but not during development.
sed -i 's/Roboto/Open Sans Light/g' build/static/js/main.*.js

# This script assumes the wger backend is in a folder called "server"
STATIC_FOLDER=../server/wger/core/static/react

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ -d "$STATIC_FOLDER" ]; then
    cp build/static/js/main.*.js $STATIC_FOLDER/main.js
    cp build/static/css/main.*.css $STATIC_FOLDER/main.css
    cp -r build/locales $STATIC_FOLDER/
    echo -e "${GREEN}*** SUCCESS ***: Build files copied to django static folder: ${STATIC_FOLDER} ${NC}"
else
  echo -e "${RED}*** ERROR ***: Django static folder ${STATIC_FOLDER} not found"
  echo -e "Build files could not be copied${NC}"
fi


