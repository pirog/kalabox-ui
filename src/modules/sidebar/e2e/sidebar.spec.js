'use strict';

var EC = protractor.ExpectedConditions;
var username = process.env.PANTHEON_USER;
var password = process.env.PANTHEON_PASSWORD;

function getToUserPantheonSites() {
   // Click on PANTHEON_USER's account.
  var account = element(by.cssContainingText('.provider-name', username));
  var accountClickable = EC.elementToBeClickable(account);
  return browser.wait(accountClickable, 5000).then(function() {
    return account.click();
  }).then(function() {
    // Wait for sites to load.
    var sitesLoaded = EC.presenceOf($('ul.provider-sites .new-site'));
    return browser.wait(sitesLoaded, 10000);
  });
}

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

  it('allow Pantheon sign-in', function() {
    var addPantheon = $('ul.providers-next a', 'Pantheon');
    var addPantheonClickable = EC.elementToBeClickable(addPantheon);
    browser.wait(addPantheonClickable, 5000).then(function() {
      return addPantheon.click();
    }).then(function() {
      var authPage = $('div.pantheon-authorization');
      var authPageLoaded = EC.presenceOf(authPage);
      return browser.wait(authPageLoaded, 5000);
    }).then(function() {
      return expect($('h4').getText()).toBe('AUTHENTICATE WITH PANTHEON');
    }).then(function() {
      $('input#authEmail').sendKeys(username);
      // Need to figure out secret key sending.
      $('input#authPassword').sendKeys(password);
      return $('button.btn-primary').click();
    }).then(function() {
      var loaderPresent = EC.presenceOf($('div.loader'));
      return browser.wait(loaderPresent, 5000);
    }).then(function() {
      return expect($('.loader h4').getText())
      .toBe('AUTHENTICATING');
    }).then(function() {
      var backToSidebar = EC.presenceOf($('h4.add-account'));
      return browser.wait(backToSidebar, 5000);
    });
  });

  it('show sites associated with PANTHEON_USER', function() {
    getToUserPantheonSites().then(function() {
      // @todo: May want to verify specific sites show up.
      return element.all(by.css('ul.provider-sites .new-site'))
      .getText().then(function(providerSites) {
        return expect(providerSites.length).toBeGreaterThan(3);
      });
    });
  });

  it('don\t allow a blank Pantheon sitename', function() {
    // Click on the kalabox-drupal8.
    getToUserPantheonSites().then(function() {
      var site = element(by.cssContainingText('.new-site', 'kalabox-drupal8'));
      return site.click();
    })
    .then(function() {
      // Wait for the form.
      var siteAddFormPresent = EC.presenceOf($('div.authForm'));
      return browser.wait(siteAddFormPresent, 5000);
    })
    .then(function() {
      // Try submitting the form blank.
      var sitenameInput = $('#appName');
      sitenameInput.sendKeys('');
      // Make sure submit is not clickable
      var submit = element(by.buttonText('Submit'));
      return expect(EC.not(EC.elementToBeClickable(submit)));
    });
  });

/*
  it('pull down a Drupal 8 site from Pantheon', function() {
    getToUserPantheonSites.then(functin() {

    });
  });
*/
});
