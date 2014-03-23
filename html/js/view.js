/** @jsx React.DOM */
var stationId = window.location.search.slice(1);

var terms = {
	"lu"						: "Time Elapsed Since First Poll",
	"ageh"					: "Hours Since First Poll",
	"agem"					: "Minutes Since First Poll",
	"ages"					: "Seconds Since First Poll",
	"type"					: "Type of Station",
	"winddir"				: "Wind Direction",
	"windspeedmph"	: "Wind Speed (MPH)",
	"windgustmph" 	: "Wind Gust (MPH)",
	"humidity"			: "Humidity",
	"tempf"					: "Temperature (F)",
	"rainin"				: "Rain (Inches)",
	"dailyrainin"		: "Daily Rain (Inches)",
	"baromin"				: "Barometer (Minimum)",
	"dewpointf"			: "Dew Point (F)",
	"windchillf"		: "Wind Chill (F)"
};

var CurrentView = React.createClass({
  loadDataFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
      	console.log(data.data);
        this.setState({data: data.data});
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentWillMount: function() {
    this.loadDataFromServer();
    setInterval(this.loadDataFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="currentView">
        <h1>{stationId}</h1>
      	{this.name}
      	<CurrentConditions data={this.state.data.currentConditions} />
      </div>
    );
  }
});

var CurrentConditions = React.createClass({
	getInitialState: function() {
    return {data: []};
  },
	render: function() {
		if (!this.props.data)
			return (<div></div>);

		var currentConditions = _.pairs(this.props.data);
		var output = '';

		_.each(currentConditions, function(condition) {
			output += '<b>' + terms[condition[0]] + ':</b> ' + condition[1] + '<br />';
		});

		return (
			<div className="currentConditions">
				<span dangerouslySetInnerHTML={{__html: output}} />
			</div>
		);
	}
});

React.renderComponent(
	<CurrentView url={"/station/" + stationId + "/current/data"} pollInterval={2000} />,
	document.getElementById('MainContent')
);