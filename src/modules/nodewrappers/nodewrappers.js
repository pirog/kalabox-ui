'use strict';

angular.module('kalabox.nodewrappers', [])
  .factory('exec', [function() {
    return require('child_process').exec;
  }])
  .factory('fs', [function() {
    return require('fs');
  }])
  .factory('http', [function() {
    return require('http');
  }])
  .factory('kbox', function($q) {
    // Lazy load a fully initialized kbox core library.
    var deferred = $q.defer();
    var kbox = require('kalabox');
    kbox.init(function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(kbox);
      }
    });
    return deferred.promise;
  })
  .factory('os', [function() {
    return require('os');
  }])
  .factory('_', function() {
    return require('lodash');
  });
