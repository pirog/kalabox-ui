'use strict';

angular.module('kalabox.dashboard')

.directive('siteConnection', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiEngine.try(function() {
          // Get the services.
          // @todo: we should do this through site.js; this method won't work.
          var siteConnectModal = $scope.open(
            'modules/dashboard/site-connection-modal.html.tmpl',
            'SitePullModal',
            {
              site: $scope.site,
              environments: []
            }
          );
        });
      });
    }
  };
})

.controller(
  'SiteConnectModal',
  function($scope, $uibModalInstance, _, modalData, guiEngine) {

    guiEngine.try(function() {
      _.forEach(modalData.services, function(service) {
        $scope[service.name] = service;
      });
      $scope.ok = function() {
        $uibModalInstance.close();
      };
      $scope.cancel = function() {
        $uibModalInstance.close();
      };
    });

  }
);
