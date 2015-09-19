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
.directive('siteToggle', function(jobQueueService, $q, _) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var desc = 'Toggle Site: ' + $scope.site.name;
        jobQueueService.add(desc, function() {
          return $q.try(function() {
            // Inject random errors for testing.
            if (_.random(1, 5) === 1) {
              throw new Error('Oh no a failure happened!');
            }
          })
          .then(function() {
            return $scope.site.toggle();
          });
        });
      });
    }
  };
})
.directive('siteBrowser', function() {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var gui = require('nw.gui');
        gui.Shell.openExternal($scope.site.url);
      });
    }
  };
})
.directive('siteCode', function() {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var gui = require('nw.gui');
        gui.Shell.openItem($scope.site.folder);
      });
    }
  };
})
.directive('jobClear', function(jobQueueService) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        jobQueueService.clear($scope.job);
      });
    }
  };
})
.directive('jobRetry', function(jobQueueService) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        if ($scope.job.status === 'failed') {
          jobQueueService.retry($scope.job);
        }
      });
    }
  };
})
.controller('DashboardCtrl',
function ($scope, $window, $timeout, $interval, $q, kbox,
  installedSitesService, pollingService, jobQueueService) {

  //Init ui model.
  $scope.ui = {
    sites: [],
    states: {},
    jobs: []
  };

  // Poll installed sites.
  pollingService.add(function() {
    return installedSitesService.sites()
    .then(function(sites) {
      $scope.ui.sites = sites;
    })
    .then(function() {
      return installedSitesService.states();
    })
    .then(function(states) {
      $scope.ui.states = states;
    });
  });

  pollingService.add(function() {
    $scope.ui.jobs = jobQueueService.jobs();
  });

  // Start polling.
  return pollingService.start(3)
  // Wait for polling to be shutdown.
  .then(function() {
    return pollingService.wait();
  });

});
