'use strict';

/**
 * This file/module contains helpful util config.
 */

module.exports = {

  /**
   * Increments the version number, etc.
   */
  bump: {
    options: {
      files: [
        'package.json',
        'bower.json'
      ],
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: [
        'package.json',
        'client/bower.json'
      ],
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: false,
      pushTo: 'origin'
    }
  },

  /**
   * The directories to delete when `grunt clean` is executed.
   */
  clean: [
    '<%= buildDir %>',
    '<%= compileDir %>',
    './nw',
    './dist'
  ]

};
