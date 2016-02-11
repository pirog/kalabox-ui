'use strict';

angular.module('kalabox.dashboard', [
  'ui.router',
  'ui.bootstrap',
  'kalabox.nodewrappers',
  'kalabox.guiEngine',
  'kalabox.sidebar'
])
.config(function($stateProvider) {
  $stateProvider.state('dashboard', {
    url: '/dashboard',
    views: {
      '': {
        controller: 'DashboardCtrl',
        templateUrl: 'modules/dashboard/dashboard.html.tmpl'
      }
    }
  })
  .state('dashboard.shutdown', {
    url: '/dashboard/shutdown/{winVar:json}',
    views: {
      '@': {
        templateUrl: 'modules/dashboard/shutdown.html.tmpl',
        controller: 'ShutdownCtrl'
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
            if (isRunning) {
              // Stop site.
              return $scope.site.stop();
            } else {
              // Start site.
              return $scope.site.start();
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
            return $scope.site.trash();
          }
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
          // Get reference to nw gui.
          var gui = require('nw.gui');
          // Open folder in os' default file browser.
          gui.Shell.openExternal($scope.site.url);
        });
      });
    }
  };
})
.directive('siteCode', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          var gui = require('nw.gui');
          gui.Shell.openItem($scope.site.codeFolder);
        });
      });
    }
  };
})
.controller(
  'DashboardCtrl',
  function($scope, $uibModal, $timeout, $interval, $q, kbox,
    sites, providers, siteStates, _, guiEngine, $state, $rootScope) {

  //Init ui model.
  $scope.ui = {
    sites: [],
    states: {},
    jobs: []
  };

  $scope.isModalOpen = false;
  $scope.errorCount = 0;

  $rootScope.providers = [];

  // Grab developer mode so we can display inch high red letters on the UI.
  kbox.then(function(kbox) {
    $scope.ui.devMode = kbox.core.deps.get('globalConfig').devMode;
  });

  // Modal creator.
  $scope.open = function(templateUrl, controllerName, data) {
    var uibModalInstance = $uibModal.open({
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
    return uibModalInstance;
  };

  // Handle shutting down of kalabox.
  guiEngine.try(function() {
    // Get nw window object.
    var win = require('nw.gui').Window.get();
    // Hook into the gui window closing event.
    win.on('close', function() {
      // Open a new state to inform the user that app is shutting down.
      $state.go('dashboard.shutdown', {winVar: win}, {location: false});
    });
  });

  // Initialize providers.
  guiEngine.try(function() {
    return providers.get()
    .then(function(providers) {
      $rootScope.providers = providers;
    });
  });

  // Poll sites.
  guiEngine.loop.add({interval: 1 * 60 * 1000}, function() {
    return sites.get()
    .then(function(sites) {
      $scope.$applyAsync(function() {
        $scope.ui.sites = sites;
      });
    });
  });

  // Poll sites when they need to be refreshed.
  guiEngine.loop.add({interval: 0.3 * 1000}, function() {
    if (sites.needsRefresh()) {
      sites.resetNeedsRefresh();
      return sites.get()
      .then(function(sites) {
        $scope.$applyAsync(function() {
          $scope.ui.sites = sites;
        });
      });
    }
  });

  // Poll site states.
  guiEngine.loop.add({interval: 10 * 1000}, function() {
    return siteStates.get()
    .then(function(states) {
      $scope.ui.states = states;
    });
  });

  // Poll engine status.
  guiEngine.loop.add({interval: 0.25 * 60 * 1000}, function() {
    return kbox.then(function(kbox) {
      return kbox.engine.isUp();
    })
    .then(function(isUp) {
      $scope.ui.engineStatus = isUp;
    });
  });

  // Poll list of errors.
  guiEngine.loop.add({interval: 0.25 * 100}, function() {
    $scope.ui.errors = guiEngine.errors.list();
  });

  // Open error modal.
  guiEngine.loop.add({interval: 0.3 * 1000}, function() {
    // If we have new errors and modal isn't already open.
    if ($scope.ui.errors.length > $scope.errorCount && !$scope.isModalOpen) {
      // Open modal.
      $scope.isModalOpen = true;
      $scope.open(
        'modules/dashboard/error-modal.html.tmpl',
        'ErrorModal',
        {errors: $scope.ui.errors, parentScope: $scope}
      ).result.then(function() {
        // After modal is closed, set the error count.
        $scope.isModalOpen = false;
        $scope.errorCount = $scope.ui.errors.length;
      });
    }
  });

  // Check if a job queue job is running.
  guiEngine.loop.add({interval: 0.3 * 1000}, function() {
    $scope.ui.currentJob = guiEngine.queue.currentJob();
  });

})
.controller(
  'ErrorModal',
  function($scope, $q, $uibModalInstance, kbox, _, modalData) {

  $scope.errors = modalData.errors;
  $scope.ok = function() {
    $uibModalInstance.close();
  };
})
.controller(
  'SiteCtrl',
  function($scope) {
  // Code for setting site state on view.
  $scope.siteClasses = function() {
    var currentAction = $scope.site.currentAction ? $scope.site.currentAction :
    '';
    var siteUp = $scope.ui.states[$scope.site.name] ? 'site-up' : '';
    return currentAction + ' ' + siteUp;
  };
  $scope.currentActionName = function() {
    if ($scope.site.currentAction) {
      var actions = {stop: 'Stopping', start: 'Starting', 'delete': 'Deleting',
      pull: 'Pulling', push: 'Pushing', add: 'Installing'};
      return actions[$scope.site.currentAction];
    }
    return false;
  };
})
.controller(
  'ShutdownCtrl',
  function($scope, $q, kbox, _, guiEngine, $stateParams) {
    $scope.win = $stateParams.winVar;

    // Stop the polling service.
    guiEngine.stop()
    // Close.
    .then(function() {
      console.log('Shutdown ran');
      $scope.win.close(true);
    });

    $scope.ok = function() {
      $scope.win.close(true);
    };
  }
);
