#!/bin/bash

set -e

rm -rf build/ &&
  rm -f extension.zip &&
  npm run build &&
  zip -r extension.zip build/ -x "*.DS_Store" -x "*.map"
