'use strict';

var EC = protractor.ExpectedConditions;
var username = process.env.PANTHEON_USER;
var password = process.env.PANTHEON_PASSWORD;

function closeSidebar() {
  var sidebar = element.all(by.css('#addSite')).first();
  return sidebar.isDisplayed().then(function(sidebarIsDisplayed) {
    if (sidebarIsDisplayed) {
      var closeSidebarX = $('.fa-times');
      var isClickable = EC.elementToBeClickable(closeSidebarX);
      return browser.wait(isClickable, 10 * 1000).then(function() {
        return browser.sleep(1 * 1000)
        .then(function() {
          return closeSidebarX.click();
        });
      });
    }
  });
}

function openSidebar() {
  return closeSidebar()
  .then(function() {
    return browser.sleep(1 * 1000);
  })
  .then(function() {
    var sidebar = element.all(by.css('#addSite')).first();
    return sidebar.isDisplayed().then(function(sidebarIsDisplayed) {
      if (!sidebarIsDisplayed) {
        var addSite = $('div.site.add a');
        var isClickable = EC.elementToBeClickable(addSite);
        return browser.wait(isClickable, 10 * 1000).then(function() {
          return browser.sleep(1 * 1000).then(function() {
            return addSite.click();
          });
        });
      }
    });
  });
}

function findSite(siteName) {
  var newSiteH3 = element(by.cssContainingText('.site-name', siteName));
  return newSiteH3.element(by.xpath('..'));
}

function waitOnSiteAction(siteName) {

  return browser.sleep(5 * 1000)
  .then(function() {
    var site = findSite(siteName);
    expect(site.isPresent()).toEqual(true);
    // Wait until done creating.
    var busySite = element(by.cssContainingText(
      '.site-wrapper.overlay-active',
      siteName
    ));
    var noBusySite = EC.not(EC.presenceOf(busySite));
    return browser.wait(noBusySite)
    .then(function() {
      return browser.sleep(3 * 1000);
    })
    .then(function() {
      return browser.wait(noBusySite);
    });
  });

}

function getToUserPantheonSites() {
   // Click on PANTHEON_USER's account.
  var account = element(by.cssContainingText('.provider-name', username));

  function doit() {
    var accountClickable = EC.elementToBeClickable(account);
    return browser.wait(accountClickable).then(function() {
      return browser.sleep(1 * 1000)
      .then(function() {
        return account.click();
      });
    }).then(function() {
      // Wait for sites to load.
      var sitesLoaded = EC.presenceOf($('ul.provider-sites'));
      return browser.wait(sitesLoaded);
    });
  }

  return openSidebar()
  .then(function() {
    var newSiteList = $("ul.provider-sites");
    return newSiteList.isPresent().then(function(isPresent) {
      if (!isPresent) {
        return doit();
      } else {
        return newSiteList.isDisplayed().then(function(isDisplayed) {
          if (!isDisplayed) {
            return doit();
          }
        });
      }
    });
  });

}

function createPantheonSiteForm(opts) {
  return getToUserPantheonSites().then(function() {
    return browser.sleep(1 * 1000)
    .then(function() {
      return element(by.cssContainingText('.new-site', opts.pantheonSiteName))
      .click();
    });
  })
  .then(function() {
    // Wait for the form.
    var siteAddFormPresent = EC.presenceOf($('div.app-create-pantheon'));
    return browser.wait(siteAddFormPresent);
  });
}

