'use strict';

angular.module('kalabox.initialize', [
  'ui.router',
  'kalabox.nodewrappers'
])
.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider.state('initialize', {
    url: '/initialize',
    templateUrl: 'modules/initialize/initialize.html.tmpl',
    controller: 'InitializeCtrl'
  });
  $urlRouterProvider.otherwise('/initialize');
})
.controller('InitializeCtrl',
['$scope', '$state', 'kbox', 'globalConfig', '$window',
  function($scope, $state, kbox, globalConfig, $window) {

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
        // Bring engine up then navigate to dashboard.
        return kbox.then(function(kbox) {
          return kbox.engine.up()
					.wrap('Error starting kalabox.');
        })
				// Handle errors.
				.catch(function(err) {
					$window.alert(err.message);
				})
				// Navigate to dashboard.
				.then(function() {
					$state.go('dashboard');
				});
      } else {
        // Navigate to start.
        $state.go('start');
      }
    });

  }]);
