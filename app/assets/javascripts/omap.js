var OMap = function(options, map) {
  var bingKey = "Ao6QQK5LyzSSNm9cazeItyOqY9nXSOXlAI-eztC52UzaiG257z_t0NGRIIAStInj";
  this.options = options;
  this.map = map;
  this.lines = [];
  this.fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  this.toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
  this.toggleModifiersBound = $.proxy(this.toggleModifiers, this);
  this.omap = new OpenLayers.Map("omap", {
    numZoomLevels: 23,
    projection: this.toProjection,
    displayProjection: this.fromProjection,
    eventListeners: {
      "zoomend": $.proxy(this.zoomend, this),
      "addlayer": this.toggleModifiersBound,
      "changelayer": this.toggleModifiersBound
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
  // ymaps.ready($.proxy(this.addYandex, this));
  
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
  this.omap.addControl(new OpenLayers.Control.LayerSwitcher());
  this.omap.addControl(new OpenLayers.Control.FullScreen());
  $(document).bind('point:removed', $.proxy(this.pointRemoved, this));
  $(document).bind('point:returned', $.proxy(this.pointReturned, this));
  this.omap.events.register('click', this, this.mapClicked);
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
};

OMap.prototype.init = function() {
  if(!this.initialized) {
    this.modifierMarkers = new OpenLayers.Layer.Markers("Modifiers");
    this.modifierPointSize = new OpenLayers.Size(12, 12);
    this.modifierPointOffset = new OpenLayers.Pixel(-6, -6);

    this.markers = new OpenLayers.Layer.Markers("Markers");
    this.markerSize = new OpenLayers.Size(32, 37);
    this.markerOffset = new OpenLayers.Pixel(-(this.markerSize.w/2), -this.markerSize.h);
    this.pointMarker = new OpenLayers.Marker(null, new OpenLayers.Icon(this.options.pointIconUrl, this.markerSize, this.markerOffset));
    this.startMarker = new OpenLayers.Marker(null, new OpenLayers.Icon(this.options.startIconUrl, this.markerSize, this.markerOffset));
    this.endMarker = new OpenLayers.Marker(null, new OpenLayers.Icon(this.options.endIconUrl, this.markerSize, this.markerOffset));
    this.omap.addLayer(this.markers);
    this.omap.zoomToExtent(this.getBounds());
    this.lines = [];
    this.points = [];
    for(var i = 0; i < Map.tracks.length; i++) {
      var track = Map.tracks[i];
      var line = {};
      this.lines.push(line);
      line.vectorLayer = new OpenLayers.Layer.Vector(track.name, {style: {
        strokeColor: "#" + this.options.strokeColor,
        strokeWidth: this.options.strokeWeight,
        strokeOpacity: this.options.strokeOpacity
      }});
      line.lineString = new OpenLayers.Geometry.LineString();
      for(var j = 0; j < track.points.length; j++) {
        var point = track.points[j];
        if(point) {
          var geometry = new OpenLayers.Geometry.Point(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject());
          line.lineString.addPoint(geometry);
          if(Map.edit_mode) {
            geometry.line = line;
            var modifierPointIcon = new OpenLayers.Icon(this.options.modifierIconUrl, this.modifierPointSize, this.modifierPointOffset);
            modifierPointIcon.imageDiv.className = 'modifierPointIcon';
            var modifierMarker = new OpenLayers.Marker(new OpenLayers.LonLat(geometry.x, geometry.y), modifierPointIcon);
            modifierMarker.events.register('click', point.fullIndex, this.modifierClicked);
            modifierMarker.events.register('mouseover', point.fullIndex, this.modifierOver);
            this.modifierMarkers.addMarker(modifierMarker);
            this.points[point.fullIndex] = {geometry: geometry, modifierMarker: modifierMarker};
          }
        }
      }
      this.omap.addLayer(line.vectorLayer);
    }
    this.placePhotos();
    this.simplifyByZoom();
    this.initialized = true;
  }
};

OMap.prototype.placePhotos = function() {
  if(Map.photos && Map.photos.length > 0) {
    this.photoMarkers = new OpenLayers.Layer.Markers("Photos");
    this.photoSize = new OpenLayers.Size(24, 24);
    this.photoOffset = new OpenLayers.Pixel(-12, -24);
    for(var i = 0; i < Map.photos.length; i++) {
      var photo = Map.photos[i];
      var photoIcon = new OpenLayers.Icon(photo.iconUrl, this.photoSize, this.photoOffset);
      photoIcon.imageDiv.className = "photoIcon";
      var photoLonLat = new OpenLayers.LonLat(photo.lon, photo.lat).transform(this.fromProjection, this.omap.getProjectionObject());
      var photoMarker = new OpenLayers.Marker(photoLonLat, photoIcon);
      photoMarker.events.register('click', photo, this.photoClicked);
      this.photoMarkers.addMarker(photoMarker);
      if(photo.direction) {
        var pointer = document.createElement("div");
        pointer.innerHTML = "<span></span>"
        pointer.className = "pointer";
        rotate(pointer, photo.direction - 45);
        photoIcon.imageDiv.appendChild(pointer);
      }
    }
    this.omap.addLayer(this.photoMarkers);
  }
};

OMap.prototype.photoClicked = function(evt) {
  $("#previewImg").attr('src', this.previewUrl);
  $("#previewLink").attr('href', this.photoUrl).blur();
  $("#previewPhoto").show();
};

OMap.prototype.mapClicked = function(evt) {
  $("#previewPhoto").hide();
};

OMap.prototype.getTolerance = function() {
  var tolerance = this.omap.getNumZoomLevels() - this.omap.getZoom() - 1;
  if(tolerance < 0 || tolerance <= 5 && this.omap.getNumZoomLevels() > 19) {
    tolerance = 0;
  } else {
    tolerance = Math.pow(tolerance, 2) / 2
  }
  return tolerance;
};

OMap.prototype.simplifyByZoom = function() {
  for(var i = 0; i < this.lines.length; i++) {
    this.redrawTrack(this.lines[i]);
  }
};

OMap.prototype.zoomed = function() {
  this.simplifyByZoom();
  this.toggleModifiers();
};

OMap.prototype.toggleModifiers = function() {
  if(Map.edit_mode) {
    if(this.omap.getNumZoomLevels() - this.omap.getZoom() > 4) {
      if(this.omap.getLayerIndex(this.modifierMarkers) >= 0) {
        this.omap.removeLayer(this.modifierMarkers);
      }
    } else {
      if(this.omap.getLayerIndex(this.modifierMarkers) < 0) {
        this.omap.addLayer(this.modifierMarkers);
      }
    }
  }
};

OMap.prototype.modifierClicked = function(evt) {
  $(document).trigger("modifier:clicked", this);
  OpenLayers.Event.stop(evt);
};

OMap.prototype.modifierOver = function(evt) {
  $(document).trigger("modifier:over", this);
  OpenLayers.Event.stop(evt);
};

OMap.prototype.redrawTrack = function(line) {
  line.vectorLayer.removeFeatures(line.vectorLayer.features);
  line.vectorLayer.addFeatures([new OpenLayers.Feature.Vector(line.lineString.simplify(this.getTolerance()))])
};

OMap.prototype.pointRemoved = function(evt, index) {
  var o = this.points[index];
  o.removedIndex = _.indexOf(o.geometry.line.lineString.components, o.geometry);
  o.geometry.line.lineString.removePoint(o.geometry);
  this.modifierMarkers.removeMarker(o.modifierMarker);
  this.redrawTrack(o.geometry.line);
};

OMap.prototype.pointReturned = function(evt, index) {
  var o = this.points[index];
  o.geometry.line.lineString.addPoint(o.geometry, o.removedIndex);
  this.modifierMarkers.addMarker(o.modifierMarker);
  this.redrawTrack(o.geometry.line);
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
  // this.omap.zoomIn();
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
    if(point) {
      bounds.extend(new OpenLayers.LonLat(point.lon, point.lat).transform(this.fromProjection, this.omap.getProjectionObject()));
    }
  }
  return bounds;
};

OMap.prototype.getBounds = function() {
  var bounds = new OpenLayers.Bounds();
  bounds.extend(new OpenLayers.LonLat(this.map.min.lon, this.map.min.lat).transform(this.fromProjection, this.omap.getProjectionObject()));
  bounds.extend(new OpenLayers.LonLat(this.map.max.lon, this.map.max.lat).transform(this.fromProjection, this.omap.getProjectionObject()));
  return bounds;
};

function rotate(object, degrees) {
  $(object).css({
  '-webkit-transform' : 'rotate('+degrees+'deg)',
     '-moz-transform' : 'rotate('+degrees+'deg)',  
      '-ms-transform' : 'rotate('+degrees+'deg)',  
       '-o-transform' : 'rotate('+degrees+'deg)',  
          'transform' : 'rotate('+degrees+'deg)',  
               'zoom' : 1

    });
}
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