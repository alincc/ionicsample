#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bash "${DIR}/increase_builds.sh"
node "${DIR}/increase_version_number.js"
./scripts/release_ios.sh
./scripts/release_android.sh
