'use strict';

angular.module('kalabox.guiEngine')
.factory('queueService', function($q, errorService) {

  // Head of promise chain.
  var _hd = Promise.resolve();

  // Flag to cancel pending jobs, for shutdown.
  var _stopFlag = false;

  // Current job that is running, if null then no jobs are running.
  var _current = null;

  /*
   * Add a job to the queue.
   */
  function add(desc, fn) {
    // Add to end of promise chain.
    _hd = _hd.then(function() {
      if (!_stopFlag) {
        // Set current job.
        _current = {
          title: desc,
          message: null,
          fn: fn
        };
        // Run function.
        return $q.try(fn);
      }
    })
    // Set current job back to null.
    .finally(function() {
      _current = null;
    })
    // Make sure errors get reported to the error service.
    .catch(function(err) {
      return errorService.report(err);
    });
  }

  /*
   * Cancel pending jobs and wait on current job to finish.
   */
  function stop() {
    _stopFlag = true;
    return _hd;
  }

  /*
   * Module API.
   */
  return {
    add: add,
    jobs: function() {
      return [];
    },
    isRunning: function() {
      return !!_current;
    },
    currentJob: function() {
      return _current;
    },
    stop: stop
  };

});
