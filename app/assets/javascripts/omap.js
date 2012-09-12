var OMap = function(options, map) {
  var bingKey = "Ao6QQK5LyzSSNm9cazeItyOqY9nXSOXlAI-eztC52UzaiG257z_t0NGRIIAStInj";
  this.options = options;
  this.map = map;
  this.lines = [];
  this.fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  this.toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
  this.omap = new OpenLayers.Map("omap", {
    numZoomLevels: 23,
    projection: this.toProjection,
    displayProjection: this.fromProjection,
    eventListeners: {
      "zoomend": $.proxy(this.simplifyByZoom, this)
    }
  });
  var osm = new OpenLayers.Layer.OSM();
  this.omap.addLayer(osm);
  for(var gid in google.maps.MapTypeId) {
    var googleMap = new OpenLayers.Layer.Google("Google " + google.maps.MapTypeId[gid], {
      type: google.maps.MapTypeId[gid],
      sphericalMercator: true
    });
    this.omap.addLayer(googleMap);
  }
  ymaps.ready($.proxy(this.addYandex, this));
  
  var bingRoad = new OpenLayers.Layer.Bing({
    name: "Bing Road",
    type: "Road",
    key: bingKey
  });
  var bingSatellite = new OpenLayers.Layer.Bing({
    name: "Bing Satellite",
    type: "Aerial",
    key: bingKey
  });
  var bingHybrid = new OpenLayers.Layer.Bing({
    name: "Bing Hybrid",
    type: "AerialWithLabels",
    key: bingKey
  });
  this.omap.addLayer(bingRoad);
  this.omap.addLayer(bingSatellite);
  this.omap.addLayer(bingHybrid);
  this.omap.zoomToExtent(this.getBounds());
  this.omap.addControl(new OpenLayers.Control.LayerSwitcher());
  // this.omap.addControl(new OpenLayers.Control.PanZoomBar());
};

OMap.prototype.addYandex = function() {
  var mapKeys = {
    "yandex#map": "map",
    "yandex#satellite": "satellite",
    "yandex#hybrid": "hybrid",
    "yandex#publicMap": "public",
    "yandex#publicMapHybrid": "public hybrid"
  }
  for(var yid in mapKeys) {
    var yandexMap = new OpenLayers.Layer.Yandex("Yandex " + mapKeys[yid], {
      type: yid,
      sphericalMercator: true
    });
    this.omap.addLayer(yandexMap);
  }
}

OMap.prototype.init = function() {
  this.initialized = true;
  for(var i = 0; i < this.lines.length; i++) {
    var line = this.lines[i];
    line.vectorLayer = new OpenLayers.Layer.Vector(line.name, {style: {
      strokeColor: "#" + this.options.strokeColor,
      strokeWidth: this.options.strokeWeight,
      strokeOpacity: this.options.strokeOpacity
    }});
    line.lineString = new OpenLayers.Geometry.LineString(line);
    simplified = line.lineString.simplify(this.getTolerance());
    line.vectorLayer.addFeatures([new OpenLayers.Feature.Vector(simplified)])
    this.omap.addLayer(line.vectorLayer);
  }
  this.markers = new OpenLayers.Layer.Markers("Markers");
  this.markerSize = new OpenLayers.Size(32, 37);
  this.markerOffset = new OpenLayers.Pixel(-(this.markerSize.w/2), -this.markerSize.h);
  this.pointMarker = new OpenLayers.Marker(null, new OpenLayers.Icon(this.options.pointIconUrl, this.markerSize, this.markerOffset));
  this.startMarker = new OpenLayers.Marker(null, new OpenLayers.Icon(this.options.startIconUrl, this.markerSize, this.markerOffset));
  this.endMarker = new OpenLayers.Marker(null, new OpenLayers.Icon(this.options.endIconUrl, this.markerSize, this.markerOffset));
  this.omap.addLayer(this.markers);
};

OMap.prototype.addPoint = function(point) {
  var line = this.lines[this.lines.length - 1];
  if(point.first) {
    line = [];
    line.name = point.track.name
    this.lines.push(line);
  }
  var geometry = new OpenLayers.Geometry.Point(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject());
  line.push(geometry);
};

