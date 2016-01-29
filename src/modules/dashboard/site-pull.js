'use strict';

angular.module('kalabox.dashboard')

.directive('sitePull', function(guiEngine/*, kbox, _*/) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiEngine.try(function() {
          var sitePullModal = $scope.open(
            'modules/dashboard/site-pull-modal.html.tmpl',
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

.controller(

  'SitePullModal',
  function($scope, $modalInstance, _, modalData, guiEngine) {

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

  }
);
