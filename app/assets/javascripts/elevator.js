function Elevator() {
  this.data = [];
  this.visiblePoints = [];
  this.width = $("#elevation").innerWidth() - 20;
  this.height = 200;
  this.padding = {top: 20, right: 30, bottom: 10, left: 10};
  $("#canvasElement").attr('width', this.width);
  $("#canvasElement").attr('height', this.height);
  this.canvas = $("#canvasElement").get(0);
  this.context = this.canvas.getContext('2d');
  this.visibleWidth = this.width - this.padding.left - this.padding.right;
  this.visibleHeight = this.height - this.padding.top - this.padding.bottom;
  this.minX = 0, this.maxX = 0, this.minY = 0, this.maxY = 0;
  this.drawAxis();
}

Elevator.prototype.addPoint = function(point) {
  this.data.push({point: point});
  var valueX = point.fullDist;
  var valueY = point.ele;
  this.minX = this.minX > valueX ? valueX : this.minX;
  this.maxX = this.maxX < valueX ? valueX : this.maxX;
  this.minY = this.minY > valueY ? valueY : this.minY;
  this.maxY = this.maxY < valueY ? valueY : this.maxY;
};

Elevator.prototype.init = function() {
  this.processScreenPoints();
  this.draw();
  this.canvas.onmousemove = $.proxy(this.mouseMove, this);
  this.canvas.onmouseout = $.proxy(this.mouseOut, this);
};

Elevator.prototype.processScreenPoints = function() {
  var diffY = this.maxY - this.minY;
  this.factorX = this.maxX / this.visibleWidth;
  this.factorY = this.visibleHeight / (diffY == 0 ? 1 : diffY);
  this.offsetY = this.minY < 0 ? 0 - Math.round(this.minY * this.factorY) : 0;
  // this.offsetX = this.minX < 0 ? 0 - Math.round(this.minX * this.factorX) : 0;
  for(var i = 0; i < this.data.length; i++) {
    var datum = this.data[i];
    datum.screen = this.getScreenPoint(datum);
  }
}

Elevator.prototype.getScreenPoint = function(datum) {
  var x = Math.ceil(datum.point.fullDist / this.factorX + this.padding.left);
  var y = this.visibleHeight - Math.round(datum.point.ele * this.factorY + this.offsetY) + this.padding.top;
  return {x: x, y: y};
}

Elevator.prototype.mouseMove = function(event) {
  var offset = $(this.canvas).offset();
  var x = event.clientX - offset.left;
  x = x >= this.padding.left ? x : this.padding.left;
  x = x <= (this.width - this.padding.right) ? x : (this.width - this.padding.right);
  this.draw();
  this.context.beginPath();
  this.context.moveTo(x, this.padding.top - 3);
  this.context.lineTo(x, this.height - 1);
  this.context.stroke();
  var datum = this.visiblePoints[x];
  if(datum) {
    this.context.fillText(this.getLabel(datum), x, this.padding.top - 5);
    $(document).trigger("elevation:over", datum.point);
  }
};

Elevator.prototype.mouseOut = function(event) {
  this.draw();
  $(document).trigger("elevation:over");
};

Elevator.prototype.getLabel = function(datum) {
  var value = datum.point.ele + '';
  var parts = value.split('.');
  return parts[0] + (parts[1] ? '.' + parts[1].substring(0, 2) : '') + ' m.';
};

Elevator.prototype.clear = function() {
  this.context.clearRect(1, 0, this.width, this.height - 1);
};

Elevator.prototype.draw = function() {
  this.clear();
  if(this.data.length > 1) {
    this.drawGraph();
  }
};

// Elevator.prototype.getSampleData = function() {
//   var data = [];
//   var quantity = 1800;
//   for(var i = -quantity/2; i <= quantity/2; i++) {
//     var x = i * (10 * Math.PI) / quantity;
//     data.push(new Datum([i, Math.sin(x)]));
//   }
//   return data;
// };

Elevator.prototype.drawAxis = function() {
  this.context.beginPath();
  this.context.moveTo(0, 0);
  this.context.lineTo(0, this.height);
  this.context.lineTo(this.width, this.height);
  this.context.stroke();
};

Elevator.prototype.drawGraph = function() {
  this.visiblePoints = [];
  var previous = this.data[0];
  this.visiblePoints[previous.screen.x] = previous;
  this.context.beginPath();
  this.context.moveTo(previous.screen.x, previous.screen.y);
  for(var i = 0; i < this.data.length; i++) {
    var datum = this.data[i];
    this.context.quadraticCurveTo(
      previous.screen.x, previous.screen.y,
      datum.screen.x, datum.screen.y
    );
    this.visiblePoints[datum.screen.x] = datum;
    previous = datum;
  }
  this.context.stroke();
};
