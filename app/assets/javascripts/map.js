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
    modifierIconUrl: '/assets/1x1.png'
  };
  $(document).bind('elevation:over', $.proxy(this.elevationOver, this));
  $(document).bind('selection:start', $.proxy(this.startSelection, this));
  $(document).bind('selection:end', $.proxy(this.endSelection, this));
  $(document).bind('selection:clear', $.proxy(this.clearSelection, this));
  $(document).bind('point:removed', $.proxy(this.pointRemoved, this));
  $(document).bind('modifier:clicked', $.proxy(this.modifierClicked, this));
  $(document).bind('modifier:over', $.proxy(this.modifierOver, this));
  $("#undoLink").click($.proxy(this.undoClicked, this));
  $("#saveRemovals").click($.proxy(this.saveRemovals, this));
  this.pointRemovedCallbackBound = $.proxy(this.pointRemovedCallback, this);
  this.saveRemovalsCallbackBound = $.proxy(this.saveRemovalsCallback, this);
  this.doSliceTrackBound = $.proxy(this.doSliceTrack, this);
  this.removedPoints = [];
  this.omap = new OMap(this.options, this);
  this.elevator = new Elevator(this);
};

Map.prototype.init = function() {
  this.initTracks();
  this.points = [];
  for(var i = 0; i < Map.tracks.length; i++) {
    this.initTrack(Map.tracks[i], i);
  }
  this.elevator.init();
  this.updateTrackInfo();
};

Map.prototype.initTracks = function() {
  var minIterator = function(t) { return t.min[this.toString()] };
  var maxIterator = function(t) { return t.max[this.toString()] };
  var sumIterator = function(sum, t) { return sum + t[this.toString()] };
  this.tracks_distance = _.reduce(Map.tracks, sumIterator, 0, 'distance');
  this.climb = _.reduce(Map.tracks, sumIterator, 0, 'climb');
  this.descent = _.reduce(Map.tracks, sumIterator, 0, 'descent');
  this.min = {
    lat: _.min(Map.tracks, minIterator, 'lat').min.lat,
    lon: _.min(Map.tracks, minIterator, 'lon').min.lon,
    ele: _.min(Map.tracks, minIterator, 'ele').min.ele
  };
  this.max = {
    lat: _.max(Map.tracks, maxIterator, 'lat').max.lat,
    lon: _.max(Map.tracks, maxIterator, 'lon').max.lon,
    ele: _.max(Map.tracks, maxIterator, 'ele').max.ele
  };
};

Map.prototype.initTrack = function(track, trackIndex) {
  var dist = 0.0;
  var fullIndex = 0;
  for(var i = 1; i <= trackIndex; i++) {
    var t = Map.tracks[trackIndex - i];
    fullIndex += t.points.length;
    dist += t.distance;
  }
  for(var i = 0; i < track.points.length; i++) {
    var point = track.points[i];
    if(point) {
      point.track = track;
      point.fdist += dist;
      point.date_time = new timezoneJS.Date(point.time * 1000, track.timezone).toString();
      point.fullIndex = fullIndex + i;
    }
    this.points.push(point);
  }
};

Map.prototype.elevationOver = function(event, point) {
  if(point) {
    this.updatePointInfo(point);
    this.omap.elevationOver(point);
  }
};

Map.prototype.updatePointInfo = function(point) {
  $("#time").html(point.date_time);
  $("#pointEle").html(point.ele.toFixed(2));
  $("#pointMeters").html(point.fdist.toFixed(2));
  $("#pointKms").html((point.fdist / 1000).toFixed(2));
  $("#pointSpeed").html(point.speed);
};

Map.prototype.updateTrackInfo = function() {
  $("#distance_km").html((this.tracks_distance / 1000).toFixed(2));
  $("#ele_min").html(this.min.ele);
  $("#ele_max").html(this.max.ele);
  $("#climb").html(this.climb);
  $("#descent").html(this.descent);
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

Map.prototype.modifierOver = function(event, pointIndex) {
  var point = this.points[pointIndex];
  if(point) {
    this.updatePointInfo(point);
  }
};

Map.prototype.pointRemoved = function(event, pointIndex) {
  this.removedPoints.push(pointIndex);
  $("#undoCount").html(this.removedPoints.length);
  $("#undo").toggle(this.removedPoints.length > 0);
  this.sliceTrack();
};

Map.prototype.pointRemovedCallback = function(data, status) {
  $("#sliceLoader").hide();
  this.init();
};

Map.prototype.undoClicked = function(event) {
  $(document).trigger("point:returned", this.removedPoints.pop());
  $("#undoCount").html(this.removedPoints.length);
  $("#undo").toggle(this.removedPoints.length > 0);
  this.sliceTrack();
  return false;
};

Map.prototype.sliceTrack = function() {
  clearTimeout(this.sliceTrackTimeout);
  this.sliceTrackTimeout = setTimeout(this.doSliceTrackBound, 1000);
};

Map.prototype.doSliceTrack = function() {
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
  $("#maps .map").height($(window).height() - 310);
  $("#maps .map").width($(window).width() - 280);
  var map = new Map();
  map.init();
  map.omap.init();
  setTimeout(function() {
    $("#cover").hide();
  }, 500);
});