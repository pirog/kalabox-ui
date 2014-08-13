'use strict';

angular.module('kalabox.dashboard', [])
  .config(function ($routeProvider) {
    $routeProvider.when('/dashboard', {
      templateUrl: 'modules/dashboard/dashboard.html',
      controller: 'DashboardCtrl'
    });
  })
  .controller('DashboardCtrl', function ($scope) {
    $scope.messageText = 'Kalabox dashboard module.';
  });
