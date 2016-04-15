'use strict';

var path = require('path');
var pconfig = require('./pconfig');
var baseUrl = 'file://'+ path.resolve('../src/index.html') + '#';

exports.config = {

  chromeDriver: './support/chromedriver',
  chromeOnly: true,
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: pconfig.devBinary
    }
  },

  specs: [
    './e2e/**/*.spec.js',
    '../src/modules/*/e2e/**/*.spec.js'
  ],

  baseUrl: baseUrl,
  rootElement: 'body',

  onPrepare: function() {
    browser.resetUrl = 'file://';
    browser.driver.get('file://');
  }

};
