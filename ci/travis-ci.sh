#!/bin/bash

COMMAND=$1
EXIT_VALUE=0

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
    TRAVIS_BUILD_DIR="$HOME/Desktop/kalabox"
    #TRAVIS_TAG=v0.12.0
  else
    sudo apt-get install curl
    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start +extension RANDR
    sleep 5
  fi
  # Add our key
  if ([ $TRAVIS_BRANCH == "master" ] || [ ! -z $TRAVIS_TAG ]) &&
    [ $TRAVIS_PULL_REQUEST == "false" ] &&
    [ $TRAVIS_REPO_SLUG == "kalabox/kalabox-ui" ]; then
      openssl aes-256-cbc -K $encrypted_1855b2cf27b1_key -iv $encrypted_1855b2cf27b1_iv -in ci/travis.id_rsa.enc -out $HOME/.ssh/travis.id_rsa -d
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
  if ([ $TRAVIS_BRANCH == "master" ] || [ ! -z $TRAVIS_TAG ])
    [ $TRAVIS_PULL_REQUEST == "false" ] &&
    [ $TRAVIS_REPO_SLUG == "kalabox/kalabox-ui" ]; then

    # BUMP patch but only on master and not a tag
    if [ -z $TRAVIS_TAG ] && [ $TRAVIS_BRANCH == "master" ]; then
      grunt bump-patch
    fi
    # BUMP minor on a tag
    if [ ! -z $TRAVIS_TAG ] then
      grunt bump-patch
    fi

    BUILD_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat $TRAVIS_BUILD_DIR/package.json)")
    TRAVIS_TAG=BUILD_VERSION

    # Move the built stuff over
    mv built/kalabox-win-dev.zip built/kalabox2-win-v$BUILD_VERSION.zip
    mv built/kalabox-osx-dev.tar.gz built/kalabox2-osx-v$BUILD_VERSION.tar.gz
    mv built/kalabox-linux32-dev.tar.gz built/kalabox2-linux32-v$BUILD_VERSION.tar.gz
    mv built/kalabox-linux64-dev.tar.gz built/kalabox2-linux64-v$BUILD_VERSION.tar.gz
  else
    exit $EXIT_VALUE
  fi
}

# after-deploy
#
# Clean up after the tests.
#
after-deploy() {
  if ([ $TRAVIS_BRANCH == "master" ] || [ ! -z $TRAVIS_TAG ])
    [ $TRAVIS_PULL_REQUEST == "false" ] &&
    [ $TRAVIS_REPO_SLUG == "kalabox/kalabox-ui" ]; then
    $HOME/index-gen.sh > /dev/null
    # Set up the SSH key
    chmod 600 $HOME/.ssh/travis.id_rsa
    eval "$(ssh-agent)"
    ssh-add $HOME/.ssh/travis.id_rsa
    # Set a user for things
    git config --global user.name "Kala C. Bot"
    git config --global user.email "kalacommitbot@kalamuna.com"
    # Set up our repos
    # We need to re-add this in because our clone was originally read-only
    git remote rm origin
    git remote add origin git@github.com:kalabox/kalabox-ui.git
    git checkout $TRAVIS_BRANCH
    git add -A
    git commit -m "KALABOT MERGING COMMIT ${TRAVIS_COMMIT} FROM ${TRAVIS_REPO_SLUG} VERSION ${BUILD_VERSION} [ci skip]" --amend --author="Kala C. Bot <kalacommitbot@kalamuna.com>" --no-verify
    git push origin $TRAVIS_BRANCH -f
  fi
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
