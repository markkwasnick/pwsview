var util = require('util'),
	request = require('request');

var Plugin = function(config, log) {
	this.name = 'WeatherUnderground Current Conditions';

	this.route = {
		method: 'GET',
		path: '/station/{stationId}/current/data',
		handler: wundergroundFetch
	};

	function wundergroundFetch(req, reply) {
		try {
			var stationId = req.params.stationId,
				uri = buildUriForStationRequest(stationId);
			log.info(util.format('REQUEST for data from %s', uri));

			request(uri, function(err, res, body) {
				if (err) {
					log.warn(util.format('Request to %s failed with code %d', uri, res.statusCode));
					reply(buildPluginResponse(util.format('Request for station data at %s failed', uri), err)).code(res.statusCode);
				}

				var stationData = JSON.parse(body);

				if (didWeFindStationDataInResponse(stationData)) {
					reply(buildPluginResponse('Time to Capture will go here', stationData));
				}
				else {
					log.warn(util.format('No station data found for stationId %s', stationId));
					reply(buildPluginResponse('Invalid station ID', stationId)).code(404);
				}
			});
		}
		catch (err) {
			reply(buildPluginResponse('Error making request', err)).code(500);
		}
	};

	function buildUriForStationRequest(stationId) {
		return util.format(config.plugins.wunderground.currenturi, config.plugins.wunderground.server, stationId);
	}

	function buildPluginResponse(msg, data) {
		var response = { message: msg, data: data };
		return response;
	}

	function didWeFindStationDataInResponse(res) {
		return res.conds && Object.keys(res.conds).length > 0;
	}
};

module.exports = Plugin;