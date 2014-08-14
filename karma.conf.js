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
      './src/lib/vendor/jquery/dist/jquery.js',
      './src/lib/vendor/d3/d3.js',
      './src/lib/vendor/angular/angular.js',
      './src/lib/vendor/angular-route/angular-route.js',
      './src/lib/vendor/angular-bootstrap/ui-bootstrap.js',
      './src/lib/vendor/angular-mocks/angular-mocks.js',
      './src/lib/vendor/ngMidwayTester/src/ngMidwayTester.js',
      './src/app*.js',
      './src/modules/**/*.js',
    ],

    // list of files / patterns to exclude
    exclude: [
      './src/modules/**/e2e/**/*.js'
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
      'Chrome'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-coverage'
    ],


    // Preprocess tools
    preprocessors: {
      'src/modules/**/*.js': 'coverage'
    },


    reporters: ['coverage'],

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },
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

  });
};
