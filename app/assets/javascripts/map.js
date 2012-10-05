var Map = function() {
  this.options = {
    strokeColor: 'FF0000',
    strokeColors: ['FF0000', '0000FF'],
    strokeOpacity: 0.6,
    strokeWeight: 3,
    pointIconUrl: '/assets/point-flag.png',
    startIconUrl: '/assets/start-flag.png',
    endIconUrl: '/assets/finish-flag.png'
  };
  this.points = [];
  this.initTracks();
  this.omap = new OMap(this.options, this);
  this.currentMap = this.omap;
  this.elevator = new Elevator();
  this.metersPerPixel = this.tracks_distance / this.elevator.visibleWidth;
  for(var i = 0; i < Map.tracks.length; i++) {
    this.initTrack(Map.tracks[i], i);
  }
  this.elevator.init();
  this.omap.init();
  $(document).bind('elevation:over', $.proxy(this.elevationOver, this));
  $(document).bind('selection:start', $.proxy(this.startSelection, this));
  $(document).bind('selection:end', $.proxy(this.endSelection, this));
  $(document).bind('selection:clear', $.proxy(this.clearSelection, this));
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

Map.prototype.initTrack = function(track, trackIndex) {
  var dist = 0.0;
  for(var i = 1; i <= trackIndex; i++) {
    dist += Map.tracks[trackIndex - i].distance;
  }
  for(var i = 0; i < track.points.length; i++) {
    var point = track.points[i];
    point.first = i == 0;
    point.track = track;
    point.fdist += dist;
    point.index = i;
    point.time = new timezoneJS.Date(point.time * 1000, track.timezone).toString();
    point.fullIndex = this.points.length;
    this.points.push(point);
    this.omap.addPoint(point);
    this.elevator.addPoint(point);
  }
};

Map.prototype.elevationOver = function(event, point) {
  clearTimeout(this.elevationOverTimeout);
  if(point) {
    $("#time").html(point.time);
    $("#pointEle").html(point.ele.toFixed(2));
    $("#pointMeters").html(point.fdist.toFixed(2));
    $("#pointKms").html((point.fdist / 1000).toFixed(2));
    $("#pointSpeed").html(point.speed);
  }
  this.doElevationOver(event, point);
  // this.elevationOverTimeout = setTimeout($.proxy(this.doElevationOver, this, event, point), 10);
};

Map.prototype.doElevationOver = function(event, point) {
  this.currentMap.elevationOver(point);
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
  return Math.abs(this.startSelectionPoint.fdist - this.endSelectionPoint.fdist);
};

timezoneJS.timezone.zoneFileBasePath = '/tz';
timezoneJS.timezone.defaultZoneFile = ['europe', 'northamerica'];
timezoneJS.timezone.init({ async: false });
$(function() {
  $("#maps .map").height($(window).height() - 280);
  $("#maps .map").width($(window).width() - 280);
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