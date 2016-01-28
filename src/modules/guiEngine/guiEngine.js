'use strict';

angular.module('kalabox.guiEngine', [
  'kalabox.nodewrappers'
])
.factory('guiEngine', function(
  recloopService,
  errorService,
  tryService,
  queueService,
  kbox
) {
  return {
    errors: errorService,
    loop: recloopService,
    kbox: kbox,
    try: tryService,
    queue: queueService
  };
})
.factory('errorHandler', function() {
  return function(err) {
    console.log(err.message);
  };
})
.factory('errorService', function() {

  var errors = [];

  function report(err) {

    /* jshint camelcase:false */
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var stack = (function() {

      if (err.jse_cause && err.jse_cause.stack) {
        return err.jse_cause.stack;
      }
      else {
        return err.stack;
      }

    }());
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    /* jshint camelcase:true */

    console.log('ERROR: ' + err.message);
    console.log(stack);
    errors.push(err);
  }

  function list() {
    return errors;
  }

  return {
    list: list,
    report: report
  };

})
.factory('tryService', function($q, errorService) {
  return function(fn) {
    return $q.try(fn)
    .catch(function(err) {
      errorService.report(err);
    });
  };
});
