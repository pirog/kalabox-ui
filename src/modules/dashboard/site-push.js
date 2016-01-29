'use strict';

angular.module('kalabox.dashboard')

.directive('sitePush', function(guiEngine) {
  return {
    scope: true,
    link: function($scope, element) {
      element.on('click', function() {
        // Run inside of a gui task.
        guiEngine.try(function() {
          var sitePushModal = $scope.open(
            'modules/dashboard/site-push-modal.html.tmpl',
            'SitePushModal',
            {site: $scope.site}
          );
          return sitePushModal.result;
        });
      });
    }
  };
})
.controller(
  'SitePushModal',
  function($scope, $modalInstance, _, modalData, guiEngine) {

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
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    });
  }
);
