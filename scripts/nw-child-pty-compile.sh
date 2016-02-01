#!/bin/bash

#
# Compiles node webkit version of child_pty pseudo terminal module.
#

npm install nw-gyp && \
  cd ./node_modules/child_pty/ && \
  ../.bin/nw-gyp configure --target=0.12.3 && \
  ../.bin/nw-gyp build
