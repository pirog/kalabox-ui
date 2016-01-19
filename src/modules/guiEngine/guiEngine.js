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
    console.log('ERROR: ' + err.message);
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
