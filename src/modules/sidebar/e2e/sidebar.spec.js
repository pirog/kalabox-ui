'use strict';

describe('sidebar module tests', function() {
  beforeEach(function() {
    browser.get('/dashboard');
    var addSite = $('div.site.add a');
    addSite.click();
  });
  afterEach(function() {
  });
  it('allow Pantheon sign-in', function() {
    $('ul.providers-next a').click().then(function() {
      return expect($('h4').getText())
      .toBe('AUTHENTICATE WITH PANTHEON');
    }).then(function() {
      $('input#authEmail').sendKeys(process.env.PANTHEON_USER);
      // Need to figure out secret key sending.
      $('input#authPassword').sendKeys(process.env.PANTHEON_PASSWORD);
      return $('button.btn-primary').click();
    }).then(function() {
      return expect($('.loader h4').getText())
      .toBe('AUTHENTICATING');
    });
  });
  /*
  it('shouldn\'t allow a blank Pantheon name', function() {
    var message = $('div.site.add h3');
    expect(message.getText()).toBe('Add new site');
  });
  */
});
