pwsview
=======

##WUnderground PWS Viewer

View current and daily data for personal weather stations that report
to Weather Underground. You simply provide a station ID.

##Getting Started

After you clone, run the following commands in the root directory of pwsview

    npm install
    npm install -g hapi
    npm link
    npm link pwsview

To start the application after this, simply:

	npm start

##API

###Current Conditions **/station/{stationId}/current/data**

####HTTP 200

Format:

{
  "message": "Success",
  "data": {
    "name": "{stationId}",
    "currentConditions": {
      "lu": "1395711588",
      "ageh": "0",
      "agem": "0",
      "ages": "15",
      "type": "PWS",
      "winddir": "96",
      "windspeedmph": "0.0",
      "windgustmph": "0.0",
      "humidity": "69",
      "tempf": "36.7",
      "rainin": "0.00",
      "dailyrainin": "0.00",
      "baromin": "30.15",
      "dewpointf": "30.50",
      "windchillf": "36"
    }
  },
  "generatedInMs": 326
}

**lu: The UNIX timestamp for when this was fetched**
**ageh: How old, hours**
**agem: How old, minutes**
**ages: How old, seconds**

####HTTP404

Format:

{
  "message": "Invalid station ID",
  "data": "{stationId}"
}

####HTTP500

Format:

{
  "message": "[Exception Message]",
  "data": "[Exception Data]"
}

###Daily Conditions **/station/{stationId}/daily/data**

####HTTP 200

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

####HTTP404

Format:

{
  "message": "Invalid station ID",
  "data": "{stationId}"
}

####HTTP500

Format:

{
  "message": "[Exception Message]",
  "data": "[Exception Data]"
}