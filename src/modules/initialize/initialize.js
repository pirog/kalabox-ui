'use strict';

angular.module('kalabox.initialize', [
    'ngRoute',
    'kalabox.nodewrappers' 
  ])
  .config(function ($routeProvider) {
    $routeProvider.when('/initialize', {
      templateUrl: 'modules/initialize/initialize.html',
      controller: 'InitializeCtrl'
    });
  })
  .controller('InitializeCtrl',
  ['$scope', '$location', '_', 'pconfig', 'VirtualBox', 'Boot2Docker',
    '$q', 'kbox',
    function ($scope, $location, _, pconfig, VirtualBox, Boot2Docker,
    $q, kbox) {

      var gui = require('nw.gui');
      var mb = new gui.Menu({type: 'menubar'});
      if (pconfig.platform === 'darwin') {
        mb.createMacBuiltin('Kalabox', {hideEdit: true, hideWindow: true});
      }
      gui.Window.get().menu = mb;

      // Best practices is to manage our data in a scope object
      $scope.ui = {
        messageText: 'initializing...'
      };

      // Create promise.
      var deferred = $q.defer();

      // Initialize kbox.
      kbox.init(function(err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();    
        }
      });

      // Resolve promise.
      return deferred.promise.then(function() {
        $scope.ui.messageText = 'initialized';
        $location.path('/dashboard');
        //$location.path('/installer');
      })
      .catch(function(err) {
        $scope.ui.messageText = err.message + '\n' + err.stack;
      });

    }]);
