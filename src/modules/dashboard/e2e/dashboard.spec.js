'use strict';

describe('dashboard module tests', function() {
  beforeEach(function() {
    browser.get('/dashboard');
  });
  afterEach(function() {
  });
  it('should have an add site button', function() {
    browser.get('/dashboard');
    var message = $('div.site.add h3');
    expect(message.getText()).toBe('Add new site');
  });
  it('should link to the sidebar from add site button', function() {
    browser.get('/dashboard');
    var addSite = element(by.css('div.site.add a'));
    addSite.click().then(function() {
      var provider = element(by.binding('provider.displayName'));
      expect(provider.getText()).toEqual('Pantheon');
    });

  });

});
