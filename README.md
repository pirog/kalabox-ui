## Quick Start for Developers

### Installing dependencies

In order to get started you will need to install the underlying dependencies required.

**On MacOSX**

**On Windows**

Make sure you have installed Node 4.2 and GIT. See https://github.com/kalabox/kalabox-ted/tree/master/scripts/build for some helpful scripts.

You also will need to [install ruby](http://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.0.0-p647-x64.exe)

```
gem install sass
npm install -g grunt-cli
git clone https://github.com/kalabox/kalabox-ui.git
```

**On Debian**

NOTE: You might want to make sure you get npm set up so you can install
global modules without sudo

```
sudo apt-get -y update
sudo apt-get -y install build-essential git-core curl ruby
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get -y install nodejs
sudo gem install sass
npm install -g grunt-cli
git clone https://github.com/kalabox/kalabox-ui.git
```

**On Fedora**


### Running from source


```
cd /path/to/kalabox-ui/source
npm install # need to also pass in --ignore-scripts on windows
grunt build
```

### Building binaries from source

```
cd /path/to/kalabox-ui/source
npm install # need to also pass in --ignore-scripts on windows
grunt pkg
```

Kalabox binary should be in `nw/` and distributables in `dist/`.

## Other Resources

* [API docs](http://api.kalabox.me/)
* [Test coverage reports](http://coverage.kalabox.me/)
* [Kalabox CI dash](http://ci.kalabox.me/)
* [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
* [Boot2Docker](https://github.com/boot2docker/boot2docker)
* [Syncthing](https://github.com/syncthing/syncthing)
* [Docker](https://github.com/docker/docker)

-------------------------------------------------------------------------------------
(C) 2016 Kalabox Inc and friends and things

