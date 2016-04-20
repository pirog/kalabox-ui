'use strict';

var EC = protractor.ExpectedConditions;

describe('sidebar module tests', function() {
  beforeEach(function() {
    browser.get('/dashboard');
    var addSite = $('div.site.add a');
    var isClickable = EC.elementToBeClickable(addSite);
    browser.wait(isClickable, 5000)
    .then(function() {
      addSite.click();
    });
  });
  afterEach(function() {
  });
  it('allow Pantheon sign-in', function() {
    $('ul.providers-next a').click().then(function() {
      var authPage = $('div.pantheon-authorization');
      var authPageLoaded = EC.presenceOf(authPage);
      return browser.wait(authPageLoaded, 5000);
    })
    .then(function() {
      return expect($('h4').getText()).toBe('AUTHENTICATE WITH PANTHEON');
    }).then(function() {
      $('input#authEmail').sendKeys(process.env.PANTHEON_USER);
      // Need to figure out secret key sending.
      $('input#authPassword').sendKeys(process.env.PANTHEON_PASSWORD);
      return $('button.btn-primary').click();
    }).then(function() {
      var loaderPresent = EC.presenceOf($('div.loader'));
      return browser.wait(loaderPresent, 5000);
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
