'use strict';

angular.module('kalabox', [
  'ngRoute',
  'kalabox.boot2docker',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'kalabox.nodewrappers',
  'kalabox.virtualbox',
  'ui.bootstrap'
])
.config(function ($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/initialize'
  });
})
.value('version', '2.0');
