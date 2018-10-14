#!/bin/bash

#Read
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VERSION=`node "${DIR}/get_version_number.js"`
BUILD=`node "${DIR}/get_android_build.js"`

#Build
echo "Build?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) ionic cordova build android --prod --release; break;;
        No ) break;;
    esac
done

#Jar Sign
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Google\ Drive/Work/Pidge/Certificates/Android/Production/PidgeProductionKeystore.keystore ~/Projects/Pidge/app/platforms/android/build/outputs/apk/android-release-unsigned.apk PidgeProductionKeystore

#Align
/Users/muhannad/Library/Android/sdk/build-tools/25.0.2/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk "/Users/muhannad/Google Drive/Work/Pidge/Apps/android-b${BUILD}-v${VERSION}.apk"
