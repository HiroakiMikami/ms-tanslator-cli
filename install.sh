#! /bin/bash

target=${HOME}/bin/mstcli

cat <(echo "#! $(which node)") translate.js > ${target}
chmod u+x ${target}
