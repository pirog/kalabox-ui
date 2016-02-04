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
    url: '/dashboard/sidebar',
    templateUrl: 'modules/sidebar/sidebar.html.tmpl',
  })
  .state('dashboard.sidebar.provider-auth', {
    url: '/dashboard/sidebar/provider-auth/{provider:json}',
    templateUrl: 'modules/dashboard/provider-auth.html.tmpl',
    controller: 'ProviderAuth'
  });
})
.controller(
  'ProviderAuth',
  function($scope, kbox, _, guiEngine, $state, $stateParams) {
    console.log($stateParams.provider, $stateParams.provider.name);
    guiEngine.try(function() {
      $scope.errorMessage = false;
      // Auth on submission.
      $scope.ok = function(email, password) {
        return kbox.then(function(kbox) {

          var provider = $stateParams.provider.name;
          var integration = kbox.integrations.get(provider);
          var auth = integration.auth();
          $scope.provider = $stateParams.provider;
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
              // Update provider on the scope.
              $scope.provider.authorize(result.username);
              $scope.provider.refresh();
            } else {
              throw new Error('Auth failed.');
            }
          })
          .then(function() {
            // Navigate back to main provider view.
            $state.go('dashboard.sidebar', {}, {location: false});
          })
          .catch(function(err) {
            $scope.errorMessage = 'Failed to validate: ' + err.message;
            throw err;
          });
        });
      };
      $scope.cancel = function() {
        $state.go('dashboard.sidebar', {}, {location: false});
      };
    });

  }
)
.directive('providerClick', function(guiEngine, $state) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          if ($scope.provider.authorized()) {
            $scope.provider.refresh();
          } else {
            $state.go('dashboard.sidebar.provider-auth',
              {provider: $scope.provider}, {location: false});
          }
        });
      });
    }
  };
});
