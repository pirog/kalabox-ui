'use strict';

angular.module('kalabox.dashboard', [
  'ui.router',
  'ui.bootstrap',
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
.directive('sitePull', function(jobQueueService, _) {
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
            pull.on('ask', function(questions) {
              _.each(questions, function(question) {
                if (question.id === 'shouldPullFiles') {
                  question.answer(true);
                } else if (question.id === 'shouldPullDatabase') {
                  question.answer(true);
                } else {
                  question.fail(new Error(question));
                }
              });
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
.directive('sitePush', function() {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var pushModal = $scope.open(
          'modules/dashboard/site-push-modal.html',
          'SitePullModal',
          {site: $scope.site}
        );
        return pushModal.result;
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
.directive('siteAdd', function() {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        var addSiteModal = $scope.open('modules/dashboard/add-site-modal.html', 'AddSiteModal', {provider: $scope.provider, siteName: $scope.site.name});
          addSiteModal.result.then(function(result) {
            console.log('Site pull ran', result);
            //@todo: refresh dashboard list of sites?
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
        if ($scope.provider.auth) {
          $scope.provider.refreshSites();
        } else {
          // @todo: Auth via the modal.
          var authModal = $scope.open('modules/dashboard/auth-modal.html', 'AuthModal', {provider: $scope.provider});
          authModal.result.then(function(result) {
            $scope.provider.auth = true;
            $scope.provider.username = result.username;
            $scope.provider.refreshSites();
          });
        }
      });
    }
  };
})
.controller('DashboardCtrl',
function ($scope, $uibModal, $timeout, $interval, $q, kbox,
  installedSitesService, pollingService, jobQueueService, _, loginService) {

  //Init ui model.
  $scope.ui = {
    sites: [],
    states: {},
    jobs: [],
    providers: []
  };

  // Modal creator.
  $scope.open = function(templateUrl, controllerName, data) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: templateUrl,
      controller: controllerName,
      size: 'lg',
      resolve: {
        modalData: function() {
          return data;
        }
      }
    });
    return modalInstance;
  };

  // Initialize providers.
  kbox.then(function(kbox) {
    $scope.kbox = kbox;
    // Get list of providers (integration + login = provider).
    var providers = Promise.try(function() {
      // Get list of installed integrations.
      return _.values(kbox.integrations.get());
    })
    .reduce(function(acc, integration) {
      // Get list of logins for this integration.
      return integration.logins().run().then(function(logins) {
        // Get list of emails for this integration.
        var emails = _.map(logins, function(login) {
          return login.email;
        });
        // Add a null email for an unathorized integration.
        emails.push(null);
        // Reverse the array so the null email is at the start.
        emails.reverse();
        // Build a provider for each integration + email.
        _.each(emails, function(email) {
          acc.push({
            name: integration.name,
            auth: !!email,
            username: email,
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
                sites.on('ask', function(questions) {
                  _.each(questions, function(question) {
                    /*
                     * @todo: Ask via the modal.
                     */
                    if (question.id === 'username') {
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
          });
        });
        // Return accumulator.
        return acc;
      });
    }, []);
    providers.then(function(providers) {
      $scope.ui.providers = providers;
    });
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
})
.controller('SitePullModal', function($scope, $modalInstance, _, modalData, jobQueueService) {
  $scope.errorMessage = false;
  $scope.ok = function(message, database, files) {
    $modalInstance.close();
    var site = modalData.site;
    var desc = 'Push Site: ' + site.name;
    jobQueueService.add(desc, function() {
      var job = this;
      return site.push().then(function(push) {
        push.on('ask', function(questions) {
          _.each(questions, function(question) {
            if (question.id === 'message') {
              question.answer(message);
            } else if (question.id === 'database') {
              question.answer(database);
            } else if (question.id === 'files') {
              question.answer(files);
            } else {
              question.fail(new Error(question.id));
            }
          });
        });
        push.on('update', function() {
          job.update(push.status);
        });
        return push.run()
        .then(function() {
          console.log('done');
        });
      });
    });
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
.controller('AuthModal', function($scope, $modalInstance, kbox, _, modalData) {
  $scope.errorMessage = false;
  // Auth on submission.
  $scope.ok = function(email, password) {
    return kbox.then(function(kbox) {
      var provider = modalData.provider.name;
      var integration = kbox.integrations.get(provider);
      var auth = integration.auth();
      auth.on('ask', function(questions) {
        _.each(questions, function(question) {
          if (question.id === 'username') {
            question.answer(email);
          } else if (question.id === 'password') {
            question.answer(password);
          } else {
            throw new Error(JSON.stringify(question, null, '  '));
          }
        });
      });
      return auth.run()
      .then(function(result) {
        if (result !== false) {
          // Close modal on success.
          $modalInstance.close({
            username: email
          });
        } else {
          throw new Error('Auth failed.');
        }
      })
      .catch(function(e) {
        console.log(e);
        $scope.errorMessage = 'Failed to validate: ' + e.message;
      });
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
.controller('AddSiteModal', function($scope, $q, $modalInstance, kbox, _, modalData, jobQueueService) {
  $scope.ok = function(app) {
    console.log(app, $scope, $q, $modalInstance, kbox, _, modalData, jobQueueService);
    var siteName = modalData.siteName;
    var provider = modalData.provider;
    var email = provider.username;
    var config = kbox.core.deps.get('globalConfig');
    var dir = config.appsRoot;
    var opts = {
      verbose: false,
      buildLocal: false,
      env: app.env,
      dir: dir,
      name: app.name,
      site: siteName,
      email: email,
      needsFramework: false
    };
    var desc = 'Add Site: ' + siteName;
    return jobQueueService.add(desc, function() {
      return $q.try(function() {
        var app = kbox.create.get(provider.name);
        return kbox.create.createApp(app, opts);
      });
    });
  };
})
;
