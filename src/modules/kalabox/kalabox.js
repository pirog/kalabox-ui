'use strict';

angular.module('kalabox', [
  'kalabox.nodewrappers',
  'kalabox.dashboard',
  'kalabox.initialize',
  'kalabox.installer',
  'kalabox.installedSites',
  'ui.bootstrap',
  'mwl.bluebird'
])
// Override the default global error handler.
/* jshint ignore:start */
.factory('$exceptionHandler', function($window) {
  return function(exception) {
    if(exception.message.match(/transition (superseded|prevented|aborted|failed)/)) {
      return;
    }
    var err = exception;
    var stack = (function() {
      if (err.jse_cause && err.jse_cause.stack) {
        return err.jse_cause.stack;
      } else {
        return err.stack;
      }
    }());
    $window.alert(err.message + '\n' + stack);
    console.log(err.message);
    console.log(stack);
  };
})
/* jshint ignore:end */
// Global error handing.
.run(function($q, $exceptionHandler) {
  // Global function for handling errors from bluebird promises.
  $q.onPossiblyUnhandledRejection($exceptionHandler);
})
.factory('jobQueueService', function($q) {

  var nextId = 1;

  var hd = null;

  function addJob(job) {
    function rec(cursor) {
      if (cursor.next) {
        return rec(cursor.next);
      } else {
        cursor.next = job;
        job.prev = cursor;
        check();
      }
    }
    if (!hd) {
      hd = job;
      check();
    } else {
      return rec(hd);
    }
  }

  function removeJob(job) {
    if (job.prev) {
      job.prev.next = job.next;
    } else {
      hd = job.next;
    }
    if (job.next) {
      job.next.prev = job.prev;
    }
    check();
  }

  function check() {
    function rec(cursor) {
      if (cursor) {
        if (cursor.status === 'failed') {
          return rec(cursor.next);
        } else if (cursor.status === 'running') {
          return;
        } else if (cursor.status === 'pending') {
          runJob(cursor);
        } else {
          throw new Error('unexpected');
        }
      }
    }
    return rec(hd);
  }

  function runJob(job) {
    // Set job status.
    job.status = 'running';
    // Run job's function.
    return $q.try(function() {
      return job.fn.call(job);
    })
    // Set next job as the head and run next job.
    .then(function() {
      job.status = 'completed';
      removeJob(job);
    })
    // Handle failures.
    .catch(function(err) {
      job.status = 'failed';
      job.err = err;
    })
    .then(function() {
      check();
    });

  }

  function jobsArray() {
    function rec(jobs, cursor) {
      if (cursor) {
        jobs.push(cursor);
        return rec(jobs, cursor.next);
      } else {
        return jobs;
      }
    }
    return rec([], hd);
  }

  function add(desc, fn) {

    var id = nextId;
    nextId += 1;

    var job = {
      id: id,
      desc: desc,
      fn: fn,
      prev: null,
      next: null,
      status: 'pending',
      statusMsg: '',
      update: function(s) {
        this.statusMsg = s;
      }
    };

    addJob(job);

  }

  function clear(job) {
    removeJob(job);
  }

  function retry(job) {
    removeJob(job);
    job.status = 'pending';
    job.err = null;
    job.next = null;
    job.prev = null;
    addJob(job);
  }

  return {
    add: add,
    clear: clear,
    retry: retry,
    jobs: jobsArray
  };

})
/*
 * Service to handling a list of polling functions at regular intervals
 * and for stopping and waiting on the polling.
 */
.factory('pollingService', function($q) {

  // Flag to tell polling when to stop.
  var stopFlag = false;

  // Singleton array of polling functions.
  var funcs = [];

  // Promise to wait for completion of polling.
  var wait = $q.defer();

  // Add a polling function.
  function add(func) {
    funcs.push(func);
  }

  // Loop through each polling function, delay for an interval, then repeat
  // until the stop flag has been set to true.
  function loop(interval) {
    if (!stopFlag) {
      // Execute each polling function in parallel.
      return $q.map(funcs, function(func) {
        return func();
      })
      // Delay for one interval.
      .delay(interval)
      // Repeat.
      .then(function() {
        return loop(interval);
      });
    } else {
      // Stop flag has been set, signal polling is done.
      wait.resolve();
    }
  }

  // Start polling.
  function start(interval) {
    interval = interval || 5 * 1000;
    return loop(interval);
  }

  // Set stop flag and wait for current polling to finish.
  function stop() {
    stopFlag = true;
    return wait;
  }

  return {
    add: add,
    start: start,
    stop: stop,
    stopFlag: stopFlag,
    wait: wait
  };

})
.run(function(kbox, pollingService) {
  // Hook into the gui window closing event.
  var gui = require('nw.gui');
  var win = gui.Window.get();
  win.on('close', function() {
    var self = this;
    // Stop the polling service.
    return pollingService.stop()
    // Shutdown the engine.
    .then(function() {
      return kbox.then(function(kbox) {
        return kbox.engine.down();
      });
    })
    // Force close the window.
    .finally(function() {
      self.close(true);
    });
  });
})
.value('version', '2.0');
