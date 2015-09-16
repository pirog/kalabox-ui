'use strict';

angular.module('kalabox.installedSites', [])
/*
 * Class for seamless caching and updating.
 */
.factory('Cache', function($q, moment) {

  function Cache(duration) {
    // Cache duration, always in seconds.
    this.duration = duration;
    this.lastUpdated = null;
    this.result = $q.resolve();
  }

  /*
   * Callback function is only executed if cache has become stale.
   */
  Cache.prototype.update = function(cb) {
    var self = this;
    // Get the last time cache was updated.
    var last = this.lastUpdated || moment().subtract(1, 'years');
    // Get number of seconds since last time cache was updated.
    var sinceLastUpdate = last.diff(moment(), 'seconds');
    // If since last update is more than duration, then we should update.
    var shouldUpdate = sinceLastUpdate < (-self.duration);
    if (shouldUpdate) {
      // Update cached result.
      return $q.try(cb)
      .tap(function(result) {
        self.result = $q.resolve(result);
        self.lastUpdated = moment();
      });
    } else {
      // Used cached result.
      return self.result;
    }
  };

  return Cache;

})
/*
 * Class for encapsulating a site instance.
 */
.factory('Site', function() {

  // Constructor.
  function Site(opts) {
    this.name = opts.name;
    this.url = opts.url;
    this.folder = opts.folder;
  }

  // Helper function to create from a kalabox app object.
  Site.fromApp = function(app) {
    return new Site({
      name: app.name,
      url: app.url,
      folder: app.root
    });
  };

  return Site;

})
/*
 * Object for getting a cached list of site instances.
 */
.factory('siteList', function(Cache, kbox, Site) {
  var cache = new Cache(10);
  return {
    get: function(name) {
      return cache.update(function() {
        return kbox.then(function(kbox) {
          return kbox.app.list()
          .map(Site.fromApp);
        });
      })
      .then(function(sites) {
        return name ? sites[name] : sites;
      });
    }
  };
})
/*
 * Object for getting a cached list of site instance states.
 */
.factory('siteStateMap', function($q, kbox, Cache, siteList) {
  var cache = new Cache(2);
  return {
    get: function(name) {
      return cache.update(function() {
        return kbox.then(function(kbox) {
          return siteList.get()
          .map(function(site) {
            return kbox.engine.list(site.name)
            .reduce(function(result, container) {
              return result || kbox.engine.isRunning(container.name);
            }, false);
          });
        });
      })
      .then(function(map) {
        if (name) {
          return map[name] !== undefined ? map[name] : false;
        } else {
          return map;
        }
      });
    }
  };

})
/*
 * Object for getting cached lists of sites etc.
 */
.factory('installedSitesService', function(siteList, siteStateMap) {

  return {
    sites: siteList.get,
    states: siteStateMap.get
  };

});