function createD8Site(siteName, siteEnv) {
  var opts = {
    pantheonSiteName: 'kalabox-drupal8'
  };
  return createPantheonSiteForm(opts)
  .then(function() {
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

function createPantheonSite(opts) {
  return createPantheonSiteForm(opts)
  .then(function() {
    var sitenameInput = $('#appName');
    var envDropdown = $('#appEnv');
    var submitButton = element(by.buttonText('Submit'));
    return sitenameInput.clear()
    .then(function() {
      return sitenameInput.sendKeys(opts.siteName);
    })
    .then(function() {
      return envDropdown.element(by.cssContainingText('option', opts.siteEnv))
      .click();
    })
    .then(function() {
      return browser.sleep(1 * 1000);
    })
    .then(function() {
      return submitButton.click();
    });
  });
}

function getSite(siteName) {
  return browser.sleep(1 * 1000)
  .then(function() {
    var newSiteH3 = element(by.cssContainingText('.site-name', siteName));
    return newSiteH3.element(by.xpath('..'));
  });
}

function siteExists(siteName) {
  return getSite(siteName)
  .then(function(site) {
    if (site) {
      return site.isPresent();
    } else {
      return false;
    }
  });
}

function ensureSiteExists(siteName) {
  return getSite(siteName)
  .then(function() {
    return expect(siteExists(siteName)).toEqual(true);
  });
}

function createPantheonSiteWait(opts) {
  return createPantheonSite(opts)
  .then(function() {
    return waitOnSiteAction(opts.siteName);
  })
  .then(function() {
    return ensureSiteExists(opts.siteName);
  });
}

function removeSite(siteName) {
  return getSite(siteName)
  .then(function(site) {
    return site.element(by.css('.site-actions-dropdown')).click()
    .then(function() {
      return browser.sleep(1 * 1000);
    })
    .then(function() {
      return site.element(by.css('.fa-trash-o')).click();
    })
    .then(function() {
      return browser.sleep(5 * 1000);
    })
    .then(function() {
      var input = $('#appNameRemove');
      return input.click()
      .then(function() {
        return input.sendKeys(siteName);
      });
    })
    .then(function() {
      return browser.sleep(2 * 1000);
    })
    .then(function() {
      return element(by.cssContainingText('.btn-primary', 'Remove')).click();
    })
    .then(function() {
      return browser.sleep(3 * 1000);
    });
  });
}

describe('sidebar module tests', function() {

  beforeAll(function(done) {
    return browser.sleep(15 * 1000)
    .then(function() {
      return browser.get('/initialize');
    })
    .then(function() {
      var addSite = $('div.site.add a');
      return browser.wait(EC.presenceOf(addSite));
    })
    .then(function() {
      done();
    });
  });

  beforeEach(function(done) {
    return browser.sleep(1 * 1000)
    .then(function() {
      return closeSidebar();
    })
    .then(function() {
      return browser.sleep(1 * 1000);
    })
    .then(done);
  });

  it('allow Pantheon sign-in', function() {
    var addPantheon = $('ul.providers-next a', 'Pantheon');
    var addPantheonClickable = EC.elementToBeClickable(addPantheon);
    return openSidebar()
    .then(function() {
      return browser.wait(addPantheonClickable);
    })
    .then(function() {
      return addPantheon.click();
    })
    .then(function() {
      var authPage = $('div.pantheon-authorization');
      var authPageLoaded = EC.presenceOf(authPage);
      return browser.wait(authPageLoaded);
    })
    .then(function() {
      return expect($('h4').getText()).toBe('AUTHENTICATE WITH PANTHEON');
    })
    .then(function() {
      $('input#authEmail').sendKeys(username);
      // Need to figure out secret key sending.
      $('input#authPassword').sendKeys(password);
      return $('button.btn-primary').click();
    })
    .then(function() {
      var loaderPresent = EC.presenceOf($('div.loader'));
      return browser.wait(loaderPresent);
    })
    .then(function() {
      return expect($('.loader h4').getText())
      .toBe('AUTHENTICATING');
    })
    .then(function() {
      var backToSidebar = EC.presenceOf($('h4.add-account'));
      return browser.wait(backToSidebar);
    });
  }, 30 * 1000);

  it('show sites associated with PANTHEON_USER', function() {
    return getToUserPantheonSites().then(function() {
      return browser.sleep(2 * 1000)
      .then(function() {
        // @todo: May want to verify specific sites show up.
        return element.all(by.css('ul.provider-sites .new-site'))
        .getText().then(function(providerSites) {
          return expect(providerSites.length).toBeGreaterThan(3);
        });
      });
    });
  }, 30 * 1000);

  it('dont allow a blank Pantheon sitename', function() {
    // Click on the kalabox-drupal8.
    var opts = {
      pantheonSiteName: 'kalabox-drupal8'
    };
    return createPantheonSiteForm(opts)
    .then(function() {
      return browser.sleep(2 * 1000);
    })
    .then(function() {
      // Try submitting the form blank.
      // Get site name input.
      var sitenameInput = $('#appName');
      // Clear the site name input.
      sitenameInput.clear();
      // Make sure site name input is set to empty string.
      expect(sitenameInput.getAttribute('value')).toEqual('');
      // Set env to dev.
      element(by.cssContainingText('#appEnv option', 'dev')).click();
      // Make sure env is set to dev.
      expect($('#appEnv').getAttribute('value')).toEqual('dev');
      // Make sure submit is not clickable
      var submit = element(by.buttonText('Submit'));
      return expect(EC.not(EC.elementToBeClickable(submit)));
    });
  }, 30 * 1000);

  it('can pull down a pantheon site', function() {
    var opts = {
      siteName: 'testpantheonsite',
      siteEnv: 'dev',
      pantheonSiteName: 'kalabox-drupal8'
    };
    return createPantheonSiteWait(opts);
  });

  it('can remove a site', function() {
    var siteName = 'testpantheonsite';
    return removeSite(siteName)
    .then(function() {
      return waitOnSiteAction(siteName);
    });
  });

  it('can pull down sites in parallel', function() {
    var sites = [
      {
        siteName: 'unicornsite1',
        siteEnv: 'dev',
        pantheonSiteName: 'kalabox-drupal8'
      },
      {
        siteName: 'unicornsite2',
        siteEnv: 'dev',
        pantheonSiteName: 'kalabox-drupal8'
      }
    ];
    return createPantheonSite(sites[0])
    .then(function() {
      return browser.sleep(2 * 1000);
    })
    .then(function() {
      return createPantheonSite(sites[1]);
    })
    .then(function() {
      return waitOnSiteAction(sites[0].siteName);
    })
    .then(function() {
      return waitOnSiteAction(sites[1].siteName);
    })
    .then(function() {
      return ensureSiteExists(sites[0].siteName);
    })
    .then(function() {
      return ensureSiteExists(sites[1].siteName);
    });
  });

});
