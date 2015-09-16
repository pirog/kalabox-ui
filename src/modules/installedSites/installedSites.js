'use strict';

angular.module('kalabox.installedSites', [])
.factory('installedSitesService', function($q, kbox) {

  function getApps(kbox) {
    return kbox.app.list();
  }

  function getAppStateMap(kbox, apps) {

    var map = {};

    return $q.map(apps, function(app) {
      return kbox.engine.list(app.name)
      .each(function(container) {
        if (!map[app.name]) {
          return kbox.engine.isRunning(container.name)
          .then(function(isRunning) {
            map[app.name] = isRunning;
          });
        }
      });
    })
    .then(function() {
      return function(app) {
        if (map[app] === undefined) {
          return false;
        }
        return map[app];
      };
    });

  }

  function getAll() {

    return kbox.then(function(kbox) {

      return getApps(kbox).then(function(apps) {
        return getAppStateMap(kbox, apps)
        .then(function(appStateMap) {
          return $q.map(apps, function(app) {
            return {
              name: app.name,
              state: appStateMap(app.name),
              url: app.url,
              root: app.root
            };
          });
        });
      });

    });

  }

  return {
    getAll: getAll
  };
});
