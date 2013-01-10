//= require underscore-min
//= require timezone-js/date
//= require yandex
//= require full_screen
//= require elevator
//= require omap
//= require_self

var Map = function() {
  this.options = {
    strokeColor: 'FF0000',
    strokeColors: ['FF0000', '0000FF'],
    strokeOpacity: 0.6,
    strokeWeight: 3,
    pointIconUrl: '/assets/point-flag.png',
    startIconUrl: '/assets/start-flag.png',
    endIconUrl: '/assets/finish-flag.png',
    modifierIconUrl: '/assets/point_a.png'
  };
  $(document).bind('elevation:over', $.proxy(this.elevationOver, this));
  $(document).bind('selection:start', $.proxy(this.startSelection, this));
  $(document).bind('selection:end', $.proxy(this.endSelection, this));
  $(document).bind('selection:clear', $.proxy(this.clearSelection, this));
  $(document).bind('point:removed', $.proxy(this.pointRemoved, this));
  $(document).bind('modifier:clicked', $.proxy(this.modifierClicked, this));
  $("#undoLink").click($.proxy(this.undoClicked, this));
  $("#saveRemovals").click($.proxy(this.saveRemovals, this));
  this.pointRemovedCallbackBound = $.proxy(this.pointRemovedCallback, this);
  this.saveRemovalsCallbackBound = $.proxy(this.saveRemovalsCallback, this);
  this.removedPoints = [];
  this.omap = new OMap(this.options, this);
  this.elevator = new Elevator(this);
};

Map.prototype.init = function() {
  this.points = [];
  this.initTracks();
  this.metersPerPixel = this.tracks_distance / this.elevator.visibleWidth;
  for(var i = 0; i < Map.tracks.length; i++) {
    this.initTrack(Map.tracks[i], i);
  }
  this.elevator.init();
  // this.omap.init();
  $("#undoCount").html(this.removedPoints.length);
  $("#undo").toggle(this.removedPoints.length > 0);
  $("#distance_km").html((this.tracks_distance / 1000).toFixed(2));
  $("#ele_min").html(this.min.ele);
  $("#ele_max").html(this.max.ele);
  $("#climb").html(this.climb.toFixed(2));
  $("#descent").html(this.descent.toFixed(2));
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
  var fullIndex = 0;
  for(var i = 1; i <= trackIndex; i++) {
    var track = Map.tracks[trackIndex - i];
    fullIndex += track.points.length;
    dist += track.distance;
  }
  for(var i = 0; i < track.points.length; i++) {
    var point = track.points[i];
    if(point) {
      point.track = track;
      point.fdist += dist;
      point.time = new timezoneJS.Date(point.time * 1000, track.timezone).toString();
      point.fullIndex = fullIndex + i;
      this.points.push(point);
    }
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
  this.omap.elevationOver(point);
};

Map.prototype.startSelection = function(event, point) {
  this.startSelectionPoint = point;
  this.omap.startSelection(point);
  $("#selectionStartEle").html(point.ele);
};

Map.prototype.endSelection = function(event, point) {
  this.endSelectionPoint = point;
  this.omap.endSelection(point);
  $("#selectionEndEle").html(point.ele);
  $("#selectionDistance").html(this.getSelectionDistance().toFixed(2));
};

Map.prototype.clearSelection = function(event, point) {
  this.omap.clearSelection(point);
  $("#selectionStartEle, #selectionEndEle, #selectionDistance").html('');
};

Map.prototype.modifierClicked = function(event, pointIndex) {
  if(this.points.length - this.removedPoints.length > 2) {
    $(document).trigger("point:removed", pointIndex);
  }
};

Map.prototype.pointRemoved = function(event, pointIndex) {
  this.removedPoints.push(pointIndex);
  this.sliceTrack();
};

Map.prototype.pointRemovedCallback = function(data, status) {
  $("#sliceLoader").hide();
  $("#undo").show();
  this.init();
};

Map.prototype.undoClicked = function(event) {
  $(document).trigger("point:returned", this.removedPoints.pop());
  this.sliceTrack();
  return false;
};

Map.prototype.sliceTrack = function() {
  $("#undo").hide();
  $("#sliceLoader").show();
  $.post(Map.slice_path, {
    'excludes[]': this.removedPoints
  }, this.pointRemovedCallbackBound);
};

Map.prototype.saveRemovals = function() {
  $.post(Map.save_slice_path, {
    'excludes[]': this.removedPoints
  }, this.saveRemovalsCallbackBound);
};

Map.prototype.saveRemovalsCallback = function(data, status) {
  this.removedPoints = [];
  document.location = Map.track_path;
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
  map.init();
  // map.elevator.init();
  map.omap.init();
  
  setTimeout(function() {
    $("#cover").hide();
  }, 500);
});