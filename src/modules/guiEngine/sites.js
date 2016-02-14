'use strict';

angular.module('kalabox.sites', [])
/*
 * Class for encapsulating a site instance.
 */
.factory('Site', function(
  kbox,
  siteStates,
  _,
  providers,
  guiEngine,
  $q,
  path,
  fs
) {

  // Constructor.
  function Site(opts) {
    this.opts = opts;
    this.name = opts.name;
    this.url = opts.url;
    this.folder = opts.folder;
    this.codeFolder = opts.codeFolder;
    this.providerName = 'pantheon';
    this.providerInfo = opts.providerInfo;
    this.framework = opts.providerInfo.framework;
    this.busy = false;
    this.image = this.imageFilepath();
  }

  /*
   * Get fileath of image.
   */
  Site.prototype.imageFilepath = function() {
    return this.opts.folder ?
      path.join(this.opts.folder, 'screenshot.png') :
      this.opts.image;
  };

  /*
   * Call fn function within a gui engine queue.
   **/
  Site.prototype.queue = function(desc, fn) {
    var self = this;
    // Add job to queue.
    return guiEngine.queue.add(desc, function(update) {
      // Signal that site is busy.
      self.busy = true;
      // Call fn function.
      return $q.try(function() {
        return fn.call(self, update);
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
   * Take a screenshot of the site.
   */
  Site.prototype.takeScreenshot = function() {
    var self = this;
    // Where the screenshot should end up.
    var filepath = self.image;
    // where the screenshot should be created before being moved to filepath.
    var parsed = path.parse(filepath);
    parsed.base = '.' + parsed.name + '.downloading' + parsed.ext;
    var filepathTemp = path.format(parsed);
    // Options for screenshot.
    var opts = {
      windowSize: {
        width: 1024,
        height: 768
      },
      renderDelay: 1 * 1000,
      timeout: 60 * 1000
    };
    // Take screenshot.
    return Promise.fromNode(function(cb) {
      var webshot = require('webshot');
      webshot(self.url, filepathTemp, opts, cb);
    })
    // Make sure we have a reasonable timeout.
    .timeout(90 * 1000)
    // Rename temp file.
    .then(function() {
      return Promise.fromNode(function(cb) {
        return fs.rename(filepathTemp, filepath, cb);
      });
    })
    // Make sure we delete the temp file if it still exists.
    .finally(function() {
      return Promise.fromNode(function(cb) {
        fs.unlink(filepathTemp, cb);
      })
      // Ignore errors.
      .catch(function() {});
    })
    // Update image filepath with a timestamp so it reloads.
    .then(function() {
      var timestamp = new Date().getTime();
      self.image = self.imageFilepath() + '?' + timestamp;
    });
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
          return kbox.app.start(app);
        })
        .then(function() {
          /*
           * This is detached from the promise chain on purpose since it
           * shouldn't be holding up a response to the user that their
           * site has been started.
           */
          // Give the site 5 seconds for it to get itself started.
          $q.delay(5 * 1000)
          // Take a screenshot.
          .then(function() {
            return self.takeScreenshot();
          });
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
    return self.queue('Pulling site: ' + self.name, function(update) {
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
          // Update job's status message with info from pull.
          pull.on('update', function(msg) {
            update(msg.status);
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
    return self.queue('Pushing site: ' + self.name, function(update) {
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
            update(msg.status);
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
