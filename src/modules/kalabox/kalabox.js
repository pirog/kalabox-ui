'use strict';

angular.module('kalabox', [
  'ngRoute',
  'kalabox.nodewrappers',
  'kalabox.dashboard',
  'kalabox.installer',
  'ui.bootstrap'
])
.config(function ($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/installer'
  });
});
