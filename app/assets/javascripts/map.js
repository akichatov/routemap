var Map = function() {
  this.options = {
    strokeColor: 'FF0000',
    strokeOpacity: 0.6,
    strokeWeight: 3
  };
  this.gmap = new GMap(this.options);
  this.ymap = new YMap(this.options);
  this.currentMap = this.gmap;
  this.elevator = new Elevator();
  this.metersPerPixel = Map.track.distance / this.elevator.visibleWidth;
  this.normalized = [];
  this.initTrack();
  this.elevator.init();
  this.currentMap.init();
  $(document).bind('elevation:over', $.proxy(this.elevationOver, this));
  $(document).bind('selection:start', $.proxy(this.startSelection, this));
  $(document).bind('selection:end', $.proxy(this.endSelection, this));
  $(document).bind('selection:clear', $.proxy(this.clearSelection, this));
  $("#gmap_toggle, #ymap_toggle").click($.proxy(this.toggle, this));
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

Map.prototype.initTrack = function() {
  for(var i = 0; i < Map.track.points.length; i++) {
    var point = Map.track.points[i];
    point.time = new Date(Date.parse(point.time)).toUTCString();
    this.normalized.push(point);
    var next = Map.track.points[i + 1];
    if(next && next.dist / this.metersPerPixel > 1.0) {
      this.normalized = this.normalized.concat(this.getIntermediations(point, next));
    }
  }
  var dist = 0.0;
  for(var i = 0; i < this.normalized.length; i++) {
    var point = this.normalized[i];
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
  this.currentMap.elevationOver(point);
  if(point) {
    $("#time").html(point.time);
    $("#pointEle").html(point.ele.toFixed(2));
    $("#pointMeters").html(point.fullDist.toFixed(2));
    $("#pointKms").html((point.fullDist / 1000).toFixed(2));
    var speed = this.getSpeed(point.index);
    if(speed != null) {
      $("#pointSpeed").html(speed);
    }
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

Map.prototype.getSpeed = function(index) {
  var point = this.normalized[index];
  var dist = point.dist;
  var time = 0;
  var i = 0;
  var previous = null;
  do {
    if(previous) {
      time += (Date.parse(point.time) - Date.parse(previous.time)) / 1000;
      if(i > 1) {
        dist += this.normalized[index - i + 1].dist;
      }
    }
    i++;
    previous = this.normalized[index - i];
  } while (previous && time < 3);
  if(time > 0) {
    return ((dist / 1000) / (time / 3600)).toFixed(2);
  }
  return null;
};

$(function() {
  new Map();
  $("#distance_m").html(Map.track.distance.toFixed(2));
  $("#distance_km").html((Map.track.distance / 1000).toFixed(2));
  $("#ele_min").html(Map.track.min.ele);
  $("#ele_max").html(Map.track.max.ele);
  $("#climb").html(Map.track.climb.toFixed(2));
  $("#descent").html(Map.track.descent.toFixed(2));
  setTimeout(function() {
    $("#cover").hide();
  }, 500);
});