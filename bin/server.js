var Hapi = require('hapi'),
	assert = require('assert'),
	util = require('util');

function createHapiServerWithConfig(config, log) {
	assert.ok(config, 'Cannot start server without config!');
	assert.ok(config.server.host, 'Server config is missing host!');
	assert.ok(config.server.port, 'Server config is missing port!');

	log.info(util.format('Create server on host %s and port %s', config.server.host, config.server.port));
	return Hapi.createServer(config.server.host, config.server.port)
}

module.exports.create = createHapiServerWithConfig;