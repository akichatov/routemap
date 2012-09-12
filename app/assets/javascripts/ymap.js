var YMap = function(options, map) {
  this.options = options;
  this.map = map;
};

YMap.prototype.init = function() {
  ymaps.ready($.proxy(this.doInit, this));
};

YMap.prototype.doInit = function() {
  this.ymap = new ymaps.Map("ymap", {
    center: [this.map.min.lon, this.map.min.lat],
    behaviors: ["default", "scrollZoom"]
  });
  this.ymap.controls.add("typeSelector").add("zoomControl").add("mapTools").add("scaleLine");
  this.ymap.setBounds(this.getBounds());
  for(var i = 0; i < Map.tracks.length; i++) {
    var track = Map.tracks[i];
    var lineString = new ymaps.geometry.LineString([]);
    for(var j = 0; j < track.points.length; j++) {
      var point = track.points[j];
      point.coordinates = [point.lon, point.lat];
      lineString.insert(j, point.coordinates);
    }
    var line = new ymaps.Polyline(lineString, {}, {
      strokeColor: this.options.strokeColor + (255 * this.options.strokeOpacity).toString(16),
      strokeWidth: this.options.strokeWeight
    });
    this.ymap.geoObjects.add(line);
  }
  this.startMarker = this.createMarker([], this.options.startIconUrl);
  this.endMarker = this.createMarker([], this.options.endIconUrl);
  this.pointMarker = this.createMarker([], this.options.pointIconUrl);
  this.initialized = true;
};

YMap.prototype.createMarker = function(coordinates, iconHref) {
  return new ymaps.Placemark(coordinates, {}, {
    iconImageHref: iconHref,
    iconOffset: (iconHref ? [-10, 0] : [0, 0])
  });
};

YMap.prototype.elevationOver = function(point) {
  if(point) {
    this.pointMarker.geometry.setCoordinates(point.coordinates);
    this.ymap.geoObjects.add(this.pointMarker);
    if($("#followMap").is(":checked")) {
      this.ymap.setCenter(point.coordinates);
    }
  } else {
    this.ymap.geoObjects.remove(this.pointMarker);
  }
};

YMap.prototype.startSelection = function(point) {
  this.startSelectionPoint = point;
  this.startMarker.geometry.setCoordinates(point.coordinates);
  this.ymap.geoObjects.add(this.startMarker);
};

YMap.prototype.endSelection = function(point) {
  this.endSelectionPoint = point;
  this.endMarker.geometry.setCoordinates(point.coordinates);
  this.ymap.geoObjects.add(this.endMarker);
  this.abounds = this.ymap.getBounds();
  this.zoom = this.ymap.getZoom();
  this.ymap.setBounds(this.getSelectionBounds(), {checkZoomRange: true});
};

YMap.prototype.clearSelection = function(point) {
  this.ymap.geoObjects.remove(this.startMarker);
  this.ymap.geoObjects.remove(this.endMarker);
  this.ymap.setBounds(this.abounds || this.getBounds(), {checkZoomRange: true});
  this.ymap.setZoom(this.zoom, {checkZoomRange: true});
};

YMap.prototype.getSelectionBounds = function() {
  var startIndex = this.startSelectionPoint.fullIndex;
  var endIndex = this.endSelectionPoint.fullIndex;
  if(startIndex > endIndex) {
    startIndex = endIndex;
    endIndex = this.startSelectionPoint.fullIndex;
  }
  var points = this.map.points.slice(startIndex, endIndex);
  var line = new ymaps.geometry.LineString([]);
  for(var i = 0; i < points.length; i++) {
    line.insert(i, points[i].coordinates);
  }
  return line.getBounds();
};

YMap.prototype.getBounds = function() {
  return [[this.map.min.lon, this.map.min.lat], [this.map.max.lon, this.map.max.lat]];
};
