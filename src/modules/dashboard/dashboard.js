'use strict';

angular.module('kalabox.dashboard', [])
.config(function ($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'modules/dashboard/dashboard.html',
    controller: 'DashboardCtrl'
  });
})
// Handle kbox up directive.
.directive('kboxUp', function($window, $q, kbox) {
  return {
    scope: false,
    link: function($scope, element) {
      element.on('click', function() {
        var deferred = $q.defer();
        kbox.engine.up(3, function(err) {
          if (err) {
            deferred.reject(err);
          } else {
            $window.alert('UP!');
            deferred.resolve();
          }
        });
        return deferred;
      });
    }
  };
})
// Handle kbox down directive.
.directive('kboxDown', function($window, $q, kbox) {
  return {
    scope: false,
    link: function($scope, element) {
      element.on('click', function() {
        var deferred = $q.defer();
        kbox.engine.down(3, function(err) {
          if (err) {
            deferred.reject(err);
          } else {
            $window.alert('DOWN!');
            deferred.resolve();
          }
        });
        return deferred;
      });
    }
  };
})
.controller('DashboardCtrl',
function ($scope, $window, $timeout, $interval, $q, kbox) {

  //Init ui model.
  $scope.ui = {
    messageText: 'Kalabox dashboard module.',
    engineStatus: '',
    detail: ''
  };

  // Poll engine status.
  function pollEngineStatus() {
    var deferred = $q.defer();
    kbox.engine.isUp(function(err, isUp) {
      if (err) {
        deferred.reject(err);
      } else {
        $scope.ui.engineStatus = isUp ? 'up' : 'down';
        deferred.resolve();
      }
    });
    return deferred;
  }

  // Poll all.
  function pollAll() {
    return $q.all([
      pollEngineStatus()
    ])
    .catch(function(err) {
      $window.alert(err.message);
    });
  }

  // Interval loop.
  var loop = $interval(function() {
    return pollAll()
    .then(function() {
      return $timeout(function() {
        $scope.$apply();
      });
    });
  }, 5 * 1000);

  // Make sure to stop interval loop.
  var gui = require('nw.gui');
  var win = gui.Window.get();
  win.on('close', function() {
    // Cancel interval loop.
    $interval.cancel(loop);
    // Close window.
    this.close(true);
  });

  return loop;

});
