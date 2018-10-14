#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "${DIR}/increase_ios_build.js"
node "${DIR}/increase_android_build.js"
