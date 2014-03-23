$("#searchBtn").click(function() {
	goToStation();
});

$('#stationIDSearch').keypress(function (e) {
  if (e.which == 13) {
    goToStation();
  }
});

function goToStation() {
	window.location = '/view/?' + $("#stationIDSearch").val();
}