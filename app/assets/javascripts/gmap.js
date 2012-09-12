var GMap = function(options, map) {
  this.options = options;
  this.map = map;
  this.colorIndex = -1;
  this.movingDelay = 40;
  this.mapOptions = {
    center: this.getBounds().getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.lines = [];
  this.moveBound = $.proxy(this.move, this);
};

GMap.prototype.nextColor = function() {
  this.colorIndex++;
  if(this.colorIndex == this.options.strokeColors.length) {
    this.colorIndex = 0;
  }
  return this.options.strokeColors[this.colorIndex];
};

GMap.prototype.init = function() {
  this.gmap = new google.maps.Map($("#gmap").get(0), this.mapOptions);
  for(var i = 0; i < Map.tracks.length; i++) {
    var track = Map.tracks[i];
    var line = new google.maps.Polyline({
      path: new google.maps.MVCArray(),
      strokeColor: '#' + this.nextColor(),
      strokeOpacity: this.options.strokeOpacity,
      strokeWeight: this.options.strokeWeight
    });
    for(var j = 0; j < track.points.length; j++) {
      var point = track.points[j];
      point.latLng = new google.maps.LatLng(point.lat, point.lon);
      line.getPath().push(point.latLng);
      point.gmarker = this.createMarker("Alt:" + point['ele'], point.latLng);
    }
    line.setMap(this.gmap);
  }
  this.gmap.fitBounds(this.getBounds());
  this.startSelectionMarker = this.createMarker("Start", null, '/assets/start-flag.png');
  this.endSelectionMarker = this.createMarker("End", null, '/assets/finish-flag.png');
  this.initialized = true;
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
    if(!point.gmarker.getMap()) {
      point.gmarker.setMap(this.gmap);
    }
    this.visibleMarker = point.gmarker;
    this.visibleMarker.setVisible(true);
    if($("#followMap:checked").size() && !this.endSelectionPoint) {
      this.gmap.setCenter(this.visibleMarker.position);
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
  this.abounds = this.gmap.getBounds();
  this.zoom = this.gmap.getZoom();
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
  this.startSelectionMarker.setVisible(false);
  this.endSelectionMarker.setVisible(false);
  this.startSelectionPoint = this.endSelectionPoint = null;
  this.gmap.fitBounds(this.abounds || this.getBounds());
  this.gmap.setZoom(this.zoom);
};

GMap.prototype.getSelectionBounds = function() {
  var startIndex = this.startSelectionPoint.fullIndex;
  var endIndex = this.endSelectionPoint.fullIndex;
  if(startIndex > endIndex) {
    startIndex = endIndex;
    endIndex = this.startSelectionPoint.fullIndex;
  }
  var points = this.map.points.slice(startIndex, endIndex);
  var bounds = new google.maps.LatLngBounds();
  for(var i = 0; i < points.length; i++) {
    bounds.extend(points[i].latLng);
  }
  return bounds;
};

GMap.prototype.getBounds = function() {
  if(!this.bounds) {
    this.bounds = new google.maps.LatLngBounds();
    this.bounds.extend(new google.maps.LatLng(this.map.min.lat, this.map.min.lon));
    this.bounds.extend(new google.maps.LatLng(this.map.max.lat, this.map.max.lon));
  }
  return this.bounds;
};
