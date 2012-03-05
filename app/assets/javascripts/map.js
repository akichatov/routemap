var Map = function() {
  this.data = [];
  $(document).bind('elevation:over', $.proxy(this.elevationOver, this));
  this.elevationPoints = [];
  this.options = {
    center: this.getBounds().getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map($("#map").get(0), this.options);
  this.elevator = new Elevator();
  this.metersPerPixel = track.hdistance / this.elevator.visibleWidth;
  var normalized = [];
  var path = [];
  for(var i = 0; i < track.points.length; i++) {
    var point = track.points[i];
    point.time = new Date(Date.parse(point.time)).toUTCString();
    normalized.push(point);
    path.push(new google.maps.LatLng(point.lat, point.lon));
    var next = track.points[i + 1];
    if(next && next.dist / this.metersPerPixel > 1) {
      normalized = normalized.concat(this.getIntermediations(point, next));
    }
  }
  var dist = 0.0;
  for(var i = 0; i < normalized.length; i++) {
    var point = normalized[i];
    var latLng = new google.maps.LatLng(point['lat'], point['lon']);
    var marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: "Alt:" + point['ele'],
      visible: false,
      flat: true
    });
    var elevationDatum = new Datum([dist + point.dist, point.ele]);
    elevationDatum.index = i;
    elevationDatum.generated = point.generated;
    this.elevationPoints.push(elevationDatum);
    this.data.push({point: point, latLng: latLng, marker: marker, elevationDatum: elevationDatum, totalDist: dist});
    dist += point.dist;
  }
  var line = new google.maps.Polyline({
    path: path,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  line.setMap(this.map);
  this.map.fitBounds(this.getBounds());
  this.elevator.setData(this.elevationPoints);
  // this.elevator.setData(this.elevator.getSampleData());
  this.elevator.draw();
};

Map.prototype.getIntermediations = function(p1, p2) {
  var result = [];
  var count = Math.ceil(p2.dist / this.metersPerPixel);
  for(var i = 1; i < count; i++) {
    var next = {
      dist: p2.dist / count,
      ele: p1.ele + i * (p2.ele - p1.ele) / count,
      lon: p1.lon + i * (p2.lon - p1.lon) / count,
      lat: p1.lat + i * (p2.lat - p1.lat) / count,
      time: new Date(Date.parse(p1.time) + i * (Date.parse(p2.time) - Date.parse(p1.time)) / count).toUTCString(),
      generated: true
    };
    // console.log('next',next.dist)
    result.push(next);
  }
  p2.dist = p2.dist / count;
  return result;
}

Map.prototype.elevationOver = function(event, datum) {
  if(this.visibleMarker) {
    this.visibleMarker.setVisible(false);
  }
  if(datum && datum.index) {
    this.visibleMarker = this.data[datum.index].marker;
    this.visibleMarker.setVisible(true);
    $("#time").html(this.data[datum.index].point.time);
    $("#pointEle").html(this.data[datum.index].point.ele.toFixed(2));
    $("#pointMeters").html(this.data[datum.index].totalDist.toFixed(2));
    $("#pointKms").html((this.data[datum.index].totalDist / 1000).toFixed(2));
    var speed = this.getSpeed(datum.index);
    if(speed != null) {
      $("#pointSpeed").html(speed);
    }
    if($("#followMap:checked").size()) {
      this.map.setCenter(this.visibleMarker.position);
    }
  }
};

Map.prototype.getSpeed = function(index) {
  var point = this.data[index].point;
  var dist = point.dist;
  var time = 0;
  var i = 0;
  var previous = null;
  do {
    if(previous) {
      time += (Date.parse(point.time) - Date.parse(previous.point.time)) / 1000;
      if(i > 1) {
        dist += this.data[index - i + 1].point.dist;
      }
    }
    i++;
    previous = this.data[index - i];
  } while (previous && time < 3);
  if(time > 0) {
    return ((dist / 1000) / (time / 3600)).toFixed(2);
  }
  return null;
};

Map.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(new google.maps.LatLng(track.min.lat, track.min.lon));
  bounds.extend(new google.maps.LatLng(track.max.lat, track.max.lon));
  return bounds;
};

$(function() {
  new Map();
  $("#hdistance").html(track.hdistance.toFixed(2));
  $("#htdistance").html(track.htdistance.toFixed(2));
  $("#ele_min").html(track.min.ele);
  $("#ele_max").html(track.max.ele);
  $("#climb").html(track.climb.toFixed(2));
  $("#descent").html(track.descent.toFixed(2));
});