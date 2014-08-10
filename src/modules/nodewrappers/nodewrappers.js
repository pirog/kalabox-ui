angular.
  module('kalabox.nodewrappers', [])
  .factory('fs', [function() {
    return require('fs');
  }])
  .factory('http', [function() {
    return require('http');
  }])
  .factory('_', function() {
    return require('lodash');
  });