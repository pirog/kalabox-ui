'use strict';

angular.module('kalabox.boot2docker', [])
  .factory('Boot2Docker', ['$q', 'exec', function($q, exec) {

    var downloadPath = function() {

    };

    function getVersion() {
      var deferred = $q.defer();
      exec('boot2docker version', function(error, stdout) {
        if (error !== null) {
          deferred.resolve(false);
        }
        else {
          deferred.resolve(stdout);
        }
      });
      return deferred.promise;
    }

    return {
      downloadPath: downloadPath,
      getVersion: getVersion,
      version: '1.1.1'
    };

  }]);
