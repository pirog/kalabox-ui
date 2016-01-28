'use strict';

(function(ng) {
  if (!document.URL.match(/\?nobackend$/)) {
    return; // do nothing special - this app is not gonna use stubbed backend
  }

  console.log('======== ACHTUNG!!! USING STUBBED BACKEND ========');

  ng.module('kalabox')
  .decorate('installedSitesService', function($delegate){
    $delegate.sites = function() {
      return Promise.resolve([
          {
            name: "cvt",
            image: "https://s3.amazonaws.com/pantheon-screenshots/183a4fd4-9ab4-4077-881d-e8468881e874_dev.png",
            provider: 'pantheon',
            framework: 'drupal',
            trash: function() {
              return true;
            }
          },
          {
            name: "csi-auth-proxy",
            image: "https://s3.amazonaws.com/pantheon-screenshots/d043b070-5f68-43c6-a7a7-0be09c1a9dcd_dev.png",
            provider: 'pantheon',
            framework: 'drupal',
            trash: function() {
              return true;
            }
          },
          {
            name: "The Clayman Institute for Gender Research",
            image: "https://s3.amazonaws.com/pantheon-screenshots/cf21d683-36f4-4caa-a2b5-cc66524bbb4d_dev.png",
            provider: 'pantheon',
            framework: 'drupal',
            trash: function() {
              return true;
            }
          }
        ]
      );
    };

    $delegate.states = function() {
      return [
          {
            "name": "Some App",
            "image": "blank"
          },
          {
            "name": "Other App",
            "image": "blank"
          }
        ];
    };
    return $delegate;
  });
})(angular);
