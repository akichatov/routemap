var GMap = function(options) {
  this.options = options;
  this.mapOptions = {
    center: this.getBounds().getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.gmap = new google.maps.Map($("#gmap").get(0), this.mapOptions);
  this.line = new google.maps.Polyline({
    path: new google.maps.MVCArray(),
    strokeColor: this.options.strokeColor,
    strokeOpacity: this.options.strokeOpacity,
    strokeWeight: this.options.strokeWeight
  });
};

GMap.prototype.init = function() {
  this.line.setMap(this.gmap);
  this.gmap.fitBounds(this.getBounds());
  this.initialized = true;
};

GMap.prototype.addPoint = function(point) {
  point.latLng = new google.maps.LatLng(point.lat, point.lon);
  if(!point.generated) {
    this.line.getPath().push(point.latLng);
  }
  point.gmarker = new google.maps.Marker({
    position: point.latLng,
    map: this.gmap,
    title: "Alt:" + point['ele'],
    visible: false,
    flat: true
  });
};

GMap.prototype.elevationOver = function(point) {
  if(this.visibleMarker) {
    this.visibleMarker.setVisible(false);
  }
  if(point) {
    this.visibleMarker = point.gmarker;
    this.visibleMarker.setVisible(true);
    if($("#followMap:checked").size()) {
      this.gmap.setCenter(this.visibleMarker.position);
    }
  }
};

GMap.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(new google.maps.LatLng(Map.track.min.lat, Map.track.min.lon));
  bounds.extend(new google.maps.LatLng(Map.track.max.lat, Map.track.max.lon));
  return bounds;
};
