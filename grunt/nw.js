'use strict';

/**
 * This file/module contains all configuration for nw things
 */

// NPM modules
var _ = require('lodash');
var nw = require('nw');

// Current app version
var version = require('./../package.json').version;

// Version of nw.
var nwVersion = '0.12.3';

// Platforms to expect for the compression
var platforms = ['win64', 'osx64', 'linux64'];

/*
 * Helper function to generate our compress object
 */
var nwCompress = function(platforms) {

  // Start up an empty
  var compress = {};

  // Iterate through our platforms and add to the compress array
  _.forEach(platforms, function(platform) {

    // Our zippy ext is different depending on the platform
    var zippyExt = (_.includes(platform, 'win')) ? '.zip' : '.tar.gz';

    // Build our copress object
    compress[platform] = {
      options: {
        archive: 'dist/kalabox-' + platform + '-' + version + zippyExt
      },
      files: [
        {
          expand: true,
          cwd: 'nw/kalabox/' + platform + '/',
          src: ['**'],
          dest: 'Kalabox/'
        }
      ]
    };

  });

  // And finally return that which is compressed
  return compress;

};

// Return the codes
module.exports = {
  compress: nwCompress(platforms),
  nwjs: {
    options: {
      version: nwVersion,
      platforms: [
        'win64',
        'osx64',
        'linux64'
      ],
      buildDir: 'nw',
    },
    src: [
      './build/*',
      './build/**/*'
    ]
  },
  shell: {
    nw: {
      command: nw.findpath() + ' <%= buildDir %>',
      options: {
        execOptions: {
          maxBuffer: Infinity
        }
      }
    },
    pty: {
      command: [
        'npm install nw-gyp',
        '&&',
        'cd ./node_modules/child_pty/',
        '&&',
        'nw-gyp configure --target=' + nwVersion,
        '&&',
        'nw-gyp build'
      ].join(' ')
    },
    build: {
      command: [
        'cd ./<%= buildDir %>',
        '&&',
        'npm install --production --ignore-scripts'
      ].join(' ')
    }
  },
};
