'use strict';

angular.module('kalabox.guiEngine')
.factory('queueService', function($q) {

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

});
