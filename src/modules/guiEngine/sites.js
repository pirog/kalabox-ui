'use strict';

angular.module('kalabox.sites', [])
/*
 * Class for encapsulating a site instance.
 */
.factory('Site', function(kbox, siteStates, _, providers, guiEngine, $q, path,
  $window) {

  // Constructor.
  function Site(opts) {
    this.name = opts.name;
    this.url = opts.url;
    this.folder = opts.folder;
    this.codeFolder = opts.codeFolder;
    this.image = opts.folder ?
      path.join(opts.folder, 'screenshot.png') :
      opts.image;
    this.providerName = 'pantheon';
    this.providerInfo = opts.providerInfo;
    this.framework = opts.providerInfo.framework;
    this.busy = false;
    this.currentAction = false;
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
      return $q.try(function() {
        return fn.call(self);
      })
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
    // Run as a queued job.
    return self.queue('Starting site: ' + self.name, function() {
      return kbox.then(function(kbox) {
        return kbox.app.get(self.name)
        .tap(function(app) {
          return kbox.setAppContext(app);
        })
        .then(function(app) {
          //self.currentAction = 'start';
          return kbox.app.start(app);
        });
      });
    });
  };

  /*
   * Stop site.
   */
  Site.prototype.stop = function() {
    var self = this;
    // Run as a queued job.
    return self.queue('Stopping site: ' + self.name, function() {
      return kbox.then(function(kbox) {
        return kbox.app.get(self.name)
        .tap(function(app) {
          return kbox.setAppContext(app);
        })
        .then(function(app) {
          //self.currentAction = 'stop';
          return kbox.app.stop(app);
        });
      });
    });
  };

  /*
   * Pull site.
   */
  Site.prototype.pull = function(opts) {
    var self = this;
    // Run as a queued job.
    return self.queue('Pulling site: ' + self.name, function() {
      // Get reference to job.
      var job = this;
      // Get kbox core library.
      return kbox.then(function(kbox) {
        // Initialize app context.
        return kbox.app.get(self.name)
        .then(function(app) {
          return kbox.setAppContext(app);
        })
        // Do a pull on the site.
        .then(function() {
          self.currentAction = 'pull';
          var pull = kbox.integrations.get(self.providerName).pull();
          // Update job's status message with info from pull.
          pull.on('update', function(msg) {
            job.statusMsg = msg;
          });
          return pull.run(opts);
        });
      });
    });
  };

  /*
   * Push site.
   */
  Site.prototype.push = function(opts) {
    var self = this;
    // Run as a queued job.
    return self.queue('Pushing site: ' + self.name, function() {
      // Get reference to job.
      var job = this;
      // Get kbox core library.
      return kbox.then(function(kbox) {
        // Initialize app context.
        return kbox.app.get(self.name)
        .then(function(app) {
          return kbox.setAppContext(app);
        })
        // Do a pull on the site.
        .then(function() {
          var push = kbox.integrations.get(self.providerName).push();
          // Update job's status message with info from push.
          push.on('update', function(msg) {
            job.statusMsg = msg;
          });
          return push.run(opts);
        });
      });
    });
  };

  /*
   * Remove site.
   */
  Site.prototype.trash = function() {
    var self = this;
    // Run as a queued job.
    return self.queue('Removing site: ' + self.name, function() {
      return kbox.then(function(kbox) {
        return kbox.app.get(self.name)
        .tap(function(app) {
          return kbox.setAppContext(app);
        })
        .then(function(app) {
          self.currentAction = 'delete';
          return kbox.app.destroy(app);
        });
      });
    });
  };

  // Static helper function to create from a kalabox app object.
  Site.fromApp = function(app) {
    return new Site({
      name: app.name,
      url: app.url,
      folder: app.root,
      codeFolder: app.config.syncthing.codeRoot,
      providerInfo: app.config.pluginconfig[app.config.type]
    });
  };

  Site.fromPlaceHolder = function(opts) {
    var site = new Site({
      name: opts.name,
      url: null,
      folder: null,
      codeFolder: null,
      image: 'images/kalabox/screenshot.png',
      providerInfo: {
        framework: 'drupal'
      }
    });
    site.currentAction = 'start';
    site.isPlaceHolder = true;
    return site;
  };

  /*
   * Static function for adding a site.
   */
  Site.add = function(opts) {
    // Add job to queue.
    return guiEngine.queue.add('Adding site: ' + opts.site, function() {
      return kbox.then(function(kbox) {
        // Make sure to delete app based dependencies.
        kbox.core.deps.remove('app');
        kbox.core.deps.remove('appConfig');
        // Get config.
        var config = kbox.core.deps.get('globalConfig');
        // Option defaults.
        opts._ = opts._ || [];
        opts.h = opts.h || false;
        opts.v = opts.v || false;
        opts.versbose = opts.versbose || false;
        opts.needsFramework = opts.needsFramework || false;
        opts.dir = opts.dir || config.appsRoot;
        // Get app.
        var app = kbox.create.get(opts.provider.name);
        // Create app.
        return kbox.create.createApp(app, opts);
      })
      .then(function() {
        $window.alert('App done being added.');
      })
      .catch(function(err) {
        $window.alert(err.message);
      });
    });
  };

  return Site;

})
.factory('placeHolders', function(_, $q) {

  var singleton = {};

  return {
    add: function(opts) {
      singleton[opts.name] = opts;
    },
    remove: function(name) {
      return this.get(name)
      .then(function(exists) {
        if (exists) {
          delete singleton[name];
        }
      });
    },
    get: function(name) {
      var sites = _.reduce(singleton, function(acc, elt) {
        acc.push(elt);
        return acc;
      }, []);
      return $q.try(function() {
        if (name) {
          return _.find(sites, function(site) {
            return site.name === name;
          });
        } else {
          return sites;
        }
      });
    }
  };

})
/*
 * Object for getting a cached list of site instances.
 */
.factory('sites', function(kbox, Site, placeHolders, _) {
  var refreshFlag = true;
  return {
    // Returns true if list of sites should be refreshed.
    needsRefresh: function() {
      return refreshFlag;
    },
    // Resets the needs refresh flag.
    resetNeedsRefresh: function() {
      refreshFlag = false;
    },
    // Add a site.
    add: function(opts) {
      // Add a placeholder site so the user see it right away.
      placeHolders.add({
        name: opts.name
      });
      // Set refresh flag.
      refreshFlag = true;
      // Add site.
      return Site.add(opts);
    },
    get: function(name) {
      return kbox.then(function(kbox) {

        // Get list of apps.
        var sites = kbox.app.list()
        // Only include apps with installed containers.
        .filter(function(/*app*/) {
          return true;
          //return kbox.app.isInstalled(app);
        })
        // Map to sites.
        .map(Site.fromApp);

        // Get list of place holder sites.
        var placeHolderSites = sites.then(function(sites) {
          return placeHolders.get()
          .map(Site.fromPlaceHolder)
          .filter(function(placeHolder) {
            return !_.find(sites, function(site) {
              var filterOut = placeHolder.name === site.name;
              if (filterOut) {
                site.currentAction = placeHolder.currentAction;
                placeHolders.remove(site.name);
              }
              return filterOut;
            });
          });
        });

        // Concat sites and place holder sites.
        return kbox.Promise.join(
          sites,
          placeHolderSites,
          function(sites, placeHolderSites) {
            return _.flatten([sites, placeHolderSites]);
          })
        // Sort sites by site names.
        .then(function(sites) {
          return _.sortBy(sites, function(site) {
            return site.name;
          });
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
