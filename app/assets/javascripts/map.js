var Map = function() {
  var latCenter = (track.min_max.max.lat + track.min_max.min.lat) / 2;
  var lonCenter = (track.min_max.max.lon + track.min_max.min.lon) / 2;
  this.options = {
      zoom: 11,
      center: new google.maps.LatLng(latCenter, lonCenter),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
  this.map = new google.maps.Map($("#map").get(0), this.options);
  var path = [];
  for(var i = 0; i < track.points.length; i++) {
    var point = track.points[i];
    path.push(new google.maps.LatLng(point['lat'], point['lon']));
  }
  var line = new google.maps.Polyline({
    path: path,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  line.setMap(this.map);
};

$(function() {
  new Map();
});