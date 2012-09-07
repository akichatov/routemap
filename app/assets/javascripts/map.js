var Map = function() {
  this.options = {
    strokeColor: 'FF0000',
    strokeColors: ['FF0000', '0000FF'],
    strokeOpacity: 0.6,
    strokeWeight: 3
  };
  this.initTracks();
  this.gmap = new GMap(this.options, this);
  this.ymap = new YMap(this.options, this);
  this.currentMap = this.gmap;
  this.elevator = new Elevator();
  this.metersPerPixel = this.tracks_distance / this.elevator.visibleWidth;
  for(var i = 0; i < Map.tracks.length; i++) {
    this.initTrack(Map.tracks[i], i);
  }
  this.elevator.init();
  this.currentMap.init();
  $(document).bind('elevation:over', $.proxy(this.elevationOver, this));
  $(document).bind('selection:start', $.proxy(this.startSelection, this));
  $(document).bind('selection:end', $.proxy(this.endSelection, this));
  $(document).bind('selection:clear', $.proxy(this.clearSelection, this));
  $("#gmap_toggle, #ymap_toggle").click($.proxy(this.toggle, this));
};

Map.prototype.initTracks = function() {
  this.tracks_distance = 0;
  this.climb = 0;
  this.descent = 0;
  this.min = {lat: Map.tracks[0].min.lat, lon: Map.tracks[0].min.lon, ele: Map.tracks[0].min.ele};
  this.max = {lat: Map.tracks[0].max.lat, lon: Map.tracks[0].max.lon, ele: Map.tracks[0].max.ele};
  for(var i = 0; i < Map.tracks.length; i++) {
    var track = Map.tracks[i];
    this.tracks_distance += track.distance;
    this.climb += track.climb;
    this.descent += track.descent;
    this.min.lat = this.min.lat > track.min.lat ? track.min.lat : this.min.lat;
    this.max.lat = this.max.lat < track.max.lat ? track.max.lat : this.max.lat;
    this.min.lon = this.min.lon > track.min.lon ? track.min.lon : this.min.lon;
    this.max.lon = this.max.lon < track.max.lon ? track.max.lon : this.max.lon;
    this.min.ele = this.min.ele > track.min.ele ? track.min.ele : this.min.ele;
    this.max.ele = this.max.ele < track.max.ele ? track.max.ele : this.max.ele;
  }
};

Map.prototype.toggle = function(event) {
  var mapType = event.target.value;
  $("#maps .map").hide();
  $("#" + mapType).show();
  this.currentMap = this[mapType];
  if(!this.currentMap.initialized) {
    this.currentMap.init();
  }
};

Map.prototype.initTrack = function(track, trackIndex) {
  track.normalized = [];
  for(var i = 0; i < track.points.length; i++) {
    var point = track.points[i];
    point.time = new Date(Date.parse(point.time)).toUTCString();
    track.normalized.push(point);
    // var next = track.points[i + 1];
    // if(next && next.dist / this.metersPerPixel > 1.0) {
    //   track.normalized = track.normalized.concat(this.getIntermediations(point, next));
    // }
  }
  var dist = 0.0;
  for(var i = 1; i <= trackIndex; i++) {
    dist += Map.tracks[trackIndex - i].distance;
  }
  for(var i = 0; i < track.normalized.length; i++) {
    var point = track.normalized[i];
    point.track = track;
    point.first = i == 0;
    dist += (point.new_dist || point.dist);
    point.fullDist = dist;
    point.index = i;
    this.initPoint(point);
  }
};

Map.prototype.initPoint = function(point) {
  this.gmap.addPoint(point);
  this.ymap.addPoint(point);
  this.elevator.addPoint(point);
};

Map.prototype.getIntermediations = function(p1, p2) {
  var result = [];
  var count = Math.ceil(p2.dist / this.metersPerPixel);
  if(count > 1) {
    var dist = p2.dist / count;
    p2.new_dist = dist;
    for(var i = 1; i < count; i++) {
      var lat = p1.lat + i * (p2.lat - p1.lat) / count;
      var lon = p1.lon + i * (p2.lon - p1.lon) / count;
      var next = {
        dist: dist,
        ele: p1.ele + i * (p2.ele - p1.ele) / count,
        lat: lat,
        lon: lon,
        time: new Date(Date.parse(p1.time) + i * (Date.parse(p2.time) - Date.parse(p1.time)) / count).toUTCString(),
        generated: true
      };
      result.push(next);
    }
  }
  return result;
}

Map.prototype.elevationOver = function(event, point) {
  clearTimeout(this.elevationOverTimeout);
  this.elevationOverTimeout = setTimeout($.proxy(this.doElevationOver, this, event, point), 1);
};

Map.prototype.doElevationOver = function(event, point) {
  this.currentMap.elevationOver(point);
  if(point) {
    $("#time").html(point.time);
    $("#pointEle").html(point.ele.toFixed(2));
    $("#pointMeters").html(point.fullDist.toFixed(2));
    $("#pointKms").html((point.fullDist / 1000).toFixed(2));
    $("#pointSpeed").html(this.getSpeed(point));
  }
};

Map.prototype.startSelection = function(event, point) {
  this.startSelectionPoint = point;
  this.currentMap.startSelection(point);
  $("#selectionStartEle").html(point.ele);
};

Map.prototype.endSelection = function(event, point) {
  this.endSelectionPoint = point;
  this.currentMap.endSelection(point);
  $("#selectionEndEle").html(point.ele);
  $("#selectionDistance").html(this.getSelectionDistance().toFixed(2));
};

Map.prototype.clearSelection = function(event, point) {
  this.currentMap.clearSelection(point);
  $("#selectionStartEle, #selectionEndEle, #selectionDistance").html('');
};

Map.prototype.getSelectionDistance = function() {
  return Math.abs(this.startSelectionPoint.fullDist - this.endSelectionPoint.fullDist);
};

Map.prototype.getSpeed = function(point) {
  var time = 0;
  var dist = 0;
  var i = 1;
  var previous = point.track.normalized[point.index - i];
  while(previous && time < 1) {
    time += (Date.parse(point.time) - Date.parse(previous.time)) / 1000;
    dist = point.fullDist - previous.fullDist;
    i++;
    previous = point.track.normalized[point.index - i];
  }
  if(time > 0) {
    return ((dist / 1000) / (time / 3600)).toFixed(2);
  }
  return 0.0;
};

$(function() {
  $("#maps .map").height($(window).height() - 280);
  var map = new Map();
  $("#distance_km").html((map.tracks_distance / 1000).toFixed(2));
  $("#ele_min").html(map.min.ele);
  $("#ele_max").html(map.max.ele);
  $("#climb").html(map.climb.toFixed(2));
  $("#descent").html(map.descent.toFixed(2));
  setTimeout(function() {
    $("#cover").hide();
  }, 500);
});