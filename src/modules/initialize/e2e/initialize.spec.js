'use strict';

var EC = protractor.ExpectedConditions;

describe('initialize module tests', function() {
  afterEach(function() {
  });
  it('should have initialize text', function() {
    browser.get('/initialize');
    var message = $('h1');
    var messagePresent = EC.presenceOf(message);
    return browser.wait(messagePresent).then(function() {
      expect(message.getText()).toBe('Starting the Kalabox engine...');
    });
  });
});
