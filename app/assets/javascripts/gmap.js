var GMap = function(options, map) {
  this.options = options;
  this.map = map;
  this.colorIndex = -1;
  this.movingDelay = 40;
  this.latLngs = [];
  this.mapOptions = {
    center: this.getBounds().getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.gmap = new google.maps.Map($("#gmap").get(0), this.mapOptions);
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
  this.gmap.fitBounds(this.getBounds());
  this.initialized = true;
  this.startSelectionMarker = this.createMarker("Start", null, '/assets/start-flag.png');
  this.endSelectionMarker = this.createMarker("End", null, '/assets/finish-flag.png');
};

GMap.prototype.addPoint = function(point) {
  var line = this.lines[this.lines.length - 1];
  if(point.first) {
    var line = new google.maps.Polyline({
      path: new google.maps.MVCArray(),
      strokeColor: '#' + this.nextColor(),
      strokeOpacity: this.options.strokeOpacity,
      strokeWeight: this.options.strokeWeight
    });
    this.lines.push(line);
    line.setMap(this.gmap);
  }
  point.latLng = new google.maps.LatLng(point.lat, point.lon);
  if(!point.generated) {
    line.getPath().push(point.latLng);
  }
  this.latLngs.push(point.latLng);
  point.latLngIndex = this.latLngs.length - 1;
  point.gmarker = this.createMarker("Alt:" + point['ele'], point.latLng);
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
  var startIndex = this.startSelectionPoint.latLngIndex;
  var endIndex = this.endSelectionPoint.latLngIndex;
  if(startIndex > endIndex) {
    startIndex = endIndex;
    endIndex = this.startSelectionPoint.latLngIndex;
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
    this.bounds.extend(new google.maps.LatLng(this.map.min.lat, this.map.min.lon));
    this.bounds.extend(new google.maps.LatLng(this.map.max.lat, this.map.max.lon));
  }
  return this.bounds;
};
