'use strict';

angular.module('kalabox.installer', [
  'ngRoute',
  'kalabox.nodewrappers'
])
.config(function ($routeProvider) {
  $routeProvider.when('/installer', {
    templateUrl: 'modules/installer/installer.html',
    controller: 'InstallerCtrl'
  });
})
.controller('InstallerCtrl',
['$scope', '$q', '$location', 'kbox',
function ($scope, $q, $location, kbox) {

  // Init ui model.
  $scope.ui = {
    title: '',
    detail: '',
    stepProgress: 0
  };

  // Create promise;
  var deferred = $q.defer();

  // Build initial state.
  var state = {
    disksize: 5 * 1000,
    password: true,
    nonInteractive: true,
    adminCommands: [],
    config: kbox.core.deps.get('config'),
    downloads: [],
    containers: [],
    log: kbox.core.log,
    stepIndex: 0,
    status: true
  };

  // Event called before a step runs.
  kbox.install.events.on('pre-step', function(step) {
    $scope.ui.title = step.description;
    $scope.ui.detail = step.name;
  });

  // Event called after a step is finished running.
  kbox.install.events.on('post-step', function() {
    state.stepIndex += 1;
    $scope.ui.stepProgress = state.stepIndex * (100 / state.stepCount);
    $scope.$apply();
  });

  // OH NO!!!! an error has happened. :(
  kbox.install.events.on('error', function(err) {
    console.log(err.message + '\n' + err.stack);
    $scope.ui.title = 'ERROR: ' + err.message;
    deferred.reject(err);
    $scope.$apply();
  });

  // Event called after provisioning has finished.
  kbox.install.events.on('end', function() {
    $scope.ui.title = 'Done installing!';
    $location.path('/dashboard');
    deferred.resolve();
    $scope.$apply();
  });

  // Run provisioning.
  kbox.install.run(state);

  // Return promise.
  return deferred.promise;

}]);
