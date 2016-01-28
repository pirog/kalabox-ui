'use strict';

angular.module('kalabox.dashboard')
.factory('providers', function(Provider) {
	return {
		list: Provider.list
	};
})
.factory('Provider', function(kbox, _, $q) {

	/*
	 * [Constructor].
	 */
	function Provider(opts) {

		// Required.
		this.integration = opts.integration;
		this.name = opts.integration.name;

		// Optional.
		this.username = opts.username;

		// @todo: remove
		this.auth = true;

		// Init.
		this.sites = [];
		this.refreshing = false;
		this.displayName = this.username ?
			this.name + '(' + this.username + ')' :
			this.name;

	}

	/*
	 * Refresh provider's state.
	 */
	Provider.prototype.refresh = function() {
		var self = this;
		// Refresh sites.
		return $q.try(function() {
			// Clear list of sites.
			self.sites = [];
			// Signal provider is refreshing.
			self.refreshing = true;
			var sites = self.integration.sites();
			// @todo: fix.
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
		// Return list of sites.
		.return(self.sites)
		// Set a timeout.
		.timeout(15 * 1000)
		// Make sure we signal that we are no longer refreshing.
		.finally(function() {
			self.refreshing = false;
		})
		// Wrap errors.
		.wrap('Error refreshing sites.');
	};

	/*
	 * [STATIC] Get a list of providers.
	 */
	Provider.list = function() {
		// Get list of integrations.
		return kbox.then(function(kbox) {
			return _.values(kbox.integrations.get());
		})
		// Map each integration into a list of providers.
		.reduce(function(acc, integration) {
			// Get list of usersnames for this integration.
			return integration.logins().run().then(function(usernames) {
				// Just in case usernames is null.
				usernames = usernames || [];
				// Add an empty username for the default provider.
				usernames.push(null);
				// Reverse list of usernames.
				usernames.reverse();
				// Return usernames.
				return usernames;
			})
			// Map username to a provider and add to accumilator.
			.each(function(username) {
				var provider = new Provider({
					integration: integration,
					username: username
				});
				acc.push(provider);
			})
			// Return accumilator.
			.return(acc);
		}, [])
		// Set a timeout.
		.timeout(15 * 1000)
		// Wrap errors.
		.wrap('Error building list of providers.');
	};

	// Return constructor.
	return Provider;

});
