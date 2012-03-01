var Map = function() {
  this.options = {
    center: this.getBounds().getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
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
  this.map.fitBounds(this.getBounds());
};

Map.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(new google.maps.LatLng(track.min.lat, track.min.lon));
  bounds.extend(new google.maps.LatLng(track.max.lat, track.max.lon));
  return bounds;
};

$(function() {
  new Map();
});