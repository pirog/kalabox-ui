## Introduction

Kalabox is a free, integrated workflow solution for [Drupal](http://drupal.org) (and eventually all PHP developers). It’s the thing that connects all your things -- including your hosting account -- to provide a complete desktop-to-live workflow loop. First developed by [Kalamuna](http://www.kalamuna.com) as an internal tool, people all over the world now use it to code, test and go live faster than ever. Kalabox is a [node-webkit](https://github.com/rogerwang/node-webkit) app for MacOSX, Windows and Linux.

## New Features

**Use Your Tools, Faster**

Based on [Docker](http://docker.io) so devs with custom virtual environments can easily adapt their tools to Kalabox. Deploy your tools to everyone and enjoy the blazing-fast performance, configurability and portability of containers!

**Cross Platform**

Now works on Linux and Windows!

**More Hosting Solutions**

Support for Acquia, DigitalOcean, Azure and others!

**Contribute to the Future of Drupal**

Let’s help the Drupal community converge on a common, open-source, integrated workflow solution for Drupal that can sustain itself.

**Use it, Free**

Get advanced dev tools for yourself -- and help others get them, too -- for free. By supporting the Kalabox 2.0 Kickstarter, you’re helping to put powerful technology in the hands of even more people with great ideas.

## Downloads

We aim for [official releases](https://github.com/kalabox/kalabox/releases) every two weeks, automatically packaged and ready to go but if you live on the wild side we roll [development releases](http://builds.kalabox.me/index.html) for every code commit.

## Quick Start for Developers

Kalabox is built on a [myriad of open source technologies](https://github.com/kalabox/kalabox/wiki/Contributing-to-Kalabox#the-vision-and-rough-v2-architecture) and seeks to
empower developers both novice and elite. For a complete rundown of the goals, underlying technology, development workflows and magic check out the [Contrib Guide](https://github.com/kalabox/kalabox/wiki/Contributing-to-Kalabox)

### Installing dependencies

In order to get started you will need to install the underlying dependencies required.

**On MacOSX**

If you don't have homebrew already installed go [here](http://brew.sh/) or run `ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"`. Then in a terminal:

```
cd $HOME
brew install node
npm install -g grunt-cli bower
```

**On Windows**

You will want to start by downloading and installing [git for windows](http://git-scm.com/download/win) and  then [NodeJS](http://nodejs.org/download/) and then running the following things using the `git bash` shell.

```
cd $HOME
mkdir AppData/Roaming/npm #*
npm install -g grunt-cli bower
```
*http://stackoverflow.com/questions/25093276/nodejs-windows-error-enoent-stat-c-users-rt-appdata-roaming-npm

**On Debian**

From a terminal

```
cd $HOME
sudo apt-get update
sudo apt-get install nodejs
npm config set prefix ~/npm
echo 'export PATH="$PATH:$HOME/npm/bin"' >> ~/.bashrc && source ~/.bashrc
npm install -g grunt-cli bower
```

### Running from source

Windows users will want to run this from a bash shell like `git bash` not `command.exe`.

```
git clone https://github.com/kalabox/kalabox.git $HOME/kalabox
cd $HOME/kalabox
npm install
grunt run
```

If you want to try this with new code just return to `$HOME/kalabox` and run `git pull`. You can also replace $HOME if you have a preferred location for project code. We are using $HOME because it should be cross-OS compatible.

### Building binaries from source

We assume you've downloaded your kalabox source into `$HOME/kalabox`.

```
cd $HOME/kalabox
npm install
grunt build
```

Kalabox binary should be in `$HOME/kalabox/built/(kalabox-linux32-dev.tar.gz|kalabox-linux64-dev.tar.gz|kalabox-osx-dev.tar.gz|kalabox-win-dev.zip)`
If you want to try this with new code just return to` $HOME/kalabox` and run `git pull` and then `grunt build --force`

### Contributing code

Kalabox uses a [github flow variant](https://github.com/kalabox/kalabox/wiki/Contributing-to-Kalabox#github-flow) for code contribution which focues heavily on [testing](https://github.com/kalabox/kalabox/wiki/Contributing-to-Kalabox#emphasis) and continuous integration/deployment. Users will handle version bumping based on these [guidelines](https://github.com/kalabox/kalabox/wiki/Contributing-to-Kalabox#versioning). Generally we try to follow [agile methodologies](https://github.com/kalabox/kalabox/wiki/Contributing-to-Kalabox#issue-prioritization) regarding issue resolution.

An example workflow for contributing code to a particular issue is something like this:

1. Fork the kalabox project through the UI at `https://github.com/kalabox/kalabox`
2. `git clone git@github.com:pirog/kalabox.git $HOME/kalabox`


```
cd $HOME/kalabox
git checkout master
git checkout -b issuenumber-someonesbug
**CODE CHANGES OCCUR**
git add .
git commit -m "#ISSUENUMBER: my fix message"
grunt version
git push origin issuenumber-someonesbug
```


## Community

You can chat with us on IRC in the ##kalabox channel on irc.freenode.net

## License

`kalabox`'s code in this repo uses the MIT license, see our `LICENSE.txt` file.

## Sponsors

The work is being sponsored by:
* [Kalamuna](http://www.kalamuna.com)
* [Pantheon](http://getpantheon.com)
* [Microsoft Azure](http://http://azure.microsoft.com)
