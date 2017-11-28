pwsview
=======

**WUnderground PWS Viewer**

View current and daily data for personal weather stations that report
to Weather Underground. You simply provide a station ID. This plugin 
provides both a UI and API methods.

## Getting Started

Install the following dependencies:

    Python 2.7.x (required for node-gyp) https://www.python.org/download/releases/2.7.6/

After you clone, run the following commands in the root directory of pwsview:

    npm install
    npm install -g hapi
    npm link
    npm link pwsview

To start the application after this, simply:

	npm start

## API

### Current Conditions **/station/{stationId}/current/data**

#### HTTP 200

Format:

    {
      "message": "Success",
      "data": {
        "dataAge": {
          "hours": 0,
          "minutes": 0,
          "seconds": 27
        },
        "stationId": "{stationId}",
        "stationLocation": {
          "gps_lat": {float_lat},
          "gps_lon": {float_lon},
          "city": "{city}",
          "state": "{state}",
          "country": "{country}",
          "neighborhood": "{neighborhood}"
        },
        "currentConditions": {
          "winddir": 298,
          "windspeedmph": 0,
          "windgustmph": 0,
          "humidity": 96,
          "tempf": 29.8,
          "rainin_recent": 0,
          "rainin_daily": 0,
          "baromin": 29.97,
          "dewptf": 28.8,
          "weather_code": 0,
          "clouds_code": 0,
          "windchillf": 29,
          "heatindexf": 30,
          "elevationf": 453,
          "maxtemp_daily": 30.4,
          "maxtemp_time": "12:00am",
          "mintemp_daily": 29.8,
          "mintemp_time": "12:39AM",
          "maxdewpoint": 29.3,
          "mindewpoint": 28.8,
          "maxpressure": 29.97,
          "minpressure": 29.95,
          "maxwindspeed": 0,
          "maxwindgust": 0,
          "maxrain_hr": 0,
          "maxheatindex": 30,
          "minwindchill": 29,
          "indoortempf": 74.5,
          "indoorhumidity": 32
        }
      },
      "generatedInMs": 187
    }


#### HTTP404

Format:

    {
      "message": "Invalid station ID",
      "data": "{stationId}"
    }

#### HTTP500

Format:

    {
      "message": "[Exception Message]",
      "data": "[Exception Data]"
    }

### Daily Conditions **/station/{stationId}/daily/data**

#### HTTP 200

Format:

    {
      "message": "Success",
      "data": {
        "columns": [
          "Time",
          "TemperatureF",
          "DewpointF",
          "PressureIn",
          "WindDirection",
          "WindDirectionDegrees",
          "WindSpeedMPH",
          "WindSpeedGustMPH",
          "Humidity",
          "HourlyPrecipIn",
          "Conditions",
          "Clouds",
          "dailyrainin",
          "SoftwareType",
          "DateUTC"
        ],
        "data": [
          [
            "2014-03-24 00:00:00",
            "37.4",
            "36.3",
            "30.16",
            "NW",
            "316",
            "0.0",
            "0.0",
            "96",
            "0.00",
            "",
            "",
            "0.00",
            "meteobridge",
            "2014-03-24 04:00:00",
            ""
          ],
          [
            "2014-03-24 00:01:00",
            "37.4",
            "36.3",
            "30.16",
            "NW",
            "316",
            "0.0",
            "0.0",
            "96",
            "0.00",
            "",
            "",
            "0.00",
            "meteobridge",
            "2014-03-24 04:01:00",
            ""
          ]
        ]
      },
      "generatedInMs": 992
    }

**columns: List of data headers, in pascal case**

**data: Array of data elements matching the headers in columns**

#### HTTP404

Format:

    {
      "message": "Invalid station ID",
      "data": "{stationId}"
    }

#### HTTP500

Format:

    {
      "message": "[Exception Message]",
      "data": "[Exception Data]"
    }
