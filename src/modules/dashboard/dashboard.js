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
function ($scope, $window, $timeout, $interval, $q, kbox,
  installedSitesService, pollingService) {

  //Init ui model.
  $scope.ui = {
    messageText: 'Kalabox dashboard module.',
    engineStatus: '',
    apps: '',
    detail: ''
  };

  // Poll engine status.
  pollingService.add(function() {
    return kbox.then(function(kbox) {
      return kbox.engine.isUp()
      .then(function(isUp) {
        $scope.ui.engineStatus = isUp ? 'up' : 'down';
      });
    });
  });

  // Poll installed sites.
  pollingService.add(function() {
    return installedSitesService.sites()
    .then(function(sites) {
      $scope.ui.apps = JSON.stringify(sites, null, '  ');
    });
  });

  // Start polling.
  return pollingService.start()
  // Wait for polling to be shutdown.
  .then(function() {
    return pollingService.wait();
  });

});
