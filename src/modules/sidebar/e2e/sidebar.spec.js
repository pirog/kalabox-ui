'use strict';

var EC = protractor.ExpectedConditions;
var username = process.env.PANTHEON_USER;
var password = process.env.PANTHEON_PASSWORD;

function getToUserPantheonSites() {
   // Click on PANTHEON_USER's account.
  var account = element(by.cssContainingText('.provider-name', username));
  var accountClickable = EC.elementToBeClickable(account);
  return browser.wait(accountClickable).then(function() {
    return account.click();
  }).then(function() {
    // Wait for sites to load.
    var sitesLoaded = EC.presenceOf($('ul.provider-sites .new-site'));
    return browser.wait(sitesLoaded);
  });
}

function createPantheonDrupal8Form() {
  return getToUserPantheonSites().then(function() {
    var site = element(by.cssContainingText('.new-site', 'kalabox-drupal8'));
    return site.click();
  })
  .then(function() {
    // Wait for the form.
    var siteAddFormPresent = EC.presenceOf($('div.app-create-pantheon'));
    return browser.wait(siteAddFormPresent);
  });
}

function createD8Site(siteName, siteEnv) {
  return createPantheonDrupal8Form().then(function() {
    // Insert sitename
    var sitenameInput = $('#appName');
    sitenameInput.clear().then(function() {
      sitenameInput.sendKeys(siteName);
    });

    // Insert environment
    element(by.cssContainingText('#appEnv option', siteEnv)).click();

    // Try submitting the form.
    return element(by.buttonText('Submit')).click();
  });
}

function openSidebar() {
  var addSite = $('div.site.add a');
  var isClickable = EC.elementToBeClickable(addSite);
  return browser.wait(isClickable).then(function() {
    browser.sleep(5000);
    addSite.click();
  });
}

/*function showsProgress() {
  // Both progress bar and messages shown on at least one site.
  var progressBar = $('.site-wrapper .progress-bar');
  var progressBarShown = EC.presenceOf(progressBar);
  var messages = $('.site-wrapper h3.site-action');
  var messageShown = EC.presenceOf(messages);
  return browser.wait(EC.and(progressBarShown, messageShown));
}*/

/*function findSite(siteName) {
  var newSiteH3 = element(by.cssContainingText('.site-name', siteName));
  return newSiteH3.element(by.xpath('..'));
}*/

describe('sidebar module tests', function() {
  beforeEach(function() {
    console.log('foo');
    browser.get('/dashboard');
    openSidebar();
  });

  it('allow Pantheon sign-in', function() {
    var addPantheon = $('ul.providers-next a', 'Pantheon');
    var addPantheonClickable = EC.elementToBeClickable(addPantheon);
    browser.wait(addPantheonClickable).then(function() {
      return addPantheon.click();
    }).then(function() {
      var authPage = $('div.pantheon-authorization');
      var authPageLoaded = EC.presenceOf(authPage);
      return browser.wait(authPageLoaded);
    }).then(function() {
      return expect($('h4').getText()).toBe('AUTHENTICATE WITH PANTHEON');
    }).then(function() {
      $('input#authEmail').sendKeys(username);
      // Need to figure out secret key sending.
      $('input#authPassword').sendKeys(password);
      return $('button.btn-primary').click();
    }).then(function() {
      var loaderPresent = EC.presenceOf($('div.loader'));
      return browser.wait(loaderPresent);
    }).then(function() {
      return expect($('.loader h4').getText())
      .toBe('AUTHENTICATING');
    }).then(function() {
      var backToSidebar = EC.presenceOf($('h4.add-account'));
      return browser.wait(backToSidebar);
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
    createPantheonDrupal8Form().then(function() {
      // Try submitting the form blank.
      var sitenameInput = $('#appName');
      sitenameInput.sendKeys('');
      // Make sure submit is not clickable
      var submit = element(by.buttonText('Submit'));
      return expect(EC.not(EC.elementToBeClickable(submit)));
    });
  });

  it('can pull down a Pantheon D8 site', function() {
    console.log('testing-1 ' + new Date());
    var siteName = 'testd8site';
    var siteEnv = 'dev';
    createD8Site(siteName, siteEnv)
    /*.then(function() {
      console.log('testing-2 ' + new Date());
      // Start creating.
      return browser.wait(protractor.until.elementLocated(
        by.css('.site-wrapper.overlay-active')));
    })*/
    /*.then(function() {
      console.log('testing-3 ' + new Date());
      // Make sure progress bar shows up.
      return showsProgress();
    })*/
    .then(function() {
      console.log('testing-4 ' + new Date());
      // Wait until done creating.
      var busySites = $('.site-wrapper.overlay-active');
      var noBusySites = EC.not(EC.presenceOf(busySites));
      return browser.wait(noBusySites);
    }).then(function() {
      console.log('testing-5 ' + new Date());
      // Check for presence of new site.
      var newSite = element(by.cssContainingText('.site-name', siteName));
      var newSiteExists = EC.presenceOf(newSite);
      return expect(newSiteExists);
    });
  });

  /*it('throw error on trying to use a taken app name', function() {
    var siteName = 'testd8site';
    var siteEnv = 'dev';

      // Try pulling same site with same name.
    createD8Site(siteName, siteEnv).then(function() {
      // Should receive a validation error.
      var errorPresent = EC.presenceOf($('.app-create-pantheon .alert-error'));
      return browser.wait(errorPresent);
    });
  });*/

  /*it('app has connection info', function() {
    var siteName = 'cvtenrollee';

    // Open connection modal.
    var newSite = findSite(siteName);
    newSite.element(by.css('.site-actions-dropdown')).click().then(function() {
      return newSite.element(by.css('.site-connection')).click();
    }).then(function() {
      var databaseFields = element.all(by.css('.service.database input'));
      return databaseFields.getText();
    }).then(function(databaseText) {
      console.log(databaseText);
      expect(databaseText.count()).toEqual(11);
    });
  });*/
});
