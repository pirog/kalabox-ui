#!/bin/bash

COMMAND=$1
EXIT_VALUE=0

##
# SCRIPT COMMANDS
##

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
  grunt test
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
  grunt prepare
  cd $TRAVIS_BUILD_DIR/generated
  npm install --production --ignore-scripts
  grunt build
  cd $TRAVIS_BUILD_DIR

}

# before-deploy
#
# Clean up after the tests.
#
before-deploy() {
  if [ ! -z $TRAVIS_TAG ]; then
    mv built/kalabox-win-dev.zip built/kalabox-win-$TRAVIS_TAG.zip
    mv built/kalabox-osx-dev.tar.gz built/kalabox-osx-$TRAVIS_TAG.tar.gz
    mv built/kalabox-linux32-dev.tar.gz built/kalabox-linux32-$TRAVIS_TAG.tar.gz
    mv built/kalabox-linux64-dev.tar.gz built/kalabox-linux64-$TRAVIS_TAG.tar.gz
  else
    mv built/kalabox-win-dev.zip built/kalabox-win-dev-$TRAVIS_BUILD_NUMBER.zip
    mv built/kalabox-osx-dev.tar.gz built/kalabox-osx-dev-$TRAVIS_BUILD_NUMBER.tar.gz
    mv built/kalabox-linux32-dev.tar.gz built/kalabox-linux32-dev-$TRAVIS_BUILD_NUMBER.tar.gz
    mv built/kalabox-linux64-dev.tar.gz built/kalabox-linux64-dev-$TRAVIS_BUILD_NUMBER.tar.gz
  fi
}

# after-deploy
#
# Clean up after the tests.
#
after-deploy() {
  $HOME/cfindex.sh kalamuna $CF_API_KEY kb2 >/dev/null
}

##
# UTILITY FUNCTIONS:
##

# Prints a message about the section of the script.
header() {
  set +xv
  echo
  echo "** $@"
  echo
  set -xv
}

# Sets the exit level to error.
set_error() {
  EXIT_VALUE=1
}

# Runs a command and sets an error if it fails.
run_test() {
  if ! $@; then
    set_error
  fi
}

# Runs a command showing all the lines executed
run_command() {
  set -xv
  $@
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
