#!/bin/bash

COMMAND=$1
EXIT_VALUE=0

CURRENT_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(curl -s https://raw.githubusercontent.com/kalabox/kalabox/master/package.json)")
COMMIT_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat $TRAVIS_BUILD_DIR/package.json)")

CURRENT_MAJOR=$(echo $CURRENT_VERSION | cut -f1 -d.)
COMMIT_MAJOR=$(echo $COMMIT_VERSION | cut -f1 -d.)
CURRENT_MINOR=$(echo $CURRENT_VERSION | cut -f2 -d.)
COMMIT_MINOR=$(echo $COMMIT_VERSION | cut -f2 -d.)
CURRENT_PATCH=$(echo $CURRENT_VERSION | cut -f3 -d.)
COMMIT_PATCH=$(echo $COMMIT_VERSION | cut -f3 -d.)

BUILD_VERSION=v$COMMIT_MAJOR.$COMMIT_MINOR.$COMMIT_PATCH

##
# SCRIPT COMMANDS
##

# before-install
#
# Do some stuff before npm install
#
before-install() {
  # This is to locally simulate travis
  if [ -z $TRAVIS ]; then
    TRAVIS_BUILD_DIR="/Users/pirog/Desktop/kalabox"
    #TRAVIS_TAG=v0.12.0
  else
    sudo apt-get install curl
    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start +extension RANDR
    sleep 5
  fi

  # We only check on a PR
  if [ $TRAVIS_PULL_REQUEST != "false" ]; then
    if [ ! -z $TRAVIS_TAG ]; then
      if [ $COMMIT_MINOR -le $CURRENT_MINOR ]; then
        echo "Illegal minor version number. Please use grunt release to roll an official release."
        set_error
      else
        if [ $COMMIT_PATCH -ne 0 ]; then
          echo "Illegal patch version number. Should be 0 on a minor version bump. Please use grunt release to bump the version."
          set_error
        fi
      fi
    else
      if [ $COMMIT_MINOR -ne $CURRENT_MINOR ]; then
        echo "Illegal minor version number. Minor versions should only change on a tag and release."
        set_error
      fi
      if [ $COMMIT_PATCH -le $CURRENT_PATCH ]; then
        echo "Illegal patch version number. Please use grunt version to bump the version."
        set_error
      fi
    fi
  fi
}

#$ node -pe 'JSON.parse(process.argv[1]).foo' "$(cat foobar.json)"

# before-script
#
# Setup Drupal to run the tests.
#
before-script() {
  sudo apt-get install jq
  sudo apt-get install python-pip
  sudo pip install --upgrade httpie
  npm install -g grunt-cli bower
  bower install
}

# script
#
# Run the tests.
#
script() {
  DISPLAY=:99.0 grunt test
}

# after-script
#
# Clean up after the tests.
#
after-script() {
  echo
}

# after-success
#
# Clean up after the tests.
#
after-success() {
  cd $TRAVIS_BUILD_DIR
  DISPLAY=:99.0 grunt build
  cd $TRAVIS_BUILD_DIR
}

# before-deploy
#
# Clean up after the tests.
#
before-deploy() {
if [ ! -z $TRAVIS_TAG ]; then
  mv built/kalabox-win-dev.zip built/kalabox2-win-$TRAVIS_TAG.zip
  mv built/kalabox-osx-dev.tar.gz built/kalabox2-osx-$TRAVIS_TAG.tar.gz
  mv built/kalabox-linux32-dev.tar.gz built/kalabox2-linux32-$TRAVIS_TAG.tar.gz
  mv built/kalabox-linux64-dev.tar.gz built/kalabox2-linux64-$TRAVIS_TAG.tar.gz
else
  mv built/kalabox-win-dev.zip built/kalabox2-win-$BUILD_VERSION-dev.zip
  mv built/kalabox-osx-dev.tar.gz built/kalabox2-osx-$BUILD_VERSION-dev.tar.gz
  mv built/kalabox-linux32-dev.tar.gz built/kalabox2-linux32-$BUILD_VERSION-dev.tar.gz
  mv built/kalabox-linux64-dev.tar.gz built/kalabox2-linux64-$BUILD_VERSION-dev.tar.gz
fi
}

# after-deploy
#
# Clean up after the tests.
#
after-deploy() {
  $HOME/index-gen.sh >/dev/null
}

##
# UTILITY FUNCTIONS:
##

# Sets the exit level to error.
set_error() {
  EXIT_VALUE=1
}

# Runs a command and sets an error if it fails.
run_command() {
  set -xv
  if ! $@; then
    set_error
  fi
  set +xv
}

##
# SCRIPT MAIN:
##

# Capture all errors and set our overall exit value.
trap 'set_error' ERR

# We want to always start from the same directory:
cd $TRAVIS_BUILD_DIR

case $COMMAND in
  before-install)
    run_command before-install
    ;;

  before-script)
    run_command before-script
    ;;

  script)
    run_command script
    ;;

  after-script)
    run_command after_script
    ;;

  after-success)
    run_command after-success
    ;;

  before-deploy)
    run_command before-deploy
    ;;

  after-deploy)
    run_command after-deploy
    ;;
esac

exit $EXIT_VALUE
