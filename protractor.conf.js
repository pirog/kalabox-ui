'use strict';

var path = require('path');
var pconfig = require('./test/pconfig');
var baseUrl = 'file://'+ path.resolve('build/index.html') + '#';

exports.config = {

  chromeDriver: './test/support/chromedriver',
  chromeOnly: true,
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: pconfig.devBinary
    }
  },

  specs: [
    'src/modules/*/e2e/*.spec.js'
  ],

  baseUrl: baseUrl,
  rootElement: 'body',

  onPrepare: function() {
    browser.resetUrl = 'file://';
    browser.driver.get('file://');
  }

};