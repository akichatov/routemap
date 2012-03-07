var YMap = function(options) {
  this.options = options;
  this.points = [];
  this.ypoints = [];
};

YMap.prototype.init = function() {
  YMaps.load($.proxy(this.doInit, this));
};

YMap.prototype.doInit = function() {
  this.map = new YMaps.Map($("#ymap").get(0));
  this.map.enableScrollZoom();
  this.map.addControl(new YMaps.TypeControl());
  this.map.addControl(new YMaps.ToolBar());
  this.map.addControl(new YMaps.Zoom());
  // this.map.addControl(new YMaps.MiniMap());
  this.map.addControl(new YMaps.ScaleLine());

  this.map.setBounds(this.getBounds());
  for(var i = 0; i < this.points.length; i++) {
    var point = this.points[i];
    var ypoint = new YMaps.GeoPoint(point.lon, point.lat);
    this.ypoints.push(ypoint);
    point.ypoint = ypoint;
  }

  var s = new YMaps.Style();
  s.lineStyle = new YMaps.LineStyle();
  s.lineStyle.strokeColor = this.options.strokeColor + (255 * this.options.strokeOpacity).toString(16);
  s.lineStyle.strokeWidth = this.options.strokeWeight.toString();
  YMaps.Styles.add("map#line", s);

  this.line = new YMaps.Polyline(this.ypoints);
  this.line.setStyle("map#line");
  this.map.addOverlay(this.line);
  this.initialized = true;
};

YMap.prototype.addPoint = function(point) {
  this.points.push(point);
};

YMap.prototype.elevationOver = function(point) {
  if(point) {
    if(!this.marker) {
      this.marker = new YMaps.Placemark(point.ypoint, {style: "default#bicycleIcon"});
      this.map.addOverlay(this.marker);
    }
    this.marker.setGeoPoint(point.ypoint);
    if($("#followMap:checked").size()) {
      clearTimeout(this.moving);
      this.moving = setTimeout($.proxy(this.move, this, point.ypoint), 50);
    }
  } else {
    if(this.marker) {
      this.map.removeOverlay(this.marker);
      this.marker = null;
    }
  }
};

YMap.prototype.move = function(ypoint) {
  this.map.panTo(ypoint, {flying: false});
};

YMap.prototype.getBounds = function() {
  return new YMaps.GeoBounds(
    new YMaps.GeoPoint(Map.track.min.lon, Map.track.min.lat),
    new YMaps.GeoPoint(Map.track.max.lon, Map.track.max.lat)
  );
};
