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
            "name": "Some App",
            "image": "blank"
          },
          {
            "name": "Other App",
            "image": "blank"
          }
        ]
      );
    };

    $delegate.states = [
          {
            "name": "Some App",
            "image": "blank"
          },
          {
            "name": "Other App",
            "image": "blank"
          }
        ];
    return $delegate;
  });
})(angular);
