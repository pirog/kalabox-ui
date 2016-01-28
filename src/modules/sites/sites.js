'use strict';

angular.module('kalabox.sites', [])
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
 * Object for getting a cached list of site instances.
 */
.factory('sites', function(kbox, Site) {
  return {
    get: function(name) {
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
.factory('siteStates', function($q, kbox) {
  var cache = new Cache(15);
  return {
    get: function(name) {
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
        if (name) {
          return map[name] !== undefined ? map[name] : false;
        } else {
          return map;
        }
      });
    }
  };
});
