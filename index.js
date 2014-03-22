var Hapi = require('hapi'),
	config = require('config'),
	bunyan = require('bunyan'),
	util = require('util'),
	_ = require('underscore'),
	server = require('./bin/server'),
	loader = require('./lib/loader');

function bootstrapper() {
	this.start = function() {
		var log = createLogger();
		var appServer = server.create(config, log);

		registerRoutes(appServer, config, log, function(err) {
			if (err) {
				log.error(err, 'Could not register routes!');
				process.exit(1);
			}

			appServer.start();
			log.info('Server is online!');
		});
	}

	function registerRoutes(appServer, config, log, callback) {
		createApiRoutes(appServer, config, log, function(err) {
			if (err) {
				callback(err);
			}

			createStaticRoutes(appServer, config, log, function(err) {
				if (err) {
					callback(err);
				}

				callback(null);
			})
		})
	}

	function createApiRoutes(appServer, config, log, callback) {
		log.info('Adding api route(s)');

		try {
			loader.loadPlugins(config, log, function(err, plugins) {
				log.info("Done loading plugins.");

				if (plugins.length) {
					appServer.route(_.map(plugins, function(plugin) {
						return plugin.route;
					}));
				}

				callback(null);
			});
		}
		catch (err) {
			log.error(err, 'createApiRoutes');
			callback(err);
		}
	}

	function createStaticRoutes(appServer, config, log, callback) {
		log.info('Adding static route(s)');

		try {
			appServer.route({
				method: 'GET',
			    path: '/{path*}',
			    handler: {
			        directory: { path: './html', listing: false, index: true }
			    }
			});
		}
		catch (err) {
			log.error(err, 'createStaticRoutes');
			callback(err);
		}

		callback(null);
	}

	function createLogger() {
		var logger = bunyan.createLogger({
			name: util.format('%s v%s', config.app.name, appVersion()),
		});

		return logger;
	}

	function appVersion() {
		return require('./package.json').version;
	}
}

var app = new bootstrapper();
app.start();