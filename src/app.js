angular.module('app', [
    'ngRoute',
    'kalabox.nodewrappers',
    'kalabox.dashboard',
    'ui.bootstrap'
    ])
  .config(function ($routeProvider) {
    $routeProvider.otherwise({
      redirectTo: '/dashboard'
    });
  });