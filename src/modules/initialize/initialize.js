'use strict';

angular.module('kalabox.initialize', [
  'ui.router',
  'kalabox.nodewrappers'
])
.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider.state('initialize', {
    url: '/initialize',
    templateUrl: 'modules/initialize/initialize.html',
    controller: 'InitializeCtrl'
  });
  $urlRouterProvider.otherwise('/initialize');
})
.controller('InitializeCtrl',
['$scope', '$state', 'globalConfig',
  function($scope, $state, globalConfig) {

    var gui = require('nw.gui');
    var mb = new gui.Menu({type: 'menubar'});
    if (process.platform === 'darwin') {
      mb.createMacBuiltin('Kalabox', {hideEdit: true, hideWindow: true});
    }
    gui.Window.get().menu = mb;

    // Best practices is to manage our data in a scope object
    $scope.ui = {
      messageText: 'initializing...'
    };

    // Decide on next location.
    globalConfig.then(function(globalConfig) {
      if (globalConfig.provisioned) {
        $state.go('dashboard');
      } else {
        $state.go('start');
      }
    });

  }]);
