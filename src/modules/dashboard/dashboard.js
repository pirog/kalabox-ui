'use strict';

angular.module('kalabox.dashboard', [
  'ui.router',
  'kalabox.nodewrappers'
])
.config(function($stateProvider) {
  $stateProvider.state('dashboard', {
    url: '/dashboard',
    views: {
      '': {
        controller: 'DashboardCtrl',
        templateUrl: 'modules/dashboard/dashboard.html'
      },
      'platforms@dashboard': {
        controller: 'DashboardCtrl',
        templateUrl: 'modules/dashboard/platforms.html'
      }
    }
  });
})
.factory('loginService', function($q) {
  return {
    username: function() {
      return $q.resolve('alec@kalamuna.com');
    }
  };
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
.directive('sitePull', function(jobQueueService) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var siteName = $scope.site.name;
        var desc = 'Pull Site: ' + siteName;
        jobQueueService.add(desc, function() {
          var job = this;
          return $scope.site.pull()
          .then(function(pull) {
            pull.on('ask', function(question) {
              if (question.id === 'shouldPullFiles') {
                question.answer(true);
              } else if (question.id === 'shouldPullDatabase') {
                question.answer(true);
              } else {
                question.fail(new Error(question));
              }
            });
            pull.on('update', function() {
              job.update(pull.status);
            });
            return pull.run(siteName);
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
.directive('providerClick', function() {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        $scope.provider.refreshSites();
      });
    }
  };
})
.controller('DashboardCtrl',
function ($scope, $window, $timeout, $interval, $q, kbox,
  installedSitesService, pollingService, jobQueueService, _, loginService) {

  //Init ui model.
  $scope.ui = {
    sites: [],
    states: {},
    jobs: [],
    providers: []
  };

  // Initialize providers.
  kbox.then(function(kbox) {
    // Get list of installed integrations.
    var integrations = _.values(kbox.integrations.get());
    // Map each integration into a GUI provider.
    var providers = _.map(integrations, function(integration) {
      return {
        name: integration.name,
        auth: false,
        username: null,
        showSites: false,
        displayName: function() {
          var self = this;
          if (self.auth) {
            return self.name + ' (' + self.username + ')';
          } else {
            return self.name;
          }
        },
        getUsername: function() {
          var self = this;
          // Run inside of a promise.
          return Promise.try(function() {
            if (self.auth) {
              // Already authorized.
              return self.username;
            } else {
              // Get user name from login service.
              return loginService.username()
              // Set username, auth, and return username.
              .tap(function(username) {
                self.username = username;
                self.auth = true;
              });
            }
          });
        },
        sites : [],
        refreshSites: function() {
          var self = this;
          // Run inside of a promise.
          Promise.try(function() {
            // Clear sites.
            self.sites = [];
            self.showSites = false;
            self.loadingSites = true;
            // Get sites action of integration.
            var sites = integration.sites();
            // Handle question events.
            sites.on('ask', function(question) {
              /*
               * @todo: Ask via the modal.
               */
              if (question.id === 'email') {
                self.getUsername()
                .then(function(username) {
                  question.answer(username);
                });
              } else {
                question.fail(new Error(
                  'Unanswered question: ' + question.id
                ));
              }
            });
            // Handle update events.
            sites.on('update', function() {
              /*
               * @todo: Add some communication between integration and gui.
               */
            });
            // Run sites action.
            return sites.run()
            // Map integration sites to GUI sites.
            .map(function(site) {
              return {
                name: site.name,
                platform: 'Drupal'
              };
            })
            // Set sites.
            .then(function(sites) {
              self.sites = sites;
              self.showSites = true;
              self.loadingSites = false;
            });
          });
        }
      };
    });
    $scope.ui.providers = providers;
  });

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
  return pollingService.start(2 * 1000)
  // Wait for polling to be shutdown.
  .then(function() {
    return pollingService.wait();
  });

});
