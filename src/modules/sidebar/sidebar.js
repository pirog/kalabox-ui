'use strict';

angular.module('kalabox.sidebar', [
  'ui.router',
  'ui.bootstrap',
  'kalabox.nodewrappers',
  'kalabox.guiEngine',
  'kalabox.dashboard'
])
.config(function($stateProvider) {
  $stateProvider.state('dashboard.sidebar', {
    views: {
      'integrations': {
        url: '/dashboard/sidebar',
        templateUrl: 'modules/sidebar/sidebar.html.tmpl',
        controller: 'SidebarCtrl'
      }
    }
  })
  .state('dashboard.sidebar.provider-auth', {
    url: '/dashboard/sidebar/provider-auth/{provider:json}',
    templateUrl: 'modules/sidebar/provider-auth.html.tmpl',
    controller: 'ProviderAuth'
  })
  .state('dashboard.sidebar.app-create', {
    url: '/dashboard/sidebar/app-create/{app:json}',
    templateUrl: 'modules/sidebar/app-create.html.tmpl',
    controller: 'AppCreate'
  })
  .state('dashboard.sidebar.app-create-pantheon', {
    url: '/dashboard/sidebar/app-create-pantheon/{site:json}/{provider:json}',
    templateUrl: 'modules/sidebar/app-create-pantheon.html.tmpl',
    controller: 'AppCreatePantheon'
  });
})
.controller(
  'SidebarCtrl',
  function($scope, _) {
    $scope.pantheonAuthed = function(providers) {
      return _.some(providers, function(provider) {
        return !_.isEmpty(provider.username);
      });
    };
    $scope.sidebar = {};
    $scope.sidebar.errorMessage = false;
  }
)
.controller(
  'ProviderCtrl',
  function($scope) {
    $scope.providerClasses = function() {
      var providerClasses = !$scope.provider.authorized() ?
        'provider-reauth ' : '';
      providerClasses = providerClasses + $scope.provider.name;
      return providerClasses;
    };
  }
)
.controller(
  'ProviderAuth',
  function($scope, kbox, _, guiEngine, $state, $stateParams, providers,
    $rootScope) {
    $scope.provider = $stateParams.provider;
    $scope.authorizing = false;

    guiEngine.try(function() {
      $scope.errorMessage = false;
      // Auth on submission.
      $scope.ok = function(email, password) {
        $scope.authorizing = true;
        // Authorize with provider.
        return $scope.provider.authorize(email, password)
        // Refresh providers.
        .then(function() {
          return providers.get()
          .then(function(providers) {
            $rootScope.providers = providers;
          });
        })
        // Navigate back to main provider view.
        .then(function() {
          $scope.authorizing = false;
          $scope.sidebar.errorMessage = false;
          $state.go('dashboard.sidebar', {}, {location: false});
        })
        // Handle errors.
        .catch(function(err) {
          $scope.authorizing = false;
          $scope.errorMessage = 'Failed to validate: ' + err.message;
          throw err;
        });

      };
    });

  }
)
.directive('providerClick', function(guiEngine, $state, _) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        if (_.isEmpty($scope.provider.sites)) {
          guiEngine.try(function() {
            if ($scope.provider.authorized()) {
              $scope.provider.refresh().then(function(result) {
                if (result.message) {
                  $scope.sidebar.errorMessage = 'Authentication failed. ' +
                  'Please re-authenticate your Pantheon account.';
                }
              });
            } else {
              $state.go('dashboard.sidebar.provider-auth',
                {provider: $scope.provider}, {location: false});
            }
          });
        }
      });
    }
  };
})
.controller(
  'AppCtrl',
  function($scope) {
    $scope.appDisplayName = function(app) {
      switch (app.name) {
        case 'backdrop':
          return 'Backdrop CMS';
        case 'drupal7':
          return 'Drupal 7';
        case 'drupal8':
          return 'Drupal 8';
        case 'wordpress':
          return 'Wordpress';
      }
    };
  }
)
.controller(
  'AppCreate',
  function($scope, kbox, _, guiEngine, $state, $stateParams, Site) {
    $scope.app = $stateParams.app;

    guiEngine.try(function() {
      $scope.errorMessage = false;
      // Auth on submission.
      $scope.ok = function(appName) {
        guiEngine.try(function() {
          // Add site.
          Site.add({
            provider: {name: $scope.app.name},
            site: appName,
            name: appName.toLowerCase()
          });
          // Navigate back to main provider view.
          $state.go('dashboard.sidebar', {}, {location: false});
        });
      };
    });
  }
)
.directive('appClick', function(guiEngine, $state) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        $state.go('dashboard.sidebar.app-create',
          {app: $scope.app}, {location: false});
      });
    }
  };
})
.directive('pantheonAppClick', function(guiEngine, $state) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          // Get list of site environments.
          return $scope.site.getEnvironments()
          .then(function(envs) {
            console.log($scope);
            var provider = $scope.provider;
            delete provider.sites;
            $scope.site.environments = envs;
            $state.go('dashboard.sidebar.app-create-pantheon',
              {site: $scope.site, provider: provider}, {location: false});
          });
        });
      });
    }
  };
})
.controller(
  'AppCreatePantheon',
  function($scope, kbox, _, guiEngine, $state, $stateParams, sites) {
    console.log($scope, $state, $stateParams, sites);
    $scope.site = $stateParams.site;
    $scope.provider = $stateParams.provider;
    guiEngine.try(function() {

      // Modal function.
      $scope.ok = function(appConfig) {
        // Run inside a gui task.
        guiEngine.try(function() {
          var provider = $stateParams.provider;
          var site = $stateParams.site;
          // Add site.
          sites.add({
            provider: provider,
            email: provider.username,
            site: site.name,
            env: appConfig.env,
            name: appConfig.name.toLowerCase()
          });

          // Close the modal.
          $state.go('dashboard.sidebar', {}, {location: false});

        });
      };
    });

  }
);
