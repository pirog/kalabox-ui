Contributing to the Kalabox GUI
=======================

Creating Issues
---------------

ALL issues regarding the Kalabox GUI should be created on the main Kalabox
project page: https://github.com/kalabox/kalabox/issues

If you create an issue there, please read the main 
[contribution guide](https://github.com/kalabox/kalabox/blob/HEAD/CONTRIBUTING.md) 
and follow issue guidelines that are posted as the first comment on your 
issue once it has been created.

Setting Up for Development
--------------------------

#### 1. Install Kalabox

Use the [latest installer](http://www.kalabox.io) to get all the Kalabox 
fundamentals (primarily the VM and the necessary docker binaries in 
~/.kalabox/bin).

#### 2. Install dev dependencies

You'll need to get node, grunt, sass, and the kalabox-ui repo setup to start
development.

**On MacOSX**

NOTE: You might want to make sure you get npm set up so you can install global modules without sudo. Agree to install command line tools if it prompts you when you run the git step.

```
cd /tmp
# Might want to grab the latest node pkg
curl -LO https://nodejs.org/dist/v4.2.6/node-v4.2.6.pkg
sudo -S installer -pkg "/tmp/node-v4.2.6.pkg" -target /
npm install -g grunt-cli
sudo gem install sass
git clone https://github.com/kalabox/kalabox-ui.git
```

**On Windows**


Make sure you have installed Node 4.2 and GIT. See https://github.com/kalabox/kalabox-ted/tree/master/scripts/build for some helpful scripts.

You also will need to install ruby

```
gem install sass
npm install -g grunt-cli
git clone https://github.com/kalabox/kalabox-ui.git
```

**On Debian**

NOTE: You might want to make sure you get npm set up so you can install global modules without sudo

```
sudo apt-get -y update
sudo apt-get -y install git-core curl ruby
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get -y install nodejs
sudo gem install sass
npm install -g grunt-cli
git clone https://github.com/kalabox/kalabox-ui.git
```

**On Fedora**

???

#### 3. Run from source

```
cd /path/to/kalabox-ui
npm install
grunt build
```

The `grunt build` command should launch the Kalabox GUI.

If you're making frequent changes, start `grunt watch` from a different
terminal window. Each change you make to a CSS or JS file will update in the
build, although you'll need to manually refresh the Chromium app.

Note that when building from source, you're in "Dev mode". This means that
any apps created will pull from the most up-to-date app versions, not
necessarily the latest stable version.

Submitting Fixes
----------------

Perform all of your work in a forked branch of kalabox-ui, named in the
convention [issue number]-some-short-desc.

Once you've satisfied all of the criteria on a given issue from the main
kalabox/kalabox issue queue (including documentation additions and writing 
tests), submit a pull request.

Please always reference the main Kalabox issue in your commit messages and pull 
requests using the kalabox/kalabox#[issue number] syntax.

Testing
-------

We have end-to-end functional tests written in Protractor for kalabox-ui.

#### Running Tests

Run all the tests via:

`grunt e2e`

This task should automatically configure your system to run the Protractor 
tests.

#### Writing Tests

Tests are included in the "e2e" folders found in each module. For example,
all the tests for the dashboard are found in "src/modules/dashboard/e2e".

Looking at existing tests will give you a good idea of how to write your own,
but if you're looking for more tips, we recommend:

- [Protractor test writing tutorials](http://angular.github.io/protractor/#/tutorial)
- [Protractor API reference](http://angular.github.io/protractor/#/api)

Note that, since we've done most of the heavy lifting in the "protractor-setup"
grunt task, you shouldn't have to setup webdriver or perform any of the other
setup tasks in the tutorial.
