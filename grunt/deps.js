'use strict';

/**
 * This file/module contains helpful download config.
 */

// Node modules
var path = require('path');

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

// get actual conf
var engine = yaml.toJson(engineConf);
var syncthing = yaml.toJson(syncthingConf);

module.exports = {

  /*
   * Download admin deps to package with GUI
   */
  // jscs:disable
  downloads: {
    osx64Deps: {
      src: [
        engine.virtualbox.pkg.darwin,
        engine.machine.pkg.darwin,
        engine.compose.pkg.darwin,
        syncthing.pkg.darwin,
        syncthing.configfile
      ],
      dest: './deps/osx64'
    },
    win64Deps: {
      src: [
        engine.virtualbox.pkg.win32,
        engine.machine.pkg.win32,
        engine.compose.pkg.win32,
        engine.msysgit.pkg.win32,
        syncthing.pkg.win32,
        syncthing.configfile
      ],
      dest: './deps/win64'
    },
    linux64Deps: {
      src: [
        engine.machine.pkg.linux,
        engine.compose.pkg.linux,
        syncthing.pkg.linux,
        syncthing.configfile
      ],
      dest: './deps/linux64'
    },

    /*
     * Downlaod the iso image for our kalabox VM
     * @todo: get this from Kalabox as well
     */
    iso: {
      src: [
        'https://github.com/kalabox/kalabox-iso/releases/download/v0.11.0/boot2docker.iso'
      ],
      dest: './deps/iso'
    }
  },
  // jscs:enable

  /**
   * Clean out the build dirs
   */
  clean: {
    deps: [
      './deps',
    ]
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
  }
};
