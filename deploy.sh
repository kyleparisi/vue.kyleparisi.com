#!/usr/bin/env bash

# abort on errors
set -e

# build
rm -rf ./dist
mkdir dist
cp Chat.js Chat.css Chat.test.js index.html dist/
cp Table.js Table.css Table.test.js Table.html dist/

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
echo 'vue.kyleparisi.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
git push -f git@github.com:kyleparisi/kyleparisi.github.io.git master

cd -
