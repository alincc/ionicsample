#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bash "${DIR}/increase_builds.sh"
node "${DIR}/increase_version_number.js"
