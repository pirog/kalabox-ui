'use strict';

angular.module('kalabox.installer', [
  'ui.router',
  'kalabox.nodewrappers',
  'kalabox.misc'
])
.config(function($stateProvider) {
  $stateProvider
    .state('start', {
      url: '/start',
      templateUrl: 'modules/installer/start.html.tmpl',
    })
    .state('installer', {
      url: '/installer',
      templateUrl: 'modules/installer/installer.html.tmpl',
      controller: 'InstallerCtrl'
    });
})
.directive('startInstall', function($location) {
  return {
    scope: false,
    link: function(scope, element) {
      element.on('click', function() {
        scope.$apply(function() {
          $location.path('/installer');
        });
      });
    }
  };
})
.controller('InstallerCtrl',
['$scope', '$q', '$location', 'kbox', '$window', '$timeout',
  function($scope, $q, $location, kbox, $window, $timeout) {

    // Init ui model.
    $scope.ui = {
      title: '',
      detail: '',
      stepProgress: 0
    };

    // Wait on the init of the kalabox core library.
    return kbox.then(function(kbox) {

      return Promise.try(function() {

        // Update title when we get a kbox update event.
        kbox.status.on('update', function(data) {
          $timeout(function() {
            $scope.ui.title = data.message;
          }, 0);
        });

        // Event called before a step runs.
        kbox.install.events.on('pre-step', function(ctx) {
          $timeout(function() {
            // Update status message with step's description.
            kbox.status.update(ctx.step.description);
            $scope.ui.detail =
              ctx.step.name + ' ' +
              ctx.state.stepIndex + ' of ' +
              ctx.state.stepCount;
            $scope.ui.stepProgress =
              (ctx.state.stepIndex / ctx.state.stepCount) * 100;
            ctx.state.stepIndex += 1;
          }, 0);
        });

        // Run provisioning.
        return Promise.try(function() {
          return kbox.install.run();
        });

      })
      // Install is done, navigate to dashboard.
      .then(function() {
        $timeout(function() {
          $scope.ui.title = 'Done installing!';
          $location.path('/dashboard');
        }, 0);
      })
      // Handle errors.
      .catch(function(err) {
        kbox.metrics.reportError(err);
        $window.alert(err.message);
      });

    });

  }
]);
