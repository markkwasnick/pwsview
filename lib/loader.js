var util = require('util'),
	assert = require('assert'),
	dive = require('dive');

function loadPluginsFromDirectory(config, log, callback) {
	var searchDir = 'lib/plugins';

	log.info(util.format('Search for plugins in %s', searchDir));

	try {
		var plugins = [];

		dive(searchDir, {
				all: false,
				recursive: false,
				files: true
			}, function(err, file) {
				if (err) {
					log.error(err, "Exception while attempting to load plugin file");
				}

				log.info(util.format('Found plugin file: %s', file));
				var module = require(file),
					plugin = new module(config, log);

				if (ensureModuleIsValidHapiPlugin(plugin, log)) {
					plugins.push(plugin);
				} else {
					log.warn(util.format('Plugin file %s was not a valid Hapi plugin', file));
				}
			}, function() {
				log.info(util.format('Obtained %d valid plugin(s)', plugins.length));
				callback(null, plugins);
			});
	}
	catch (err) {
		log.error(err, util.format('Error when diving plugin directory at %s.', searchDir));
		callback(err);
	}
}

function ensureModuleIsValidHapiPlugin(plugin, log) {
	try {
		assert.ok(plugin.name, 'Name not defined.');
		assert.ok(plugin.route.method, 'Method not defined.');
		assert.ok(plugin.route.path, 'Path not defined.');
		assert.ok(plugin.route.handler, 'Handler not defined.');
		return true;
	}
	catch (err) {
		log.warn(err.message, 'Module was not a valid HAPI plugin.');
		return false;
	}
}

module.exports.loadPlugins = loadPluginsFromDirectory;