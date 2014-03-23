var _ = require('underscore');

var helper = {
	buildPluginResponse: function(msg, data, timeToGenerate) {
		return { message: msg, data: data, generatedInMs: timeToGenerate };
	},

	runtimeDeltaInMs: function(whenStarted) {
		return _.now() - whenStarted;
	}
}

module.exports = helper;