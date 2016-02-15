'use strict';

/**
 * This file/module contains helpful download config.
 */

// Node modules
var path = require('path');
var fs = require('fs');

// NPM modules
var _ = require('lodash');

// Kalabox modzz
var kbox = require('kalabox');
var yaml = kbox.util.yaml;

// Config files that hold our deps
// @todo: can we use srcroot here?
var kboxPath = path.resolve(__dirname, '..', 'node_modules', 'kalabox');

// Get engine conf path
var enginePath = path.join(kboxPath, 'plugins', 'kalabox-engine-docker');
var engineConf = path.join(enginePath, 'provider', 'docker', 'config.yml');

// Get sycnthing conf path
var syncthingPath = path.join(kboxPath, 'plugins', 'kalabox-syncthing');
var syncthingConf = path.join(syncthingPath, 'lib', 'config.yml');

// Get core conf path
var corePath = path.join(kboxPath, 'plugins', 'kalabox-core');
var coreConf = path.join(corePath, 'lib', 'config.yml');

// get actual conf
var engine = yaml.toJson(engineConf);
var syncthing = yaml.toJson(syncthingConf);
var core = yaml.toJson(coreConf);

/*
 * Helper function to get the images we want to export
 */
var getDockerImages = function() {

  // Get the image tag and home directory
  // @todo: we need a way to get this for pantheon images, right now we assume
  // the pantheon image version is the same as the core image version
  var imgVersion = kbox.core.config.getEnvConfig().imgVersion;

  // Images we want to prepackage
  // @todo: figure out a better way to handle this
  return [
    ['kalabox/proxy', imgVersion].join(':'),
    ['kalabox/dns', imgVersion].join(':'),
    ['kalabox/syncthing', imgVersion].join(':'),
    ['kalabox/cli', imgVersion].join(':'),
    ['kalabox/pantheon-solr', imgVersion].join(':'),
    ['kalabox/pantheon-redis', imgVersion].join(':'),
    ['kalabox/terminus', imgVersion].join(':'),
    ['kalabox/pantheon-mariadb', imgVersion].join(':'),
    ['kalabox/pantheon-edge', imgVersion].join(':'),
    ['kalabox/pantheon-appserver', imgVersion].join(':'),
    'busybox'
  ];

};

/*
 * Helper function to get docker-machine bin
 */
var getDockerMachineBin = function() {

  // This is where our docker-machine bin should exist if we've installed
  // kalabox
  var binDir = path.join(kbox.core.config.getEnvConfig().sysConfRoot, 'bin');
  var dockerMachine = path.join(binDir, 'docker-machine');

  // Use the kalabox shipped docker-machine if it exists, else assume
  // it exists in the path
  return (fs.existsSync(dockerMachine)) ? dockerMachine : 'docker-machine';

};

/*
 * Helper function to get docker-machine ssh prefix
 * @todo: for now we assume the created name is "kbox-gui-helper"
 */
var runDockerCmd = function(cmd) {
  return [getDockerMachineBin(), 'ssh', 'kbox-gui-helper', cmd].join(' ');
};

/*
 * Helper function to build pull commands
 * NOTE: we need to do this because docker pull only runs with a single
 * argument
 */
var dockerPull = function(images) {
  return _.map(images, function(image) {
    return runDockerCmd(['docker', 'pull', image].join(' '));
  }).join(' && ');
};

/*
 * Helper function to build export command
 */
var dockerExport = function(images) {
  return runDockerCmd(['docker', 'save', images.join(' ')].join(' '));
};

module.exports = {

  /*
   * Download admin deps to package with GUI
   */
  downloads: {
    osx64Deps: {
      src: [
        engine.virtualbox.pkg.darwin,
        engine.machine.pkg.darwin,
        engine.compose.pkg.darwin,
        //syncthing.pkg.darwin,
        syncthing.configfile,
        core.kalabox.pkg.darwin
      ],
      dest: './deps/osx64'
    },
    win64Deps: {
      src: [
        engine.virtualbox.pkg.win32,
        engine.machine.pkg.win32,
        engine.compose.pkg.win32,
        engine.msysgit.pkg.win32,
        //syncthing.pkg.win32,
        syncthing.configfile,
        core.kalabox.pkg.win32
      ],
      dest: './deps/win64'
    },
    linux64Deps: {
      src: [
        engine.machine.pkg.linux,
        engine.compose.pkg.linux,
        //syncthing.pkg.linux,
        syncthing.configfile,
        core.kalabox.pkg.linux
      ],
      dest: './deps/linux64'
    },

    /*
     * Downlaod the iso image for our kalabox VM
     * @todo: get this from Kalabox as well
     */
    // jscs:disable
    iso: {
      src: [
        'https://github.com/kalabox/kalabox-iso/releases/download/v0.11.0/boot2docker.iso'
      ],
      dest: './deps/iso'
    }
    // jscs:enable
  },

  /**
   * Clean out the build dirs
   */
  clean: {
    all: ['./deps'],
    deps: [
      './deps/osx64',
      './deps/win64',
      './deps/linux64'
    ],
    iso: ['./deps/iso'],
    images: ['./deps/images']
  },

  /**
   * The `copy` task just copies files from A to B. We use it here to copy
   * our project assets (images, fonts, etc.) and javascripts into
   * `build_dir`, and then to copy the assets to `compile_dir`.
   */
  copy: {
    deps: {
      files: [
        {
          src: ['**/*'],
          dest: '<%= buildDir %>/deps/',
          cwd: 'deps/',
          expand: true
        }
     ]
    }
  },

  /*
   * Helpers shell commands
   */
  shell: {

    /*
     * Export images to deps/images/images.tar.gz
     * NOTE: For now we assume the following
     *
     *  1. docker-machine binary exists in PATH or at ~/.kalabox/bin
     *
     */
    exportImages: {
      command: [
        'mkdir -p deps/images',
        'cd deps/images',
        getDockerMachineBin() + ' create -d virtualbox kbox-gui-helper',
        dockerPull(getDockerImages()),
        dockerExport(getDockerImages()) + ' | gzip -9c > images.tar.gz',
        getDockerMachineBin() + ' rm -f kbox-gui-helper'
      ].join(' && ')
    }

  },

};
