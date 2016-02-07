'use strict';

angular.module('kalabox.dashboard')

.directive('siteAdd', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        guiEngine.try(function() {
          var siteAddModal = $scope.open(
            'modules/dashboard/site-add-modal.html.tmpl',
            'SiteAddModal',
            {provider: $scope.provider, site: $scope.site}
          );
          return siteAddModal.result;
        });
      });
    }
  };
})
.controller(
  'SiteAddModal',
  function($scope, $q, $uibModalInstance, kbox, _, modalData, guiEngine,
    sites) {

    guiEngine.try(function() {
      // Set provider.
      $scope.provider = modalData.provider;
      // Set site.
      $scope.site = modalData.site;
      // Modal function.
      $scope.ok = function(appConfig) {

        // Run inside a gui task.
        guiEngine.try(function() {
          var provider = modalData.provider;
          var site = modalData.site;
          // Add site.
          sites.add({
            provider: provider,
            email: provider.username,
            site: site.name,
            env: appConfig.env,
            name: appConfig.name
          });

          // Close the modal.
          $uibModalInstance.close();

        });
      };
    });

  }
);
