'use strict';

angular.module('kalabox.guiEngine')
.factory('recloopService', function($q, _, moment, errorHandler) {

  /*
   * Array for storing promises.
   */
  var fns = [];

  /*
   * Apply jitter to n.
   */
  function applyJitter(jitter, n) {
    var jitterResult = _.random(0, jitter, true) * n;
    var sign = _.random(0, 1);
    jitterResult = sign ? -jitterResult : jitterResult;
    return n + jitterResult;
  }

  function now() {
    return moment();
  }

  /*
   * Add a function to reoccur at opts.interval intervals.
   * NOTE: jitter will also be applied to delays to keep jobs from all
   * happening at once and spiking the cpu.
   */
  function add(opts, fn) {
    // Argument shuffling.
    if (!fn && typeof opts === 'function') {
      fn = opts;
      opts = undefined;
    }
    // Default options.
    opts = opts || {};
    opts.interval = opts.interval || 15 * 1000;
    opts.jitter = opts.jitter || 0.2;
    // Flag for stopping repeating interval.
    var stopFlag = false;
    // Recursive function.
    function rec(next) {
      // Figure out if job should be run based on schedule.
      var shouldRunJob = moment().diff(next) > 0;
      if (shouldRunJob) {
        // Run the job.
        return $q.try(fn)
        // Schedule the next run of the job.
        .finally(function() {
          // Find out when job should run again.
          var duration = applyJitter(opts.jitter, opts.interval);
          var schedule = now().add(duration, 'ms');
          // Recurse.
          return rec(schedule);
        })
        // Handle errors.
        .catch(function(err) {
          return errorHandler(err);
        });
      } else {
        // Job is not ready to run, delay then recurse.
        return Promise.delay(50)
        .then(function() {
          // Only recurse if stop flag has not been set.
          if (!stopFlag) {
            return rec(next);
          }
        });
      }
    }
    // Hold onto promise returned by recursive function so caller can wait on it.
    var prm = rec(now());
    // Return micro api so called can turn it off and wait for it to finish.
    var api = {
      fn: fn,
      stop: function() {
        // Tell recursive function to stop.
        stopFlag = true;
        // Return promise.
        return prm;
      }
    };
    // Add api to list of apis.
    fns.push(api);
    // Return api.
    return api;
  }

  /*
   * Stop all pending functions.
   */
  function stop() {
    // Map each function to a stop result.
    return $q.map(fns, function(api) {
      return api.stop();
    });
  }

  /*
   * Quick way to run all funs right away.
   * @todo: this needs to be implemented in a much better way.
   */
  function reset() {
    return $q.map(fns, function(api) {
      return $q.try(api.fn);
    }, {concurrency: 3});
  }

  /*
   * Return api.
   */
  return {
    add: add,
    stop: stop,
    reset: reset
  };

});
