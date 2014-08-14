'use strict';

angular.module('kalabox.installer', [
  'ngRoute'
])
.config(function ($routeProvider) {
  $routeProvider.when('/installer', {
    templateUrl: 'modules/installer/installer.html',
    controller: 'InstallerCtrl'
  });
  $routeProvider.when('/installer/download', {
    templateUrl: 'modules/installer/installer.html',
    controller: 'InstallerDownloadCtrl'
  });
  $routeProvider.when('/installer/vbox', {
    templateUrl: 'modules/installer/installer.html',
    controller: 'InstallerVBoxCtrl'
  });
  $routeProvider.when('/installer/docker', {
    templateUrl: 'modules/installer/installer.html',
    controller: 'InstallerDockerCtrl'
  });
})
.controller('InstallerCtrl', ['$scope', function ($scope) {
  $scope.ui = {
    title: 'Checking Prerequisites',
    detail: 'Testing Firewall',
    stepProgress: 5
  };
}])
.controller('InstallerDownloadCtrl', ['$scope', function ($scope) {
  $scope.ui = {
    title: 'Downloading Files',
    detail: '',
    stepProgress: 5
  };
}])
.controller('InstallerVBoxCtrl', ['$scope', function ($scope) {
  $scope.ui = {
    title: 'Installing VirtualBox',
    detail: '',
    stepProgress: 5
  };
}])
.controller('InstallerDockerCtrl', function ($scope) {
  $scope.ui = {
    title: 'Installing Docker',
    detail: '',
    stepProgress: 5
  };
});
