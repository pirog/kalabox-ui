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
    var kbox = require('kalabox');
    return $q.try(function() {
      return kbox.init('gui');
    })
    .then(function() {
      return kbox;
    });
  })
  .factory('globalConfig', function(kbox) {
    return kbox.then(function(kbox) {
      return kbox.core.deps.get('globalConfig');
    });
  })
  .factory('os', [function() {
    return require('os');
  }])
  .factory('_', function() {
    return require('lodash');
  });
