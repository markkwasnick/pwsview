var util = require('util'),
    assert = require('assert'),
    dive = require('dive'),
    _ = require('underscore');

function loadPluginsFromDirectory(config, log, callback) {
    var searchDir = 'lib/plugins';

    log.info(util.format('Search for plugins in %s', searchDir));

    try {
        var plugins = [];

        dive(searchDir, {
            all: false,
            recursive: false,
            files: true
        }, function (err, file) {
            if (err) {
                log.error(err, "Exception while attempting to load plugin file");
            }

            log.info(util.format('Found plugin file: %s', file));
            var module = require(file),
                plugin = new module(config, log);

            if (ensureModuleIsValidHapiPlugin(plugin, file, log)) {
                plugins.push(plugin);
            } else {
                log.warn(util.format('Plugin file %s was not a valid Hapi plugin', file));
            }
        }, function () {
            log.info(util.format('Obtained %d valid plugin(s)', plugins.length));
            callback(null, plugins);
        });
    } catch (err) {
        log.error(err, util.format('Error when diving plugin directory at %s.', searchDir));
        callback(err);
    }
}

function ensureModuleIsValidHapiPlugin(plugin, filePath, log) {
    try {
        var properties = ['name', 'description', 'route',
            'route.method', 'route.path', 'route.handler'
        ]

        return _.every(
            _.map(properties, function (prop) {
                var objToCheck = plugin,
                    propLevel = prop.split('.');

                var propsFound = _.filter(propLevel, function (propPart) {
                    if (_.has(objToCheck, propPart)) {
                        objToCheck = _.property(propPart)(objToCheck);
                        return true;
                    }

                    log.warn(util.format('Plugin at [%s] property [%s] is not defined', filePath, prop));
                    return false;
                });

                return propsFound && propsFound.length == propLevel.length;
            })
        );
    } catch (err) {
        log.warn(err.message, 'Module was not a valid HAPI plugin.');
        return false;
    }
}

module.exports.loadPlugins = loadPluginsFromDirectory;