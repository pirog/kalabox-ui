'use strict';

var _ = require('lodash'),
  platform = require('os').platform(),
  raw_config = require('../../config/platform.json');

// reduce callback to get platform index
var getIndex = function(result, val, key) {
  if (result !== false) {
    return result;
  }
  return val == platform ? key : false;
};

// map callback to get a specific platform config.
var getConfig = function(options, key, config) {
  return [key, key == 'index' ? config.index : options[config.index]];
};

// set index
raw_config.index = _.reduce(raw_config.platform, getIndex, false);

// export a processed config
module.exports = _.object(_.map(raw_config, getConfig));
