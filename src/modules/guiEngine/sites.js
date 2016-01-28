'use strict';

angular.module('kalabox.sites', [])
/*
 * Class for encapsulating a site instance.
 */
.factory('Site', function(kbox, siteStates, _, providers, guiEngine, $q) {

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
    this.providerName = 'pantheon';
		this.providerInfo = opts.providerInfo;
    this.framework = opts.providerInfo.framework;
		this.busy = false;
  }

	/*
	 * Call fn function within a gui engine queue.
	 **/
	Site.prototype.queue = function(desc, fn) {
		var self = this;
		// Add job to queue.
		return guiEngine.queue.add(desc, function() {
			// Signal that site is busy.
			self.busy = true;
			// Call fn function.
			return $q.try(fn)
			// Signal site is no longer busy.
			.finally(function() {
				self.busy = false;
			});
		});
	};

  /*
   * Returns boolean set to true if site is running.
   */
  Site.prototype.isRunning = function() {
    var self = this;
    return siteStates.get(self.name);
  };

	/*
	 * Get this sites provider.
	 */
	Site.prototype.getProvider = function() {
		var self = this;
		return providers.get(self.providerName);
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
      });
    });
  };

  /*
   * Pull site.
   */
  Site.prototype.pull = function(opts) {
    var self = this;
		// Run as a queued job.
		return self.queue('Pull site: ' + self.name, function() {
			// Get kbox core library.
			return kbox.then(function(kbox) {
				// Initialize app context.
				return kbox.app.get(self.name)
				.then(function(app) {
					return kbox.setAppContext(app);
				})
				// Do a pull on the site.
				.then(function() {
					var pull = kbox.integrations.get(self.providerName).pull();
					pull.on('ask', function(questions) {
						_.each(questions, function(question) {
							if (question.id === 'shouldPullFiles') {
								question.answer(opts.files);
							} else if (question.id === 'shouldPullDatabase') {
								question.answer(opts.database);
							} else {
								question.fail(new Error(question));
							}
						});
					});
					return pull.run(self.name);
				});
			});
		});
  };

	/*
	 * Push site.
	 */
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
      });
    });
  };

  // Static helper function to create from a kalabox app object.
  Site.fromApp = function(app) {
    return new Site({
      name: app.name,
      url: app.url,
      folder: app.root,
      codeFolder: app.config.codeRoot,
			providerInfo: app.config.pluginconfig[app.config.type]
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
