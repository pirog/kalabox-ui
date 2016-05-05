v0.12.16
========

#### Bug fixes

* Fixed bug where apps being created in parallel weren't properly showing status message updates. [#1276](https://github.com/kalabox/kalabox/issues/1276)
* Lazy loading siteStates service to prevent a race condition around starting the engine. [#1314](https://github.com/kalabox/kalabox/issues/1314)
* Update start screen copy and animation. [#1260](https://github.com/kalabox/kalabox/issues/1260)

v0.12.15
========

#### New Features

* Updated our development process with new contribution guidelines and standards [#1236](https://github.com/kalabox/kalabox/issues/1236)
* Provide new progress bar and messaging on performing actions on sites. [#1256](https://github.com/kalabox/kalabox/issues/1256)
* Provide internal connection info for DB configuration. [#1230](https://github.com/kalabox/kalabox/issues/1230)

#### Bug fixes

* Changed GUI to pre-load sites before navigating to the dashboard so sites are available immediately. [#1229](https://github.com/kalabox/kalabox/issues/1229)
* Prevented submission of site create form if no site name is submitted or the site name already exists on Kalabox. [#1258](https://github.com/kalabox/kalabox/issues/1258)
* Changed error modal angular repeater to track by index due to sometimes duplicate errors being added. [#1291](https://github.com/kalabox/kalabox/issues/1291)
