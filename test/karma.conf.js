// Karma configuration


module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      '../src/lib/vendor/bluebird/js/browser/bluebird.js',
      '../src/lib/vendor/jquery/dist/jquery.js',
      '../src/lib/vendor/d3/d3.js',
      '../src/lib/vendor/angular-ui-utils/modules/route/route.js',
      '../src/lib/vendor/angular/angular.js',
      '../src/lib/vendor/angular-ui-router/release/angular-ui-router.min.js',
      '../src/lib/vendor/angular-bootstrap/ui-bootstrap.min.js',
      '../src/lib/vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      '../src/lib/vendor/angular-bluebird-promises/dist/angular-bluebird-promises.js',
      '../src/lib/vendor/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
      '../src/lib/vendor/angular-mocks/angular-mocks.js',
      '../src/lib/vendor/ngMidwayTester/src/ngMidwayTester.js',
      '../src/modules/**/*.{js,html}'
    ],

    // list of files / patterns to exclude
    exclude: [
      '../src/modules/**/e2e/**/*.js'
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'NodeWebkit'
    ],

    // Which plugins to enable
    plugins: [
      'karma-chrome-launcher',
      'karma-nodewebkit-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-ng-html2js-preprocessor'
    ],


    // Preprocess tools
    preprocessors: {
      '../src/modules/**/*.js': 'coverage',
      '../src/modules/**/*.html': 'ng-html2js'
    },

    reporters: ['progress', 'coverage'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'



    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'src',
      // prepend this to the
      // prependPrefix: 'served/',


      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'templates'
    }
  });
};
