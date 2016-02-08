'use strict';

angular.module('kalabox.guiEngine')
.factory('queueService', function($q) {

  var _hd = Promise.resolve();

  var _stopFlag = false;

  function add(desc, fn) {
    _hd = _hd.then(function() {
      if (!_stopFlag) {
        return $q.try(fn);
      }
    });
  }

  function stop() {
    _stopFlag = true;
    return _hd;
  }

  return {
    add: add,
    jobs: function() {
      return [];
    },
    stop: stop
  };

});