OMap.prototype.getTolerance = function() {
  var tolerance = (this.omap.getNumZoomLevels() - this.omap.getZoom() - 1) * 2;
  if(tolerance < 0) {
    tolerance = 0;
  }
  return tolerance;
};

OMap.prototype.simplifyByZoom = function() {
  this.omap.getNumZoomLevels();
  for(var i = 0; i < this.lines.length; i++) {
    var line = this.lines[i];
    line.vectorLayer.removeFeatures(line.vectorLayer.features);
    line.vectorLayer.addFeatures([new OpenLayers.Feature.Vector(line.lineString.simplify(this.getTolerance()))])
  }
};

OMap.prototype.elevationOver = function(point) {
  if(point) {
    this.markers.removeMarker(this.pointMarker);
    this.pointMarker.lonlat = new OpenLayers.LonLat(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject());
    if($("#followMap").is(":checked")) {
      this.omap.setCenter(this.pointMarker.lonlat);
    }
    this.markers.addMarker(this.pointMarker);
  }
};

OMap.prototype.startSelection = function(point) {
  this.startSelectionPoint = point;
  this.markers.removeMarker(this.startMarker);
  this.startMarker.lonlat = new OpenLayers.LonLat(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject());
  this.markers.addMarker(this.startMarker);
};

OMap.prototype.endSelection = function(point) {
  this.endSelectionPoint = point;
  this.markers.removeMarker(this.endMarker);
  this.endMarker.lonlat = new OpenLayers.LonLat(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject());
  this.markers.addMarker(this.endMarker);
  this.abounds = this.omap.getExtent();
  this.omap.zoomToExtent(this.getSelectionBounds());
};

OMap.prototype.clearSelection = function(point) {
  this.markers.removeMarker(this.startMarker);
  this.markers.removeMarker(this.endMarker);
  this.omap.zoomToExtent(this.abounds);
};

OMap.prototype.getSelectionBounds = function() {
  var startIndex = this.startSelectionPoint.fullIndex;
  var endIndex = this.endSelectionPoint.fullIndex;
  if(startIndex > endIndex) {
    startIndex = endIndex;
    endIndex = this.startSelectionPoint.fullIndex;
  }
  var points = this.map.points.slice(startIndex, endIndex);
  var bounds = new OpenLayers.Bounds();
  for(var i = 0; i < points.length; i++) {
    var point = points[i];
    bounds.extend(new OpenLayers.LonLat(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject()));
  }
  return bounds;
};

OMap.prototype.getBounds = function() {
  var bounds = new OpenLayers.Bounds();
  bounds.extend(new OpenLayers.LonLat(this.map.min.lon, this.map.min.lat).transform(this.fromProjection, this.omap.getProjectionObject()));
  bounds.extend(new OpenLayers.LonLat(this.map.max.lon, this.map.max.lat).transform(this.fromProjection, this.omap.getProjectionObject()));
  return bounds;
};

// Override modifyAlphaImageDiv function so it doen't reload existent image
OpenLayers.Util.modifyAlphaImageDiv = function(div, id, px, sz, imgURL, 
                                               position, border, sizing, 
                                               opacity) {

    OpenLayers.Util.modifyDOMElement(div, id, px, sz, position,
                                     null, null, opacity);

    var img = div.childNodes[0];

    if (imgURL && img.src.indexOf(imgURL) < 0) {
        img.src = imgURL;
    }
    OpenLayers.Util.modifyDOMElement(img, div.id + "_innerImage", null, sz, 
                                     "relative", border);
    
    if (OpenLayers.Util.alphaHack()) {
        if(div.style.display != "none") {
            div.style.display = "inline-block";
        }
        if (sizing == null) {
            sizing = "scale";
        }
        
        div.style.filter = "progid:DXImageTransform.Microsoft" +
                           ".AlphaImageLoader(src='" + img.src + "', " +
                           "sizingMethod='" + sizing + "')";
        if (parseFloat(div.style.opacity) >= 0.0 && 
            parseFloat(div.style.opacity) < 1.0) {
            div.style.filter += " alpha(opacity=" + div.style.opacity * 100 + ")";
        }

        img.style.filter = "alpha(opacity=0)";
    }
};