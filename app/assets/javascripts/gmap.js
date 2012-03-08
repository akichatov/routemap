var GMap = function(options) {
  this.options = options;
  this.movingDelay = 40;
  this.latLngs = [];
  this.mapOptions = {
    center: this.getBounds().getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.gmap = new google.maps.Map($("#gmap").get(0), this.mapOptions);
  this.line = new google.maps.Polyline({
    path: new google.maps.MVCArray(),
    strokeColor: '#' + this.options.strokeColor,
    strokeOpacity: this.options.strokeOpacity,
    strokeWeight: this.options.strokeWeight
  });
  this.moveBound = $.proxy(this.move, this);
};

GMap.prototype.init = function() {
  this.line.setMap(this.gmap);
  this.gmap.fitBounds(this.getBounds());
  this.initialized = true;
  this.startSelectionMarker = this.createMarker("Start", null, '/assets/start-flag.png');
  this.endSelectionMarker = this.createMarker("End", null, '/assets/finish-flag.png');
};

GMap.prototype.addPoint = function(point) {
  point.latLng = new google.maps.LatLng(point.lat, point.lon);
  if(!point.generated) {
    this.line.getPath().push(point.latLng);
  }
  this.latLngs.push(point.latLng);
  point.gmarker = this.createMarker("Alt:" + point['ele'], point.latLng)
};

GMap.prototype.createMarker = function(title, position, icon) {
  return new google.maps.Marker({
    position: position,
    map: this.gmap,
    title: title,
    visible: false,
    icon: icon,
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
    if($("#followMap:checked").size() && !this.endSelectionPoint) {
      clearTimeout(this.moving);
      this.moving = setTimeout(this.moveBound, this.movingDelay);
    }
  }
};

GMap.prototype.move = function(position) {
  this.gmap.panTo(this.visibleMarker.position);
};

GMap.prototype.startSelection = function(point) {
  this.startSelectionPoint = point;
  this.startSelectionMarker.setPosition(point.latLng);
  this.startSelectionMarker.setVisible(true);
};

GMap.prototype.endSelection = function(point) {
  this.endSelectionPoint = point;
  this.endSelectionMarker.setPosition(point.latLng);
  this.endSelectionMarker.setVisible(true);
  this.abounds = this.gmap.getBounds();
  this.zoom = this.gmap.getZoom();
  this.gmap.fitBounds(this.getSelectionBounds());
};

GMap.prototype.clearSelection = function(point) {
  this.startSelectionMarker.setVisible(false)
  this.endSelectionMarker.setVisible(false);
  this.startSelectionPoint = this.endSelectionPoint = null;
  this.gmap.fitBounds(this.abounds || this.getBounds());
  this.gmap.setZoom(this.zoom);
};

GMap.prototype.getSelectionBounds = function() {
  var startIndex = this.startSelectionPoint.index;
  var endIndex = this.endSelectionPoint.index;
  if(startIndex > endIndex) {
    startIndex = endIndex;
    endIndex = this.startSelectionPoint.index;
  }
  var latLngs = this.latLngs.slice(startIndex, endIndex);
  var bounds = new google.maps.LatLngBounds();
  for(var i = 0; i < latLngs.length; i++) {
    bounds.extend(latLngs[i]);
  }
  return bounds;
};

GMap.prototype.getBounds = function() {
  if(!this.bounds) {
    this.bounds = new google.maps.LatLngBounds();
    this.bounds.extend(new google.maps.LatLng(Map.track.min.lat, Map.track.min.lon));
    this.bounds.extend(new google.maps.LatLng(Map.track.max.lat, Map.track.max.lon));
  }
  return this.bounds;
};
