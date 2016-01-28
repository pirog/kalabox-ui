'use strict';

angular.module('kalabox.dashboard')
.factory('Provider', function(kbox, _) {

	/*
	 * [Constructor].
	 */
	function Provider(opts) {

		// Required.
		this.integration = opts.integration;
		this.name = opts.integration.name;

		// Optional.
		this.username = opts.username;

		// Init.
		this.sites = [];
		this.refreshing = false;
		this.displayName = this.username ?
			this.name + '(' + this.name + ')' :
			this.name;

	}

	/*
	 * Refresh provider's state.
	 */
	Provider.prototype.refresh = function() {
		var self = this;
		// Refresh sites.
		return kbox.Promise.try(function() {
			// Clear list of sites.
			self.sites = [];
			// Signal provider is refreshing.
			self.refreshing = true;
			var sites = self.integration.sites();
			/*sites.on('ask', function() {
			
			});*/
			// Get list of sites.
			return sites.run()
			// Map sites.
			.map(function(site) {
				self.sites.push({
					name: site.name,
					environments: site.environments
				});
			});
		})
		// Make sure we signal that we are no longer refreshing.
		.finally() {
			self.refreshing = false;
		})
		// Return list of sites.
		.return(self.sites);
	};

	/*
	 * [STATIC] Get a list of providers.
	 */
	Provider.list = function() {
		// Get list of integrations.
		return kbox.then(function() {
			return _.values(kbox.integrations.get());
		})
		// Map each integration into a list of providers.
		.map(function(integration) {
			// Get list of usersnames for this integration.
			return integration.logins.run().then(function(usernames) {
				// Add an empty username for the default provider.
				usernames.push();
				// Reverse list of usernames.
				usersnames.reverse();
				// Return usersnames.
				return usernames;
			})
			// Map usernames to providers.
			.map(function(username) {
				return new Provider({
					integration: integration,
					username: username
				});
			});
		});
	};

	// Return constructor.
	return Provider;

});
