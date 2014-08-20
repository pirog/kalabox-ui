'use strict';

angular.module('kalabox.initialize', [])
  .config(function ($routeProvider) {
    $routeProvider.when('/initialize', {
      templateUrl: 'modules/initialize/initialize.html',
      controller: 'InitializeCtrl'
    });
  })
  .controller('InitializeCtrl',
  ['$scope', '$location', '_', 'VirtualBox', 'Boot2Docker',
    function ($scope, $location, _, VirtualBox, Boot2Docker) {
      // Best practices is to manage our data in a scope object
      $scope.ui = {};

      // Setup the dependency array
      $scope.ui.dependencies = [
        {
          key: 'virtualbox',
          name: 'VirtualBox',
          status: '',
          version: '',
          pass: false
        },
        {
          key: 'boot2docker',
          name: 'Boot2Docker',
          status: '',
          version: '',
          pass: false
        }
      ];

      // reduce callback, returns false if any deps failed
      var passFail = function(result, dependency) {
        return !(!result || !dependency.pass);
      };

      // Check VirtualBox
      $scope.ui.messageText = 'Checking VirtualBox';
      VirtualBox.getVersion()
      .then(function(version) {

        if (version !== false) {
          $scope.ui.messageText = 'VirtualBox OK';
          $scope.ui.dependencies[0].pass = true;
          $scope.ui.dependencies[0].status = 'OK';
          $scope.ui.dependencies[0].version = version;
        }
        else {
          $scope.ui.messageText = 'VirtualBox Failed';
          $scope.ui.dependencies[0].status = 'Failed';
          $scope.ui.dependencies[0].version = 'N/A';
        }
      })
      // Check Boot2Docker
      .then(function() {
        $scope.ui.messageText = 'Checking Boot2Docker';
        Boot2Docker.getVersion()
          .then(function(version) {

            if (version !== false) {
              $scope.ui.messageText = 'Boot2Docker OK';
              $scope.ui.dependencies[1].status = 'OK';
              $scope.ui.dependencies[1].pass = true;
              $scope.ui.dependencies[1].version = version;
            }
            else {
              $scope.ui.messageText = 'Boot2Docker Failed';
              $scope.ui.dependencies[1].status = 'Failed';
              $scope.ui.dependencies[1].version = 'N/A';
            }

            // Set value if all dependencies passed
            var allPassed = _.reduce($scope.ui.dependencies, passFail, true);
            if (allPassed) {
              $scope.ui.messageText = 'Dependencies OK';
              //$location.path( "/dashboard" );
            }
            else {
              $scope.ui.messageText = 'Dependencies Failed';
              //$location.path( "/installer" );
            }
          });
      });
    }]);
