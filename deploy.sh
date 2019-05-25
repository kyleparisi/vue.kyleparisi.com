#!/usr/bin/env bash

# abort on errors
set -e

# build
rm -rf ./dist
npm run helloworld
npm run heffer

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'vue.kyleparisi.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
git push -f git@github.com:kyleparisi/kyleparisi.github.io.git master

cd -
