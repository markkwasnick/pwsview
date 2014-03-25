var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    helper = require('../pluginhelper');

var Plugin = function (config, log) {
    this.name = 'WeatherUnderground Current Conditions';

    this.description = 'Gets the latest weather for a specified station';

    this.route = {
        method: 'GET',
        path: '/station/{stationId}/current/data',
        handler: wundergroundFetch
    };

    function wundergroundFetch(req, reply) {
        try {
            var stationId = req.params.stationId,
                uri = buildUriForStationRequest(stationId),
                timeStart = _.now();
            log.info(util.format('REQUEST for data from %s', uri));

            request(uri, function (err, res, body) {
                if (err) {
                    log.warn(util.format('Request to %s failed with code %d', uri, res.statusCode));
                    reply(helper.buildPluginResponse(util.format('Request for station data at %s failed', uri), err)).code(res.statusCode);
                }

                var stationData = JSON.parse(body);

                if (didWeFindStationDataInResponse(stationData)) {
                    transformJsonStationDataIntoMoreLogicalFormat(stationData, function (transformErr, transformedStationData) {
                        if (transformErr) {
                            log.warn(transformErr, 'Unable to transform station data to logical format');
                        }

                        reply(helper.buildPluginResponse('Success', transformedStationData, helper.runtimeDeltaInMs(timeStart)));
                    });
                } else {
                    log.warn(util.format('No station data found for stationId %s', stationId));
                    reply(helper.buildPluginResponse('Invalid station ID', stationId)).code(404);
                }
            });
        } catch (err) {
            log.error(err, 'Error making request to the wunderground backend');
            reply(helper.buildPluginResponse('Error making request', err)).code(500);
        }
    };

    function transformJsonStationDataIntoMoreLogicalFormat(jsonStationData, callback) {
        try {
            var stationDataRoot = jsonStationData.conds,
                stationName = _.keys(stationDataRoot)[0],
                stationData = _.property(stationName)(stationDataRoot);

            stationData = StationDataPointComputer.computeDataPoints(['dewpointf'], stationData);
            callback(null, {
                name: stationName,
                currentConditions: stationData
            });
        } catch (err) {
            log.warn(err, 'Transforming current conditions response failed');
            callback(err);
        }
    }

    var StationDataPointComputer = {
        computeDataPoints: function (dataPoints, stationData) {
            _.each(dataPoints, function (key) {
                switch (key) {
                case 'dewpointf':
                    _.extend(stationData, StationDataPointComputer.computeDewPoint(key, stationData.tempf, stationData.humidity));
                    break;
                }
            });

            return stationData;
        },
        computeDewPoint: function (key, temp, relHum) {
            if (!relHum || !temp) {
                return "0.00";
            }

            var dewPt = {};
            dewPt[key] = parseFloat(temp - (100 - relHum) / 5).toFixed(2).toString();
            return dewPt;
        }
    }
    
    function buildUriForStationRequest(stationId) {
        return util.format(config.wunderground.currenturi, config.wunderground.server, stationId);
    }

    function didWeFindStationDataInResponse(res) {
        return res.conds && Object.keys(res.conds).length > 0;
    }
};

module.exports = Plugin;