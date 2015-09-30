'use strict';

angular.module('kalabox.nodewrappers', [])
  .factory('exec', [function() {
    return require('child_process').exec;
  }])
  .factory('fs', [function() {
    return require('fs');
  }])
  .factory('http', [function() {
    return require('http');
  }])
  .factory('kbox', function($q) {
    // Lazy load a fully initialized kbox core library.
    var kbox = require('kalabox');
    return $q.try(function() {
      return kbox.init('gui');
    })
    .then(function() {
      return kbox;
    });
  })
  .factory('globalConfig', function(kbox) {
    return kbox.then(function(kbox) {
      return kbox.core.deps.get('globalConfig');
    });
  })
  .factory('moment', function() {
    return require('moment');
  })
  .factory('os', [function() {
    return require('os');
  }])
  /*
   * Cross platform access to an open terminal window.
   */
  .factory('terminal', function() {
    var spawn = require('child_process').spawn;
    /*
     * Open a terminal window for a specified directory.
     */
    function open(dir) {
      if (process.platform === 'darwin') {
        /*
         * There should be separate behavior here for when iTerm is the
         * default terminal, but that will also require extra osascript
         * coding.
         */
        //var terminal = process.env.TERM_PROGRAM || 'terminal';
        var terminal = 'terminal';
        spawn('osascript', [
          '-e', 'tell application "' + terminal + '"',
          '-e', 'do script "cd ' + dir  + ' && clear"',
          '-e', 'tell application "' + terminal + '" to activate',
          '-e', 'end tell'
        ]);
      } else {
        throw new Error('Opening code in terminal not supported on this OS.');
      }
    }
    return {
      open: open
    };
  })
  .factory('_', function() {
    return require('lodash');
  });
