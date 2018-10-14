#!/bin/bash

git checkout dev-muhannad
ionic cordova build android
mv builds/android-dev.apk builds/android-dev.apk.2
cp platforms/android/build/output/apk/android-debug.apk builds/android-dev.apk
rm builds/android-dev.apk.2
git add .
git commit -a -m "Build dev version"
git checkout development
git merge dev-muhannad
git push upstream development
git checkout master
git merge development
git push upstream master
git checkout dev-muhannad
