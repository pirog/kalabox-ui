'use strict';

angular.module('kalabox.installer', [
  'ngRoute'
])
.config(function ($routeProvider) {
  $routeProvider.when('/installer', {
    templateUrl: 'modules/installer/installer.html',
    controller: 'InstallerCtrl'
  });
  $routeProvider.when('/start', {
    templateUrl: 'modules/installer/start.html',
  });
})
.controller('InstallerCtrl', ['$scope', function ($scope) {
  // @todo: Should listen for events emitted by Kalabox and change stage of
  // the $scope.ui object to feed variables to installer.html.
  $scope.ui = {
    title: 'Checking Prerequisites',
    detail: 'Testing Firewall',
    stepProgress: '10%'
  };
}])
.directive('startInstall', function($location) {
  return {
    scope: false,
    link: function(scope, element) {
      element.on('click', function(){
        // @todo: start install and move to installer screen.
        // kbox.install.start();
        scope.$apply(function() {
          $location.path('/installer');
        });
      });
    }
  };
});
