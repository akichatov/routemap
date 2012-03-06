function Elevator() {
  this.width = $("#elevation").innerWidth() - 20;
  this.height = 200;
  this.padding = {top: 20, right: 30, bottom: 10, left: 10};
  $("#canvasElement").attr('width', this.width);
  $("#canvasElement").attr('height', this.height);
  this.canvas = $("#canvasElement").get(0);
  this.context = this.canvas.getContext('2d');
  this.canvas.onmousemove = $.proxy(this.mouseMove, this);
  this.canvas.onmouseout = $.proxy(this.mouseOut, this);
  this.visibleWidth = this.width - this.padding.left - this.padding.right;
  this.visibleHeight = this.height - this.padding.top - this.padding.bottom;
  this.drawAxis();
  this.counter = 0;
}

Elevator.prototype.setData = function(data) {
  this.data = this.normalize(data);
}

Elevator.prototype.normalize = function(data) {
  this.minX = 0, this.maxX = 0, this.minY = 0, this.maxY = 0;
  for(var i = 0; i < data.length; i++) {
    var datum = data[i];
    var valueX = datum.first();
    var valueY = datum.last();
    this.minX = this.minX > valueX ? valueX : this.minX;
    this.maxX = this.maxX < valueX ? valueX : this.maxX;
    this.minY = this.minY > valueY ? valueY : this.minY;
    this.maxY = this.maxY < valueY ? valueY : this.maxY;
  }
  var diffY = this.maxY - this.minY;
  this.factorX = this.maxX / this.visibleWidth;
  this.factorY = this.visibleHeight / (diffY == 0 ? 1 : diffY);
  this.offsetY = this.minY < 0 ? 0 - Math.round(this.minY * this.factorY) : 0;
  // this.offsetX = this.minX < 0 ? 0 - Math.round(this.minX * this.factorX) : 0;
  var result = [];
  for(var i = 0; i < data.length; i++) {
    var datum = data[i];
    result.push({screen: this.getScreenPoint(datum), original: datum});
  }
  return result;
}

Elevator.prototype.getIntermediations = function(p1, p2, factor) {
  var result = [];
  for(var i = 1; i < Math.round(factor); i++) {
    var nextX = p1.first() + i * (p2.first() - p1.first()) / factor;
    var nextY = (p2.last() - p1.last()) * (nextX - p1.first()) / (p2.first() - p1.first()) + p1.last();
    result.push({screen: this.getScreenPoint(new Datum([nextX, nextY])), original: new Datum([nextX, nextY])});
  }
  return result;
}

Elevator.prototype.getScreenPoint = function(original) {
  var x = Math.ceil(original.first() / this.factorX + this.padding.left);
  var y = this.visibleHeight - Math.round(original.last() * this.factorY + this.offsetY) + this.padding.top;
  return new Datum([x, y]);
}

Elevator.prototype.mouseMove = function(event) {
  // this.counter++;
  // if(this.counter % 2 == 0) {
  //   return;
  // }
  var offset = $(this.canvas).offset();
  var x = event.clientX - offset.left;
  x = x >= this.padding.left ? x : this.padding.left;
  x = x <= (this.width - this.padding.right) ? x : (this.width + this.padding.right) + 1;
  this.draw();
  this.context.beginPath();
  this.context.moveTo(x, this.padding.top - 3);
  this.context.lineTo(x, this.height - 1);
  this.context.stroke();
  var datum = this.screenPositions[x];
  if(datum) {
    this.context.fillText(this.getLabel(datum), x, this.padding.top - 5);
    $(document).trigger("elevation:over", datum);
  }
};

Elevator.prototype.mouseOut = function(event) {
  this.draw();
  $(document).trigger("elevation:over");
};

Elevator.prototype.getLabel = function(datum) {
  var value = datum.last() + '';
  var parts = value.split('.');
  return parts[0] + (parts[1] ? '.' + parts[1].substring(0, 2) : '') + ' m.';
};

Elevator.prototype.clear = function() {
  this.context.clearRect(1, 0, this.width, this.height - 1);
};

Elevator.prototype.draw = function() {
  this.clear();
  if(this.data.length > 1) {
    this.drawGraph(this.data);
  }
};

var Datum = function(point) {
  this.point = point;
};
Datum.prototype.first = function() {
  return this.point[0];
};
Datum.prototype.last = function() {
  return this.point[1];
};

Elevator.prototype.getSampleData = function() {
  var data = [];
  var quantity = 1800;
  for(var i = -quantity/2; i <= quantity/2; i++) {
    var x = i * (10 * Math.PI) / quantity;
    data.push(new Datum([i, Math.sin(x)]));
  }
  return data;
};

Elevator.prototype.drawAxis = function() {
  this.context.beginPath();
  this.context.moveTo(0, 0);
  this.context.lineTo(0, this.height);
  this.context.lineTo(this.width, this.height);
  this.context.stroke();
}

Elevator.prototype.drawGraph = function(data) {
  this.screenPositions = [];
  var previous = data[0];
  this.screenPositions[previous.screen.first()] = previous.original;
  this.context.beginPath();
  this.context.moveTo(previous.screen.first(), previous.screen.last());
  for(var i = 0; i < data.length; i++) {
    var datum = data[i];
    this.context.quadraticCurveTo(
      previous.screen.first(),
      previous.screen.last(),
      datum.screen.first(),
      datum.screen.last()
    );
    this.screenPositions[datum.screen.first()] = datum.original;
    previous = datum;
  }
  this.context.stroke();
}