'use strict';

angular.module('kalabox', [
  'ngRoute',
  'kalabox.nodewrappers',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'ui.bootstrap',
  'mwl.bluebird'
])
// Override the default global error handler.
.factory('$exceptionHandler', function($window) {
  return function(exception, cause) {
    console.log('cause -> ' + cause);
    var err = exception;
    $window.alert(err.message + '\n' + err.stack);
    console.log(err.message);
    console.log(err.stack);
  };
})
// Global error handing.
.run(function($q, $window, $exceptionHandler) {
  // Global function for handling errors from bluebird promises.
  $q.onPossiblyUnhandledRejection($exceptionHandler);
})
.config(function ($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/initialize'
  });
})
.value('version', '2.0');
