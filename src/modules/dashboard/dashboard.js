'use strict';

angular.module('kalabox.dashboard', [
  'kalabox.nodewrappers'])
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
        return kbox.then(function(kbox) {
          return kbox.engine.up(3);
        })
        .then(function() {
          $window.alert('Engine is up!');
        });
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
        return kbox.then(function(kbox) {
          return kbox.engine.down(3)
          .then(function() {
            $window.alert('Engine is down!');
          });
        });
      });
    }
  };
})
// @todo: only for demoing and dev, remove.
.controller('DashboardCtrl1',
function ($scope) {
  $scope.sites = [
    {
      'name': 'Greenbiz',
      'image': 'http://placehold.it/250x200',
      'link': 'https://www.youtube.com/watch?v=hhJg1finpyU',
      'up': true,
      'provider': 'pantheon',
      'framework': 'drupal'
    },
    {
      'name': 'Computerized Structures Inc.',
      'image': 'http://placehold.it/250x200',
      'link': 'https://www.youtube.com/watch?v=hhJg1finpyU',
      'up': false,
      'provider': 'pantheon',
      'framework': 'drupal'
    },
    {
      'name': 'CITC',
      'image': 'http://placehold.it/250x200',
      'link':'https://www.youtube.com/watch?v=hhJg1finpyU',
      'up': false,
      'provider': 'pantheon',
      'framework': 'drupal'
    }
  ];
})
.controller('DashboardCtrl',
function ($scope, $window, $timeout, $interval, $q, kbox) {

  /*
   * Number of milliseconds between pollings.
   */
  var LOOP_INTERVAL = 2 * 1000;

  //Init ui model.
  $scope.ui = {
    messageText: 'Kalabox dashboard module.',
    engineStatus: '',
    detail: ''
  };

  // Poll engine status.
  function pollEngineStatus() {
    return kbox.then(function(kbox) {
      return kbox.engine.isUp()
      .then(function(isUp) {
        $scope.ui.engineStatus = isUp ? 'up' : 'down';
      });
    });
  }

  // Poll all.
  function pollAll() {
    return $q.all([
      pollEngineStatus()
    ]);
  }

  // Interval loop.
  var loop = $interval(function() {
    return pollAll()
    .then(function() {
      return $timeout(function() {
        $scope.$apply();
      });
    });
  }, LOOP_INTERVAL);

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
