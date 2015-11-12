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
/*
 * Start site if site is stopped, stop site if site is started.
 */
.directive('siteToggle', function(guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        return guiTask.try(function() {
          // Query running state of site.
          return $scope.site.isRunning()
          .then(function(isRunning) {
            var name = $scope.site.name;
            if (isRunning) {
              // Stop site.
              guiTask.queue('Stop Site: ' + name, function() {
                return $scope.site.stop();
              });
            } else {
              // Start site.
              guiTask.queue('Start Site: ' + name, function() {
                return $scope.site.start();
              });
            }
          });
        });
      });
    }
  };
})
.directive('siteTrash', function(guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          var areYouSure = true;
          if (areYouSure) {
            var desc = 'Remove Site: ' + $scope.site.name;
            guiTask.queue(desc, function() {
              return $scope.site.trash();
            });
          }
        });
      });
    }
  };
})
.directive('sitePull', function(guiTask, _) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiTask.try(function() {
          var siteName = $scope.site.name;
          var desc = 'Pull Site: ' + siteName;
          guiTask.queue(desc, function() {
            /*
             * @todo: we need a modal to ask user if they want to pull files
             * and or pull database.
             */
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
      });
    }
  };
})
.directive('sitePush', function(guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiTask.try(function() {
          var sitePushModal = $scope.open(
            'modules/dashboard/site-push-modal.html',
            'SitePullModal',
            {site: $scope.site}
          );
          return sitePushModal.result;
        });
      });
    }
  };
})
.directive('siteBrowser', function(guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          var gui = require('nw.gui');
          gui.Shell.openExternal($scope.site.url);
        });
      });
    }
  };
})
.directive('siteCode', function(terminal, guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          terminal.open($scope.site.codeFolder);
        });
      });
    }
  };
})
.directive('siteAdd', function(guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          var siteAddModal = $scope.open(
            'modules/dashboard/site-add-modal.html',
            'SiteAddModal',
            {provider: $scope.provider, site: $scope.site}
          );
          return siteAddModal.result;
        });
      });
    }
  };
})
.directive('jobClear', function(guiTask, jobQueueService) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          return jobQueueService.clear($scope.job);
        });
      });
    }
  };
})
.directive('jobRetry', function(guiTask, jobQueueService) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          if ($scope.job.status === 'failed') {
            return jobQueueService.retry($scope.job);
          }
        });
      });
    }
  };
})
.directive('providerClick', function(guiTask) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiTask.try(function() {
          if ($scope.provider.auth) {
            $scope.provider.refreshSites();
          } else {
            var authModal = $scope.open(
              'modules/dashboard/auth-modal.html',
              'AuthModal',
              {
                provider: $scope.provider
              }
            );
            return authModal.result.then(function(result) {
              $scope.provider.auth = true;
              $scope.provider.username = result.username;
              $scope.provider.refreshSites();
            });
          }
        });
      });
    }
  };
})
.controller('DashboardCtrl',
function ($scope, $uibModal, $timeout, $interval, $q, kbox,
  installedSitesService, pollingService, jobQueueService, _,
  guiTask) {

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

  // Handle shutting down of kalabox.
  guiTask.try(function() {
    // Get nw window object.
    var win = require('nw.gui').Window.get();
    // Hook into the gui window closing event.
    win.on('close', function() {

      var self = this;

      // Open a modal window to inform the user that app is shutting down.
      Promise.try(function() {
        var shutdownModal = $scope.open(
          'modules/dashboard/shutdown.html',
          'ShutdownModal',
          {win: self}
        );
        shutdownModal.result.then(function(result) {
          console.log('Shutdown ran', result);
        });
      });

      // Stop the polling service.
      pollingService.stop()
      // Stop the engine.
      .then(function() {
        return kbox.then(function(kbox) {
          return kbox.engine.down();
        });
      })
      // Close.
      .then(function() {
        self.close(true);
      });

    });
  });

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
                    platform: 'Drupal',
                    environments: site.environments
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
    return guiTask.try(function() {
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
  });

  // Poll list of jobs.
  pollingService.add(function() {
    return guiTask.try(function() {
      $scope.ui.jobs = jobQueueService.jobs();
    });
  });

  // Poll list of errors.
  pollingService.add(function() {
    return guiTask.try(function() {
      $scope.ui.errors = guiTask.errors.list();
    });
  });

  // Start polling.
  return pollingService.start(1 * 1000)
  // Wait for polling to be shutdown.
  .then(function() {
    return pollingService.wait();
  });
})
.controller('SitePullModal', function($scope, $modalInstance, _, modalData, guiTask) {
  guiTask.try(function() {
    $scope.errorMessage = false;
    $scope.ok = function(message, database, files) {
      guiTask.try(function() {
        $modalInstance.close();
        var site = modalData.site;
        var desc = 'Push Site: ' + site.name;
        guiTask.queue(desc, function() {
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
            return push.run();
          });
        });
      });
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
})
.controller('AuthModal', function($scope, $modalInstance, kbox, _, modalData, guiTask) {
  guiTask.try(function() {
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
        .catch(function(err) {
          $scope.errorMessage = 'Failed to validate: ' + err.message;
          throw err;
        });
      });
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
})
.controller('SiteAddModal', function($scope, $q, $modalInstance, kbox, _, modalData, guiTask) {
  guiTask.try(function() {
    // Set provider.
    $scope.provider = modalData.provider;
    // Set site.
    $scope.site = modalData.site;
    // Modal function.
    $scope.ok = function(appConfig) {
      // Run inside a gui task.
      guiTask.try(function() {
        // Get 
        var siteName = appConfig.name;
        var desc = 'Add Site: ' + siteName;

        // Create a queued task.
        guiTask.queue(desc, function() {
          // Get kbox core.
          return kbox.then(function(kbox) {
            // Make sure to delete app based dependencies.
            kbox.core.deps.remove('app');
            kbox.core.deps.remove('appConfig');
            // Build vars for creation.
            var provider = modalData.provider;
            var site = modalData.site;
            var config = kbox.core.deps.get('globalConfig');
            var dir = config.appsRoot;
            var opts = {
              verbose: false,
              buildLocal: false,
              env: appConfig.env,
              dir: dir,
              name: appConfig.name,
              site: site.name,
              email: provider.username,
              needsFramework: false
            };
            // Get app.
            var app = kbox.create.get(provider.name);
            // Create app.
            return kbox.create.createApp(app, opts);
          });
        });

        // Close the modal.
        $modalInstance.close();

      });
    };
  });

})
.controller('ShutdownModal', function($scope, $q, $modalInstance, kbox, _, modalData, guiTask) {
  guiTask.try(function() {
    $scope.ok = function() {
      modalData.win.close(true);
    };
  });
})
;
