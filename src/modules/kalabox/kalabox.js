'use strict';

angular.module('kalabox', [
  'templates-app',
  'kalabox.nodewrappers',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'kalabox.installedSites',
  'ui.bootstrap',
  'mwl.bluebird'
])
// Override the default global error handler.
/* jshint ignore:start */
.factory('$exceptionHandler', function($window) {
  return function(exception) {
    if(exception.message.match(/transition (superseded|prevented|aborted|failed)/)) {
      return;
    }
    var err = exception;
    var stack = (function() {
      if (err.jse_cause && err.jse_cause.stack) {
        return err.jse_cause.stack;
      } else {
        return err.stack;
      }
    }());
    console.log(err.message);
    console.log(stack);
  };
})
/* jshint ignore:end */
// Global error handing.
.run(function($q, $exceptionHandler) {
  // Global function for handling errors from bluebird promises.
  $q.onPossiblyUnhandledRejection($exceptionHandler);
})
.value('version', '2.0');
