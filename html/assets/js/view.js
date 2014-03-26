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
      <div className="panel panel-primary">
      	<div className="panel-heading">
      		<h2>{stationId}</h2>
      	</div>
      	<div className="panel-body">
    			<CurrentConditions data={this.state.data.currentConditions} />
  			</div>
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

		var output = _.map(currentConditions, function(condition) {
			return <ConditionTile condition={terms[condition[0]]}>{condition[1]}</ConditionTile>
		});

		return (
			<div className="currentConditions row">
				{output}
			</div>
		);
	}
});

var ConditionTile = React.createClass({
	render: function() {
		return (
			<div className="conditionTile col-sm-3">
				<div className="panel panel-tile">
					<div className="panel-heading">
						{this.props.condition}
					</div>
					<div className="panel-body">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
});

React.renderComponent(
	<CurrentView url={"/station/" + stationId + "/current/data"} pollInterval={2000} />,
	document.getElementById('MainContent')
);

