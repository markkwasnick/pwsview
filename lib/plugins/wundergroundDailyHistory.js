var util = require('util'),
    request = require('request'),
    csv = require('csv'),
    _ = require('underscore'),
    helper = require('../pluginhelper');

var Plugin = function (config, log) {
    this.name = 'WeatherUnderground Daily History';

    this.description = 'Gets the daily weather summary for a specified station';

    this.route = {
        method: 'GET',
        path: '/station/{stationId}/daily/data',
        handler: wundergroundCsvFetch
    };

    function wundergroundCsvFetch(req, reply) {
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

                parseCsvResponse(body, function (err, dailyWeatherObject) {
                    if (err) {
                        log.warn(err, 'Parsing of CSV response failed.');
                        reply(helper.buildPluginResponse('Error parsing CSV weather data', err)).code(500);
                    } else if (!dailyWeatherObject.data.length) {
                        reply(helper.buildPluginResponse('Invalid station ID', stationId)).code(404);
                    }

                    reply(helper.buildPluginResponse('Success', dailyWeatherObject, helper.runtimeDeltaInMs(timeStart)));
                });
            });
        } catch (err) {
            reply(helper.buildPluginResponse('Error making request', err)).code(500);
        }
    };

    function parseCsvResponse(rawResponse, callback) {
        try {
            csv().from.string(sanitizeCsvInput(rawResponse))
                .to.array(function (data) {
                    transformParsedCsvIntoResponse(data, function (err, transformedData) {
                        if (err) {
                            log.warn(err, 'Error occured when transforming CSV response for daily weather');
                            callback(err);
                        }

                        callback(null, transformedData);
                    });
                });
        } catch (err) {
            callback(err);
        }
    }

    function transformParsedCsvIntoResponse(parsedCsv, callback) {
        try {
            var transformed = {
                columns: _.first(parsedCsv),
                data: _.without(parsedCsv, _.first(parsedCsv))
            };

            callback(null, transformed);
        } catch (err) {
            log.warn(err, 'Unable to transform parsed csv data');
            callback(err);
        }
    }

    function sanitizeCsvInput(rawInput) {
        return rawInput.replace(/<br>/g, '');
    }

    function buildUriForStationRequest(stationId) {
        return util.format(config.plugins.wundergrounddaily.dailyuri, config.plugins.wundergrounddaily.server, stationId);
    }
};

module.exports = Plugin;