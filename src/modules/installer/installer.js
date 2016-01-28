'use strict';

angular.module('kalabox.installer', [
  'ui.router',
  'kalabox.nodewrappers'
])
.config(function($stateProvider) {
  $stateProvider
    .state('start', {
      url: '/start',
      templateUrl: 'modules/installer/start.html',
    })
    .state('installer', {
      url: '/installer',
      templateUrl: 'modules/installer/installer.html',
      controller: 'InstallerCtrl'
    });
})
.directive('startInstall', function($location) {
  return {
    scope: false,
    link: function(scope, element) {
      element.on('click', function() {
        // @todo: start install and move to installer screen.
        // kbox.install.start();
        scope.$apply(function() {
          $location.path('/installer');
        });
      });
    }
  };
})
.controller('InstallerCtrl',
['$scope', '$q', '$location', 'kbox',
  function($scope, $q, $location, kbox) {

    // Init ui model.
    $scope.ui = {
      title: '',
      detail: '',
      stepProgress: 0
    };

    // Wait on the init of the kalabox core library.
    return kbox.then(function(kbox) {

      // Start a new promise.
      return new Promise(function(resolve, reject) {

        // Event called before a step runs.
        kbox.install.events.on('pre-step', function(ctx) {
          $scope.ui.title = ctx.step.description;
          $scope.ui.detail =
            ctx.step.name + ' ' +
            ctx.state.stepIndex + ' of ' +
            ctx.state.stepCount;
          $scope.ui.stepProgress =
            (ctx.state.stepIndex / ctx.state.stepCount) * 100;
          ctx.state.stepIndex += 1;
          $scope.$apply();
        });

        // Event called after a step is finished running.
        kbox.install.events.on('post-step', function() {

        });

        // OH NO!!!! an error has happened.
        kbox.install.events.on('error', function(err) {
          console.log(err.message + '\n' + err.stack);
          $scope.ui.title = 'ERROR: ' + err.message;
          $scope.$apply();
          reject(err);
        });

        // Event called after provisioning has finished.
        kbox.install.events.on('end', function() {
          $scope.ui.title = 'Done installing!';
          $location.path('/dashboard');
          $scope.$apply();
        });

        // Run provisioning.
        /*
         * @todo: @bcauldwell: add some code to determine if we've already gone
         * through the provision step before.
         */
        Promise.try(function() {
          return kbox.install.run();
        })
        .catch(function(err) {
          reject(err);
        });

      });

    });

  }
]);
