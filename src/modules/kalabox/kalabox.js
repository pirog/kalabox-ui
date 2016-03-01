'use strict';

angular.module('kalabox', [
  'templates-app',
  'kalabox.nodewrappers',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'kalabox.sites',
  'kalabox.misc',
  'ui.bootstrap',
  'mwl.bluebird'
])
.controller('AppController',
  function($scope, $window) {
  var vm = this;
  vm.bodyClasses = 'default';

  // this'll be called on every state change in the app
  $scope.$on('$stateChangeSuccess', function(event, toState) {
    if (angular.isDefined(toState.name)) {
      vm.bodyClasses = toState.name.replace(/\./g, '-');
      return;
    }
    vm.bodyClasses = 'default';
  });
  $window.addEventListener('keydown', function(event) {
    if (event.keyIdentifier === 'F12') {
      require('nw.gui').Window.get().showDevTools();
    }
  });
})
.run(function(kbox) {
  kbox.then(function(kbox) {
    kbox.core.log.on('warn', function(message) {
      // @todo: handle warnings here.
    });
  });
})
// Override the default global error handler.
.factory('$exceptionHandler', function() {
  return function(exception) {
    if (exception.message.match(/transition (superseded|prevented|aborted|failed)/)) {
      return;
    }
    var err = exception;

    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var stack = (function() {
      if (err.jse_cause && err.jse_cause.stack) {
        return err.jse_cause.stack;
      } else {
        return err.stack;
      }
    }());
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

    console.log(err.message);
    console.log(stack);
  };
})
// Global error handing.
.run(function($q, $exceptionHandler) {
  // Global function for handling errors from bluebird promises.
  $q.onPossiblyUnhandledRejection($exceptionHandler);
})
.value('version', '2.0');
