'use strict';

angular.module('kalabox.dashboard')

.directive('sitePull', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiEngine.try(function() {
					var sitePullModal = $scope.open(
						'modules/dashboard/site-pull-modal.html',
						'SitePullModal',
						{
							site: $scope.site,
							environments: []
						}
					);
					return sitePullModal.result;
        });
      });
    }
  };
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
				return site.pull({
					createBackup: createBackup,
					database: database,
					files: files
				});
      });
    };
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
});
