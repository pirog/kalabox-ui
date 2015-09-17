'use strict';

angular.module('kalabox.dashboard', [
  'kalabox.nodewrappers'
])
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
// @todo: this is just for testing.
.directive('siteToggle', function() {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        return $scope.site.toggle();
      });
    }
  };
})
.controller('DashboardCtrl',
function ($scope, $window, $timeout, $interval, $q, kbox,
  installedSitesService, pollingService) {

  //Init ui model.
  $scope.ui = {
    engineStatus: null,
    sites: []
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
      $scope.ui.sites = sites;
    });
  });

  // Start polling.
  return pollingService.start()
  // Wait for polling to be shutdown.
  .then(function() {
    return pollingService.wait();
  });

});
