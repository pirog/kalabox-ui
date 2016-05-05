'use strict';

describe('initialize module tests', function() {
  afterEach(function() {
  });
  it('should have initialize text', function() {
    browser.get('/initialize');
    var message = $('h1');
    expect(message.getText()).toBe('Starting the Kalabox engine...');
  });
});
