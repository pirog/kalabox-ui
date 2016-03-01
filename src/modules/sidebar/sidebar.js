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
        templateUrl: 'modules/sidebar/sidebar.html.tmpl'
      }
    }
  })
  .state('dashboard.sidebar.provider-auth', {
    url: '/dashboard/sidebar/provider-auth/{provider:json}',
    templateUrl: 'modules/sidebar/provider-auth.html.tmpl',
    controller: 'ProviderAuth'
  });
})
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
              $scope.provider.refresh();
            } else {
              $state.go('dashboard.sidebar.provider-auth',
                {provider: $scope.provider}, {location: false});
            }
          });
        }
      });
    }
  };
});
