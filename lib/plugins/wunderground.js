var util = require('util'),
    request = require('request'),
    assert = require('assert'),
    _ = require('underscore'),
    helper = require('../pluginhelper'),
    xml2json = require('xml2json');

var Plugin = function (config, log) {
    this.name = 'WeatherUnderground Current Conditions';

    this.description = 'Gets the latest weather for a specified station';

    this.route = {
        method: 'GET',
        path: '/station/{stationId}/current/data',
        handler: wundergroundFetch
    };

    // old field(s), new field(s), optional new object
    // Refactor me!
    var fieldMapping = [
        [['ageh', 'agem', 'ages'], ['hours', 'minutes', 'seconds'], ['dataAge']],
        [['dateutc'], ['generatedOnUtc']]
        [['type', 'softwaretype', 'rtfreq'], ['type', 'software', 'update_frequency'], ['stationInfo']],
        [['id'], ['stationId']],
        [['adm1', 'adm2', 'country', 'neighborhood', 'lat', 'lon'], ['city', 'state', 'country', 'neighborhood', 'gps_lat', 'gps_lon'], ['stationLocation']],
        [[
            'winddir',
            'windspeedmph',
            'windgustmph',
            'humidity',
            'tempf',
            'rainin',
            'dailyrainin',
            'baromin',
            'dewptf',
            'weather',
            'clouds',
            'windchillf',
            'heatindexf',
            'elev',
            'maxtemp',
            'maxtemp_time',
            'mintemp',
            'mintemp_time',
            'maxdewpoint',
            'mindewpoint',
            'maxpressure',
            'minpressure',
            'maxwindspeed',
            'maxwindgust',
            'maxrain',
            'maxheatindex',
            'minwindchill',
            'indoortempf',
            'indoorhumidity'
         ],
         [
            'winddir',
            'windspeedmph',
            'windgustmph',
            'humidity',
            'tempf',
            'rainin_recent',
            'rainin_daily',
            'baromin',
            'dewptf',
            'weather_code',
            'clouds_code',
            'windchillf',
            'heatindexf',
            'elevationf',
            'maxtemp_daily',
            'maxtemp_time',
            'mintemp_daily',
            'mintemp_time',
            'maxdewpoint',
            'mindewpoint',
            'maxpressure',
            'minpressure',
            'maxwindspeed',
            'maxwindgust',
            'maxrain_hr',
            'maxheatindex',
            'minwindchill',
            'indoortempf',
            'indoorhumidity'
         ],
         ['currentConditions']]
    ];

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

                transformXmlResponseIntoJson(body, log, function(err, mappedStationData) {
                    if (err) {
                        log.error(err, 'Error making request to the wunderground backend');
                        reply(helper.buildPluginResponse('Error parsing wunderground response', err)).code(500);
                    }

                    if (didWeFindStationDataInResponse(mappedStationData)) {
                        reply(helper.buildPluginResponse('Success', mappedStationData, helper.runtimeDeltaInMs(timeStart)));
                    } else {
                        log.warn(util.format('No station data found for stationId %s', stationId));
                        reply(helper.buildPluginResponse('Invalid station ID', stationId)).code(404);
                    }
                });
            });
        } catch (err) {
            log.error(err, 'Error making request to the wunderground backend');
            reply(helper.buildPluginResponse('Error making request', err)).code(500);
        }
    };

    function transformXmlResponseIntoJson(xml, log, callback) {
        try {
            var parsedXml = JSON.parse(xml2json.toJson(xml));
            var reducedDataWithRawConditions = reduceAndGetStationName(parsedXml, log);

            if (reducedDataWithRawConditions != null) {
                var mappedData = mapAndTranslateConditionData(reducedDataWithRawConditions, log);
                callback(null, mappedData);
            }
            else {
                callback('Unable to parse station data response');
            }
        }
        catch (err) {
            log.error(err, 'Generic exception when transforming xml into json from wunderground response');
            callback(err);
        }
    }

    function reduceAndGetStationName(rawParsedData, log) {
        if (!rawParsedData) {
            log.warn('Could not attempt to parse raw json from xml, as the object was null');
            return null;
        }

        assert(rawParsedData.conds, 'Response was missing conds attribute');
        var determinedStationId = _.first(_.keys(rawParsedData.conds));

        return {
            stationId: determinedStationId,
            currentConditionsRaw: _.property(determinedStationId)(rawParsedData.conds)
        }
    }

    function mapAndTranslateConditionData(reducedStationData, log) {
        if (!reducedStationData) {
            log.warn('Could not attempt to parse reduced json from xml station data, as the object was null');
            return null;
        }

        var mappedData = {};
        var datamap = reducedStationData.currentConditionsRaw;
        var kvps = _.pairs(datamap);

        for (var i = 0; i < kvps.length; i++) {
            var mapping = getObjectMapping(kvps[i][0], kvps[i][1], log);
            if (mapping.sequence.length) {
                createObjectChain(mappedData, mapping);
            }
        }

        return mappedData;
    }

    function createObjectChain( obj, mapping ) {
        var sequence = mapping.sequence;

        for( var i = 0; i < sequence.length; i++ ) {
            var val = {};
            if (sequence[i] == _.last(sequence)) {
                val = mapping.value;
            }

            obj = obj[ sequence[i] ] = obj[ sequence[i] ] || val;
        }
    }

    function getObjectMapping(key, value, log) {
        var propSequence = [];
        var determinedValue = null;

        var mapping = _.find(fieldMapping, function (mapItem) {
            return _.contains(_.first(mapItem), key);
        });

        if (mapping) {
            if (mapping.length == 3) {
                propSequence.push(_.first(mapping[2])); // Push the new object name
            }

            var sequenceIndex = _.indexOf(_.first(mapping), key);
            propSequence.push(mapping[1][sequenceIndex]);
        }

        if (value) {
            if (value instanceof Array) {
                determinedValue = _.first(value).val;
            }
            else {
                determinedValue = value.val;
            }
        }

        return {
            sequence: propSequence,
            value: determinedValue
        }
    }
    
    function buildUriForStationRequest(stationId) {
        return util.format(config.wunderground.currenturi, config.wunderground.server, stationId);
    }

    function didWeFindStationDataInResponse(res) {
        return res.currentConditions && Object.keys(res.currentConditions).length > 0;
    }
};

module.exports = Plugin;