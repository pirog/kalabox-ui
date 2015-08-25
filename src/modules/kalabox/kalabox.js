'use strict';

angular.module('kalabox', [
  'ngRoute',
  'kalabox.boot2docker',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'kalabox.nodewrappers',
  'kalabox.virtualbox',
  'ui.bootstrap',
  'mwl.bluebird'
])
// Global error handing.
.run(function($q, $window) {
  // Global function for handling errors.
  function handleErrors(err) {
    $window.alert(err.message + '\n' + err.stack);
    console.log(err.message);
    console.log(err.stack);
  }
  // Global function for handling errors from bluebird promises.
  $q.onPossiblyUnhandledRejection(handleErrors);
})
.config(function ($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/initialize'
  });
})
.value('version', '2.0');
