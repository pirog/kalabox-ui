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

  /*
   * Reset cache.
   */
  Cache.prototype.reset = function() {
    this.lastUpdated = null;
  };

  return Cache;

})
/*
 * Class for encapsulating a site instance.
 */
.factory('Site', function(kbox, siteStateMap, _) {

  var images = [
    'http://www.cgdev.org/sites/default/files/cat8.jpg',
    'http://www.medhatspca.ca/sites/default/files/news_photos/2014-Apr-15/node-147/cute-little-cat.jpg',
    'https://baaobaab.files.wordpress.com/2014/11/cat-dj.jpg',
    'http://www.gordonrigg.com/the-hub/wp-content/uploads/2015/06/cat-matlock-derbyshire.jpg',
    'http://d2118lkw40i39g.cloudfront.net/wp-content/uploads/2015/06/cats.jpg'
  ];

  var getImage = _.memoize(function() {
    return images[_.random(0, images.length - 1)];
  });

  // Constructor.
  function Site(opts) {
    this.name = opts.name;
    this.url = opts.url;
    this.folder = opts.folder;
    this.codeFolder = opts.codeFolder;
    this.image = getImage(opts.name);
    //this.image = 'http://placehold.it/300x250';
    this.provider = 'pantheon';
    this.framework = 'drupal';
  }

  /*
   * Returns boolean set to true if site is running.
   */
  Site.prototype.isRunning = function() {
    var self = this;
    return siteStateMap.get(self.name);
  };

  /*
   * Start site.
   */
  Site.prototype.start = function() {
    var self = this;
    return kbox.then(function(kbox) {
      return kbox.app.get(self.name)
      .tap(function(app) {
        return kbox.setAppContext(app);
      })
      .then(function(app) {
        return kbox.app.start(app);
      })
      .then(function() {
        return siteStateMap.cache.reset();
      });
    });
  };

  /*
   * Stop site.
   */
  Site.prototype.stop = function() {
    var self = this;
    return kbox.then(function(kbox) {
      return kbox.app.get(self.name)
      .tap(function(app) {
        return kbox.setAppContext(app);
      })
      .then(function(app) {
        return kbox.app.stop(app);
      })
      .then(function() {
        return siteStateMap.cache.reset();
      });
    });
  };

  /*
   * Pull site.
   */
  Site.prototype.pull = function() {
    var self = this;
    return kbox.then(function(kbox) {
      return kbox.app.get(self.name)
      .then(function(app) {
        return kbox.setAppContext(app);
      })
      .then(function() {
        return kbox.integrations.get('pantheon').pull();
      });
    });
  };

  Site.prototype.push = function() {
    var self = this;
    return kbox.then(function(kbox) {
      return kbox.app.get(self.name)
      .then(function(app) {
        return kbox.setAppContext(app);
      })
      .then(function() {
        return kbox.integrations.get('pantheon').push();
      });
    });
  };

  /*
   * Remove site.
   */
  Site.prototype.trash = function() {
    var self = this;
    return kbox.then(function(kbox) {
      return kbox.app.get(self.name)
      .tap(function(app) {
        return kbox.setAppContext(app);
      })
      .then(function(app) {
        return kbox.app.destroy(app);
      })
      .then(function() {
        return siteStateMap.cache.reset();
      });
    });
  };

  // Static helper function to create from a kalabox app object.
  Site.fromApp = function(app) {
    return new Site({
      name: app.name,
      url: app.url,
      folder: app.root,
      codeFolder: app.config.codeRoot
    });
  };

  return Site;

})
/*
 * Object for controlling caches.
 */
.factory('siteCache', function(siteList, siteStateMap) {
  return {
    reset: function() {
      siteList.cache.reset();
      siteStateMap.cache.reset();
    }
  };
})
/*
 * Object for getting a cached list of site instances.
 */
.factory('siteList', function(Cache, kbox, Site) {
  var cache = new Cache(15);
  return {
    cache: cache,
    get: function(name) {
      return cache.update(function() {
        return kbox.then(function(kbox) {
          // Get list of apps.
          return kbox.app.list()
          // Only include apps with installed containers.
          .filter(function(/*app*/) {
            return true;
            //return kbox.app.isInstalled(app);
          })
          // Map to sites.
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
.factory('siteStateMap', function($q, kbox, Cache) {
  var cache = new Cache(15);
  return {
    cache: cache,
    get: function(name) {
      return cache.update(function() {
        var map = {};
        return kbox.then(function(kbox) {
          return kbox.app.list()
          .map(function(app) {
            return kbox.engine.list(app.name)
            .reduce(function(result, container) {
              return result || kbox.engine.isRunning(container.name);
            }, false)
            .then(function(result) {
              map[app.name] = result;
            });
          });
        })
        .then(function() {
          return map;
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
