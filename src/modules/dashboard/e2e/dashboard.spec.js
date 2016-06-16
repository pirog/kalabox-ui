'use strict';

describe('dashboard module tests', function() {
  beforeEach(function() {
    browser.get(browser.baseUrl + '#/dashboard');
  });
  afterEach(function() {
  });
  it('should have an add site button', function() {
    browser.get(browser.baseUrl + '#/dashboard');
    var message = $('div.site.add h3');
    expect(message.getText()).toBe('Add new site');
  });
  it('should link to the sidebar from add site button', function() {
    var addSite = $('div.site.add a');
    addSite.click().then(function() {
      var provider = $('h4');
      expect(provider.getText()).toEqual('ADD ACCOUNT');
    });
  });

});
