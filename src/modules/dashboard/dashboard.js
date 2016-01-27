'use strict';

angular.module('kalabox.dashboard', [
  'ui.router',
  'ui.bootstrap',
  'kalabox.nodewrappers',
  'kalabox.guiEngine'
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
.directive('siteToggle', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        return guiEngine.try(function() {
          // Query running state of site.
          return $scope.site.isRunning()
          .then(function(isRunning) {
            var name = $scope.site.name;
            if (isRunning) {
              // Stop site.
              guiEngine.queue.add('Stop Site: ' + name, function() {
                return $scope.site.stop();
              });
            } else {
              // Start site.
              guiEngine.queue.add('Start Site: ' + name, function() {
                return $scope.site.start();
              });
            }
          });
        });
      });
    }
  };
})
.directive('siteTrash', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          var areYouSure = true;
          if (areYouSure) {
            var desc = 'Remove Site: ' + $scope.site.name;
            guiEngine.queue.add(desc, function() {
              return $scope.site.trash();
            });
          }
        });
      });
    }
  };
})
.directive('sitePull', function(guiEngine, kbox, _) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiEngine.try(function() {
          return kbox.then(function(kbox) {
            var provider = kbox.integrations.get($scope.site.provider);
            var sites = provider.sites();
            sites.on('ask', function(questions) {
              _.each(questions, function(question) {
                if (question.id === 'username') {
                  return question.answer('ben@kalamuna.com');
                } else {
                  question.fail(question.id);
                }
              });
            });
            return sites.run().then(function(sites) {
              var siteInfo = _.find(sites, function(siteInfo) {
                return siteInfo.name === $scope.site.name;
              });
              if (!siteInfo) {
                throw new Error('Site not found: ' + $scope.site.name);
              }
              var sitePullModal = $scope.open(
                'modules/dashboard/site-pull-modal.html',
                'SitePullModal',
                {
                  site: $scope.site,
                  environments: siteInfo.environments
                }
              );
              return sitePullModal.result;
            });
          });
        });
      });
    }
  };
})
.directive('sitePush', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiEngine.try(function() {
          var sitePushModal = $scope.open(
            'modules/dashboard/site-push-modal.html',
            'SitePushModal',
            {site: $scope.site}
          );
          return sitePushModal.result;
        });
      });
    }
  };
})
.directive('siteBrowser', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          var gui = require('nw.gui');
          gui.Shell.openExternal($scope.site.url);
        });
      });
    }
  };
})
.directive('siteCode', function(terminal, guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          terminal.open($scope.site.codeFolder);
        });
      });
    }
  };
})
.directive('siteAdd', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
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
.directive('jobClear', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          return guiEngine.queue.clear($scope.job);
        });
      });
    }
  };
})
.directive('jobRetry', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          if ($scope.job.status === 'failed') {
            return guiEngine.queue.retry($scope.job);
          }
        });
      });
    }
  };
})
.directive('providerClick', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
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
  installedSitesService, _, guiEngine) {

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
  guiEngine.try(function() {
    // Get nw window object.
    var win = require('nw.gui').Window.get();
    // Hook into the gui window closing event.
    win.on('close', function() {

      var self = this;

      // Open a modal window to inform the user that app is shutting down.
      $q.try(function() {
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
      guiEngine.loop.stop()
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
          return login;
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
  guiEngine.loop.add({interval: 1 * 60 * 1000}, function() {
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

  guiEngine.loop.add({interval: 0.25 * 60 * 1000}, function() {
    return kbox.then(function(kbox) {
      return kbox.engine.isUp();
    })
    .then(function(isUp) {
      $scope.ui.engineStatus = isUp;
    });
  });

  // Poll list of jobs.
  guiEngine.loop.add({interval: 0.25 * 100}, function() {
    $scope.ui.jobs = guiEngine.queue.jobs();
  });

  // Poll list of errors.
  guiEngine.loop.add({interval: 0.25 * 100}, function() {
    $scope.ui.errors = guiEngine.errors.list();
  });

})
.controller('SitePullModal', function($scope, $modalInstance, _, modalData, guiEngine) {
  guiEngine.try(function() {
    $scope.site = modalData.site;
    $scope.environments = modalData.environments;
    $scope.errorMessage = false;
    $scope.ok = function(database, createBackup, files) {
      guiEngine.try(function() {
        $modalInstance.close();
        var site = modalData.site;
        var desc = 'Pull Site: ' + site.name;
        guiEngine.queue.add(desc, function() {
          var job = this;
          return site.pull().then(function(pull) {
            pull.on('ask', function(questions) {
              _.each(questions, function(question) {
                if (question.id === 'shouldPullFiles') {
                  question.answer(files);
                } else if (question.id === 'shouldPullDatabase') {
                  question.answer(database);
                } else {
                  question.fail(new Error(question));
                }
              });
            });
            pull.on('update', function() {
              job.update(pull.status);
            });
            return pull.run(site.name);
          });
        });
      });
    };
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
})
.controller('SitePushModal', function($scope, $modalInstance, _, modalData, guiEngine) {
  guiEngine.try(function() {
    $scope.errorMessage = false;
    $scope.ok = function(message, database, files) {
      guiEngine.try(function() {
        $modalInstance.close();
        var site = modalData.site;
        var desc = 'Push Site: ' + site.name;
        guiEngine.queue.add(desc, function() {
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
.controller('AuthModal', function($scope, $modalInstance, kbox, _, modalData, guiEngine) {
  guiEngine.try(function() {
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
        return auth.run(email)
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
.controller('SiteAddModal', function($scope, $q, $modalInstance, kbox, _, modalData, guiEngine) {
  guiEngine.try(function() {
    // Set provider.
    $scope.provider = modalData.provider;
    // Set site.
    $scope.site = modalData.site;
    // Modal function.
    $scope.ok = function(appConfig) {
      // Run inside a gui task.
      guiEngine.try(function() {
        // Get 
        var siteName = appConfig.name;
        var desc = 'Add Site: ' + siteName;

        // Create a queued task.
        guiEngine.queue.add(desc, function() {
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
              _: [],
              h: false,
              v: false,
              verbose: false,
              email: provider.username,
              site: site.name,
              needsFramework: false,
              env: appConfig.env,
              name: appConfig.name,
              dir: dir
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
.controller('ShutdownModal', function($scope, $q, $modalInstance, kbox, _, modalData, guiEngine) {
  guiEngine.try(function() {
    $scope.ok = function() {
      modalData.win.close(true);
    };
  });
})
;
