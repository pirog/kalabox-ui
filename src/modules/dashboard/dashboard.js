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
/*
 * Start site if site is stopped, stop site if site is started.
 */
.directive('siteToggle', function(jobQueueService) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Query running state of site.
        return $scope.site.isRunning()
        .then(function(isRunning) {
          var name = $scope.site.name;
          if (isRunning) {
            // Stop site.
            jobQueueService.add('Stop Site: ' + name, function() {
              return $scope.site.stop();
            });
          } else {
            // Start site.
            jobQueueService.add('Start Site: ' + name, function() {
              return $scope.site.start();
            });
          }
        });
      });
    }
  };
})
.directive('siteTrash', function(jobQueueService, $q) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var areYouSure = true;
        if (areYouSure) {
          var desc = 'Remove Site: ' + $scope.site.name;
          jobQueueService.add(desc, function() {
            return $q.try(function() {
              return $scope.site.trash();
            });
          });
        }
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
.directive('siteCode', function(terminal, $q) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        return $q.try(function() {
          terminal.open($scope.site.codeFolder);
        });
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
