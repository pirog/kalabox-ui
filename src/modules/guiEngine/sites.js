'use strict';

angular.module('kalabox.sites', [])
/*
 * Class for encapsulating a site instance.
 */
.factory('Site', function(kbox, siteStates, _, providers, guiEngine, $q, path) {

  // Constructor.
  function Site(opts) {
    this.opts = opts;
    this.name = opts.name;
    this.machineName = opts.name.replace(/-/g, '');
    this.url = opts.url;
    this.folder = opts.folder;
    this.codeFolder = opts.codeFolder;
    this.providerName = 'pantheon';
    this.providerInfo = opts.providerInfo;
    this.framework = opts.providerInfo.framework;
    this.busy = false;
    this.update();
    this.environments = [];
  }

  /*
   * Update site properties.
   */
  Site.prototype.update = function() {
    // Update screenshot url.
    this.updateScreenshotUrl();
  };

  /*
   * Update screenshot image url.
   */
  Site.prototype.updateScreenshotUrl = function() {
    var timestamp = new Date().getTime();
    this.image = this.opts.folder ?
      path.join(this.opts.folder, 'screenshot.png') + '?' + timestamp :
      this.opts.image;
  };

  /*
   * Call fn function within a gui engine queue.
   **/
  Site.prototype.queue = function(desc, fn) {
    var self = this;
    // Add job to queue.
    return guiEngine.queue.add(desc, self, function(update) {
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
    return $q.resolve(siteStates.apps[self.machineName]);
  };

  /*
   * Get this sites provider.
   */
  Site.prototype.getProvider = function() {
    var self = this;
    return providers.get(self.providerName);
  };

  /*
   * Get list of site environments.
   */
  Site.prototype.getEnvironments = function() {
    var self = this;
    // Get provider.
    return self.getProvider()
    // Get list of provider's sites.
    .then(function(provider) {
      return provider.sites;
    })
    // Find provider site that matches this site.
    .then(function(sites) {
      var siteName = self.opts ? self.opts.providerInfo.site : self.name;
      return _.find(sites, function(site) {
        return site.name === siteName;
      });
    })
    // Throw error if site doesn't exist.
    .tap(function(site) {
      if (!site) {
        throw new Error('Site not found: ' + self.name);
      }
    })
    // Get list of environments for site.
    .then(function(site) {
      return site.getEnvironments();
    })
    // Cache environments.
    .tap(function(envs) {
      self.environments = envs;
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
        .then(function(app) {
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
  Site.prototype.remove = function() {
    var self = this;
    // Run as a queued job.
    return self.queue('Removing site: ' + self.name, function() {
      return kbox.then(function(kbox) {
        return kbox.app.get(self.name)
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
      codeFolder: app.config.sharing.codeRoot,
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
    return guiEngine.queue.add('Adding site: ' + opts.site,
      opts.site,
      function() {
      return kbox.then(function(kbox) {
        // Get config.
        var config = kbox.core.deps.get('globalConfig');
        // Option defaults.
        opts._ = opts._ || [];
        opts.h = opts.h || false;
        opts.v = opts.v || false;
        opts.versbose = opts.versbose || false;
        opts.needsFramework = opts.needsFramework || false;
        opts._type = opts.provider.name;
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

  // Constructor.
  function Sites() {
    this.sites = [];
  }

  // Add site.
  Sites.prototype.add = function(opts) {
    // Add a placeholder site so the user see it right away.
    placeHolders.add({
      name: opts.name
    });
    // Add site.
    return Site.add(opts);
  };

  // Update site list.
  Sites.prototype.update = function() {
    var self = this;
    return kbox.then(function(kbox) {

      // Get an up to date list of sites.
      return kbox.app.list({useCache: false})
      .map(Site.fromApp)
      .then(function(newSites) {

        // Add new site that we don't already have.
        _.each(newSites, function(newSite) {
          var found = _.find(self.sites, function(site) {
            return site.name === newSite.name;
          });
          if (!found) {
            // Add site.
            self.sites.push(newSite);
            // Sort site.
            self.sites = _.sortBy(self.sites, function(site) {
              return site.name;
            });
          }
        });

        // Remove sites that no longer exist.
        self.sites = _.filter(self.sites, function(site) {
          return !!_.find(newSites, function(newSite) {
            return newSite.name === site.name;
          });
        });

      });

    });

  };

  // Get list of sites.
  Sites.prototype.get = function(name) {
    var self = this;
    // Update site list.
    return this.update()
    // Return site list.
    .then(function() {
      if (name) {
        return self.sites[name];
      } else {
        return self.sites;
      }
    });
  };

  // Return class instance.
  return new Sites();

})
/*
 * Object for getting a cached list of site instance states.
 */
.factory('siteStates', function(kbox, _) {

  var events = require('events');
  var util = require('util');

  // Constructor.
  function SiteStates() {
    this.apps = {};
    events.EventEmitter.call(this);
    this.init();
  }
  // Inherit from event emitter.
  util.inherits(SiteStates, events.EventEmitter);

  // Initialize.
  SiteStates.prototype.init = function() {

    var self = this;

    return kbox.then(function(kbox) {

      // Map container id to container name.
      var mapId = _.memoize(function(id) {
        // Inspect container.
        return kbox.engine.inspect({containerID: id})
        // Return container name.
        .then(function(data) {
          return data.Name ? _.trim(data.Name, '/') : null;
        })
        // Ignore errors and return undefined.
        .catch(function(err) {
          console.log(err.message);
        });
      });

      // Promise chain for serializing events.
      var p = kbox.Promise.resolve();

      // Get list of containers.
      return kbox.engine.list()
      // Seed memoized map.
      .each(function(container) {
        return mapId(container.id);
      })
      // Get event stream.
      .then(function() {
        return kbox.engine.events();
      })
      .then(function(result) {

        // Set encoding so events give a string rather than a Buffer.
        result.setEncoding('utf8');

        // Handle data events from the result stream.
        result.on('data', function(data) {

          // Serialize events by adding to tail of promise chain.
          p = p.then(function() {
            // Run inside of a promise.
            return kbox.Promise.try(function() {

              // Parse data string into a json object.
              data = JSON.parse(data);

              // Get action.
              var action = _.get(data, 'status');
              // Get container id.
              var id = _.get(data, 'id');

              if (action && id) {

                // Get name of the container.
                return mapId(id)
                .then(function(name) {

                  // Split the container name into it's parts.
                  var parts = name ? name.split('_') : [];
                  // Get name of app from container name's first part.
                  var app = parts[0];
                  // Get container type from container name's second part.
                  var container = parts[1];

                  // Only events with a container of appserver are interesting.
                  if (parts.length === 3 && container === 'appserver') {
                    if (action === 'create') {
                      // App created, so add to list of app states.
                      self.apps[app] = false;
                      self.emit('create', app);
                      self.emit('update', self.apps);
                    } else if (action === 'start') {
                      // App started, set state to true.
                      self.apps[app] = true;
                      self.emit('start', app);
                      self.emit('update', self.apps);
                    } else if (action === 'destroy') {
                      self.emit('destroy', app);
                      self.emit('update', self.apps);
                    } else if (action === 'die' || action === 'stop') {
                      // App stopped, set state to false.
                      self.apps[app] = false;
                      self.emit('stop', app);
                      self.emit('update', self.apps);
                    }
                  }

                });

              }

            })
            // Ignore errors.
            .catch(function(err) {
              console.log(err.message);
              console.log(err.stack);
            });
          });

        });
      })
      // Ignore errors.
      .catch(function(err) {
        console.log(err.message);
        console.log(err.stack);
        throw err;
      });
    });
  };

  // Return singleton instance.
  return new SiteStates();

});
