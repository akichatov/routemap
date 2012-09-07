var YMap = function(options, map) {
  this.options = options;
  this.map = map;
  this.tracks = [];
  this.ytracks = [];
};

YMap.prototype.init = function() {
  YMaps.load($.proxy(this.doInit, this));
};

YMap.prototype.doInit = function() {
  this.ymap = new YMaps.Map($("#ymap").get(0));
  this.ymap.enableScrollZoom();
  this.ymap.addControl(new YMaps.TypeControl());
  this.ymap.addControl(new YMaps.ToolBar());
  this.ymap.addControl(new YMaps.Zoom());
  // this.ymap.addControl(new YMaps.MiniMap());
  this.ymap.addControl(new YMaps.ScaleLine());
  this.ymap.setBounds(this.getBounds());
  for(var i = 0; i < this.tracks.length; i++) {
    var ypoints = [];
    this.ytracks.push(ypoints)
    for(var j = 0; j < this.tracks[i].length; j++) {
      var point = this.tracks[i][j];
      var ypoint = new YMaps.GeoPoint(point.lon, point.lat);
      ypoints.push(ypoint);
      point.ypoint = ypoint;
    }
    var s = new YMaps.Style();
    s.lineStyle = new YMaps.LineStyle();
    s.lineStyle.strokeColor = this.options.strokeColor + (255 * this.options.strokeOpacity).toString(16);
    s.lineStyle.strokeWidth = this.options.strokeWeight.toString();
    YMaps.Styles.add("map#line", s);

    var line = new YMaps.Polyline(ypoints);
    line.setStyle("map#line");
    this.ymap.addOverlay(line);
  }

  this.initialized = true;
};

YMap.prototype.addPoint = function(point) {
  var points = this.tracks[this.tracks.length - 1];
  if(point.first) {
    points = [];
    this.tracks.push(points)
  }
  points.push(point);
};

YMap.prototype.elevationOver = function(point) {
  if(point) {
    if(!this.marker) {
      this.marker = new YMaps.Placemark(point.ypoint, {style: "default#bicycleIcon"});
      // this.ymap.addOverlay(this.marker);
    } else {
      this.ymap.removeOverlay(this.marker);
    }
    var that = this;
    if($("#followMap").is(":checked")) {
      this.ymap.panTo(point.ypoint, {flying: false, callback: function() {
        that.ymap.addOverlay(that.marker);
      }});
    }
    this.marker.setGeoPoint(point.ypoint);
  } else {
    // this.ymap.removeOverlay(this.marker);
    this.marker = null;
  }
};

YMap.prototype.startSelection = function(point) {
};

YMap.prototype.endSelection = function(point) {
};

YMap.prototype.clearSelection = function(point) {
};

YMap.prototype.getBounds = function() {
  return new YMaps.GeoBounds(
    new YMaps.GeoPoint(this.map.min.lon, this.map.min.lat),
    new YMaps.GeoPoint(this.map.max.lon, this.map.max.lat)
  );
};
