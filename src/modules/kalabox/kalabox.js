'use strict';

angular.module('kalabox', [
  'ngRoute',
  'kalabox.nodewrappers',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'kalabox.installedSites',
  'ui.bootstrap',
  'mwl.bluebird'
])
// Override the default global error handler.
.factory('$exceptionHandler', function($window) {
  return function(exception) {
    var err = exception;
    $window.alert(err.message + '\n' + err.stack);
    console.log(err.message);
    console.log(err.stack);
  };
})
// Global error handing.
.run(function($q, $window, $exceptionHandler) {
  // Global function for handling errors from bluebird promises.
  $q.onPossiblyUnhandledRejection($exceptionHandler);
})
/*
 * Service to handling a list of polling functions at regular intervals
 * and for stopping and waiting on the polling.
 */
.factory('pollingService', function($q) {

  // Flag to tell polling when to stop.
  var stopFlag = false;

  // Singleton array of polling functions.
  var funcs = [];

  // Promise to wait for completion of polling.
  var wait = $q.defer();

  // Add a polling function.
  function add(func) {
    funcs.push(func);
  }

  // Loop through each polling function, delay for an interval, then repeat
  // until the stop flag has been set to true.
  function loop(interval) {
    if (!stopFlag) {
      // Execute each polling function in parallel.
      return $q.map(funcs, function(func) {
        return func();
      })
      // Delay for one interval.
      .delay(interval)
      // Repeat.
      .then(function() {
        return loop(interval);
      });
    } else {
      // Stop flag has been set, signal polling is done.
      wait.resolve();
    }
  }

  // Start polling.
  function start(interval) {
    interval = interval || 5 * 1000;
    return loop(interval);
  }

  // Set stop flag and wait for current polling to finish.
  function stop() {
    stopFlag = true;
    return wait;
  }

  return {
    add: add,
    start: start,
    stop: stop,
    stopFlag: stopFlag,
    wait: wait
  };

})
.run(function(kbox, pollingService) {
  // Hook into the gui window closing event.
  var gui = require('nw.gui');
  var win = gui.Window.get();
  win.on('close', function() {
    var self = this;
    // Stop the polling service.
    return pollingService.stop()
    // Shutdown the engine.
    .then(function() {
      return kbox.then(function(kbox) {
        return kbox.engine.down();
      });
    })
    // Force close the window.
    .finally(function() {
      self.close(true);
    });
  });
})
.config(function ($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/initialize'
  });
})
.value('version', '2.0');
