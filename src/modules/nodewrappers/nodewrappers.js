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
  .factory('kbox', function() {
    return require('kalabox');
  })
  .factory('os', [function() {
    return require('os');
  }])
  .factory('pconfig', [function() {
    return require('./lib/pconfig');
  }])
  .factory('_', function() {
    return require('lodash');
  });
