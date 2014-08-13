'use strict';

angular.module('kalabox.installer', [])
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
  .controller('InstallerCtrl', function ($scope) {
    $scope.ui = {
      title: 'Checking Prerequisites',
      detail: 'Testing Firewall',
      stepProgress: 5
    };
  })
  .controller('InstallerDownloadCtrl', function ($scope) {
    $scope.ui = {
      title: 'Downloading Files',
      detail: '',
      stepProgress: 5
    };
  })
  .controller('InstallerVBoxCtrl', function ($scope) {
    $scope.ui = {
      title: 'Installing VirtualBox',
      detail: '',
      stepProgress: 5
    };
  })
  .controller('InstallerDockerCtrl', function ($scope) {
    $scope.ui = {
      title: 'Installing Docker',
      detail: '',
      stepProgress: 5
    };
  });
