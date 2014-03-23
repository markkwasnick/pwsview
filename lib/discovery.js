var _ = require('underscore'),
	util = require('util');

var Discovery = function(appServer, config, log) {
	this.route = {
		method: 'GET',
		path: '/discover',
		handler: discoverApiRoutes
	};

	function discoverApiRoutes(req, reply) {
		reply(_.map(appServer.table(), function(route) {
				return { method: route.method.toUpperCase(), path: route.path };
			})
		);
	}
};

function discoverApiRoutes(appServer, log) {
	return _.map(appServer.routingTable(), function(route) {
		return { method: route.method.toUpper(), path: route.path };
	})
}

module.exports = Discovery;