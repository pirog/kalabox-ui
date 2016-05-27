Contributing to the Kalabox GUI
===============================

Creating Issues
---------------

**ALL ISSUES** for the Kalabox should be created on the main Kalabox
project page: https://github.com/kalabox/kalabox/issues

Once you create an issue please follow the guidelines that are posted as the
first comment on your.

Issue tags
----------

Here is a list of the tags we use on our issues and what each means.

#### Issue tags

* **bug fix** - The issue indicates a buggy feature that needs to be fixed.
* **duplicate** - The issue is expressed already elsewhere.
* **enhancement** - The issue wishes to improve a pre-existing feature.
* **feature** - The issue contains new proposed functionality.
* **task** - The issue is a non-development related task such as documentation.

#### Kalabox tags

* **cli** - The issue manifested using the cli.
* **gui** - The issue manifested using the gui.
* **installer** - The issue manifested using the installer.

#### Additional tags

* **sprint ready** - The issue is in a good state for action.
* **blocker** - The issue is currently blocking the completion of other issues.
* **Epic** - The issue acts as a container for other issues.

Epic Guidelines
---------------

An issue should be expressed as an epic if it satisfies the following two
critera

1. A feature which is best expressed as more than one issue.
2. Each sub-issue is shippable by itself.

Contributing to other Kalabox projects
--------------------------------------

The rest of this guide is dedicated to working on the installer portion of
Kalabox. If you are actually interesting in working on other Kalabox projects
please check out their respective CONTRIBUTION.mds.

* [kalabox](https://github.com/kalabox/kalabox/blob/HEAD/CONTRIBUTING.md)
* [kalabox-cli](https://github.com/kalabox/kalabox-cli/blob/HEAD/CONTRIBUTING.md)
* [kalabox-app-php](https://github.com/kalabox/kalabox-app-php/blob/HEAD/CONTRIBUTING.md)
* [kalabox-app-pantheon](https://github.com/kalabox/kalabox-app-pantheon/blob/HEAD/CONTRIBUTING.md)

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

If you're testing locally and only want to run one test, you can run Protractor
directly from the root of the kalabox-ui project:

`protractor --specs='src/modules/yourmodule/e2e/yourmodule.spec.js' --grep="name of your it() statement"`

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
