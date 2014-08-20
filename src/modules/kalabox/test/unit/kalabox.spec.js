'use strict';

describe('service', function() {
  beforeEach(module('kalabox'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('2.0');
    }));
  });
});