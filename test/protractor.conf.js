'use strict';

var path = require('path');
var baseUrl = 'file://'+ path.resolve('../src/index.html') + '#';

exports.config = {

  chromeDriver: './support/chromedriver',
  chromeOnly: true,

  specs: [
    './e2e/**/*.spec.js',
    '../src/modules/*/test/e2e/**/*.spec.js'
  ],

  baseUrl: baseUrl,
  rootElement: 'body',

  onPrepare: function() {
    browser.resetUrl = 'file://';
    browser.driver.get('file://');
  }

};
