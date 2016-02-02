'use strict';

angular.module('kalabox.initialize', [
  'ui.router',
  'kalabox.nodewrappers',
  'kalabox.misc'
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
['$scope', '$state', 'kbox', 'globalConfig',
  function($scope, $state, kbox, globalConfig) {

    var gui = require('nw.gui');
    var mb = new gui.Menu({type: 'menubar'});
    if (process.platform === 'darwin') {
      mb.createMacBuiltin('Kalabox', {hideEdit: false, hideWindow: true});
    }
    gui.Window.get().menu = mb;

    // Decide on next location.
    globalConfig.then(function(globalConfig) {
      if (globalConfig.provisioned) {
        // Bring engine up then navigate to dashboard.
        return kbox.then(function(kbox) {
          return kbox.engine.up()
          .then(function() {
            $state.go('dashboard');
          });
        });
      } else {
        // Navigate to start.
        $state.go('start');
      }
    });

  }]);
