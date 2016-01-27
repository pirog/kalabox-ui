'use strict';

angular.module('kalabox.dashboard')

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
              needsFramework: fase,
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
});
