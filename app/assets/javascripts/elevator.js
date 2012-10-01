function Elevator(field) {
  this.yattr = 'ele';
  this.data = [];
  this.visiblePoints = [];
  this.height = 200;
  this.zoomFactorIndex = 0;
  this.zoomFactor = 1;
  this.zoomLimit = 5;
  this.padding = {top: 20, right: 30, bottom: 0, left: 40};
  $("#canvasElement").attr('height', this.height);
  this.canvas = $("#canvasElement").get(0);
  this.context = this.canvas.getContext('2d');
  this.visibleHeight = this.height - this.padding.top - this.padding.bottom;
  this.setupWidth();
  this.canvas.onmousemove = $.proxy(this.mouseMove, this);
  this.canvas.onmouseout = $.proxy(this.mouseOut, this);
  this.canvas.onclick = $.proxy(this.click, this);
  this.canvas.onmousedown = $.proxy(this.mouseDown, this);
  this.canvas.onmouseup = $.proxy(this.mouseUp, this);
  this.canvas.ondblclick = $.proxy(this.doubleClick, this);
  $("body").mouseup($.proxy(this.bodyMouseUp, this));
  $("#elevationZoomIn").click($.proxy(this.zoom, this, 1));
  $("#elevationZoomOut").click($.proxy(this.zoom, this, -1));
  $("#showSpeed").click($.proxy(this.showSpeed, this));
  $("#showEle").click($.proxy(this.showEle, this));
}

Elevator.prototype.init = function() {
  this.calcMinMax();
  var zeroCount = Math.floor((this.maxY - this.minY) / 10).toString().length
  var factor = "1";
  for(var i = 0; i < zeroCount; i++) {
    factor = factor.concat("0");
  }
  factor = parseInt(factor);
  this.startY = Math.floor(this.minY / factor) * factor;
  this.endY = Math.ceil(this.maxY / factor) * factor;
  this.drawAxis();
  this.processScreenPoints();
  this.draw();
};

Elevator.prototype.showSpeed = function() {
  this.yattr = 'speed';
  this.init();
}

Elevator.prototype.showEle = function() {
  this.yattr = 'ele';
  this.init();
}

Elevator.prototype.addPoint = function(point) {
  this.data.push({point: point});
};

Elevator.prototype.calcMinMax = function() {
  this.minX = this.maxX = this.minY = this.maxY = null;
  for(var i = 0; i < this.data.length; i++) {
    var point = this.data[i].point;
    var valueX = point.fdist;
    var valueY = point[this.yattr];
    this.minX = this.minX && this.minX < valueX ? this.minX : valueX;
    this.maxX = this.maxX && this.maxX > valueX ? this.maxX : valueX;
    this.minY = this.minY && this.minY < valueY ? this.minY : valueY;
    this.maxY = this.maxY && this.maxY > valueY ? this.maxY : valueY;
  }
};

Elevator.prototype.setupWidth = function() {
  this.initialWidth = $("#elevation").innerWidth() - 50;
  $("#elevationGraph").attr('width', this.initialWidth);
  this.initialVisibleWidth = this.initialWidth - this.padding.left - this.padding.right;
  this.visibleWidth = Math.floor(this.initialVisibleWidth * this.zoomFactor);
  this.width = this.visibleWidth + this.padding.left + this.padding.right;
  $("#canvasElement").attr('width', this.width);
};

Elevator.prototype.zoom = function(step) {
  this.zoomFactorIndex += step;
  this.zoomFactor = (this.zoomLimit + this.zoomFactorIndex + 1) / (this.zoomLimit - this.zoomFactorIndex + 1);
  this.setupWidth();
  this.init();
  $("#elevationZoomIn").attr("disabled", (this.zoomFactorIndex < this.zoomLimit) ? false : 'disabled');
  $("#elevationZoomOut").attr("disabled", (this.zoomFactorIndex > -this.zoomLimit) ? false : 'disabled');
};

Elevator.prototype.processScreenPoints = function() {
  var diffY = this.endY - this.startY;
  this.factorX = this.maxX / this.visibleWidth;
  this.factorY = this.visibleHeight / (diffY == 0 ? 1 : diffY);
  for(var i = 0; i < this.data.length; i++) {
    var datum = this.data[i];
    datum.screen = this.getScreenPoint(datum);
  }
}

Elevator.prototype.getScreenPoint = function(datum) {
  var x = Math.ceil(datum.point.fdist / this.factorX + this.padding.left);
  var y = this.height - Math.round((datum.point[this.yattr] - this.startY) * this.factorY) - this.padding.bottom;
  return {x: x, y: y};
}

Elevator.prototype.getEventX = function(event) {
  var offset = $(this.canvas).offset();
  var x = event.clientX - offset.left;
  x = x >= this.padding.left ? x : this.padding.left;
  x = x <= (this.width - this.padding.right) ? x : (this.width - this.padding.right);
  return x;
};

Elevator.prototype.click = function(event) {
  if(this.dragging) {
    this.dragging = false;
    $("#elevationGraph").removeClass("dragging");
  } else {
    var x = this.getEventX(event);
    if(!this.selectionStart) {
      this.startSelection(x);
    } else if (!this.selectionEnd) {
      this.endSelection(x);
    } else {
      this.clearSelection(x);
    }
  }
};

Elevator.prototype.mouseDown = function(event) {
  this.dragStarted = true;
  this.dragX = this.getEventX(event);
};

Elevator.prototype.mouseUp = function(event) {
  event.preventDefault();
  event.stopPropagation();
  this.dragStarted = false;
};

Elevator.prototype.bodyMouseUp = function(event) {
  if(this.dragging) {
    this.dragStarted = false;
    this.dragging = false;
    $("#elevationGraph").removeClass("dragging");
  }
};

Elevator.prototype.mouseMove = function(event) {
  this.moveX = this.getEventX(event);
  if(this.dragStarted) {
    this.dragging = true;
    $("#elevationGraph").addClass("dragging");
    $("#elevationGraph").get(0).scrollLeft += (this.dragX - this.moveX);
  } else {
    this.draw();
  }
};

Elevator.prototype.mouseOut = function(event) {
  if(!this.dragging) {
    this.draw();
    $(document).trigger("elevation:over");
  }
};

Elevator.prototype.doubleClick = function(event) {
  var x = this.getEventX(event);
  event.preventDefault();
  event.stopPropagation();
  this.clearSelection(x);
  return false;
};

Elevator.prototype.getDatum = function(x) {
  var datum = this.visiblePoints[x];
  if(!datum) {
    for(var i = 0; i < 100; i++) {
      var next = this.visiblePoints[x + i];
      var previous = this.visiblePoints[x - i];
      if(next || previous) {
        return next || previous;
      }
    }
  }
  return datum;
};

Elevator.prototype.startSelection = function(x) {
  var datum = this.getDatum(x);
  if(datum) {
    this.selectionStart = datum;
    $(document).trigger("selection:start", datum.point);
  }
};

Elevator.prototype.endSelection = function(x) {
  if(this.selectionStart != x) {
    var datum = this.getDatum(x);
    if(datum) {
      this.selectionEnd = datum;
      $(document).trigger("selection:end", datum.point);
    }
  }
};

Elevator.prototype.clearSelection = function(x) {
  this.selectionStart = this.selectionEnd = null;
  this.draw();
  var datum = this.getDatum(x);
  if(datum) {
    $(document).trigger("selection:clear", datum.point);
  }
};

Elevator.prototype.getLabel = function(datum) {
  return datum.point[this.yattr] + '';
  // var parts = value.split('.');
  // return parts[0] + (parts[1] ? '.' + parts[1].substring(0, 2) : '');
};

Elevator.prototype.clear = function() {
  this.context.restore();
  this.context.clearRect(1, 0, this.width, this.height - 1);
};

Elevator.prototype.draw = function() {
  this.clear();
  this.drawGrid();
  if(this.data.length > 1) {
    this.context.save();
    this.drawGraph();
    this.drawSelection();
    this.context.restore();
    if(this.moveX) {
      this.drawVLineAt(this.moveX);
      var datum = this.getDatum(this.moveX);
      if(datum) {
        this.context.fillText(this.getLabel(datum), this.moveX, this.padding.top - 5);
        $(document).trigger("elevation:over", datum.point);
      }
    }
  }
};

Elevator.prototype.drawSelection = function() {
  if(this.selectionStart) {
    var fillWidth = this.selectionStart.screen.x - (this.selectionEnd ? this.selectionEnd.screen.x : this.moveX);
    this.context.fillStyle = "rgba(228,237,247,0.7)";
    this.context.fillRect(this.selectionStart.screen.x + 1, 0, -fillWidth, this.height - 1);
    this.context.strokeStyle = "rgba(123,132,142,1)";
    this.drawVLineAt(this.selectionStart.screen.x);
    this.drawVLineAt(this.selectionEnd ? this.selectionEnd.screen.x : this.moveX);
    this.context.strokeStyle = this.context.fillStyle = "#000000";
  }
};

Elevator.prototype.drawVLineAt = function(x) {
  this.context.beginPath();
  this.context.moveTo(x + 0.5, this.padding.top - 3);
  this.context.lineTo(x + 0.5, this.height - 1);
  this.context.stroke();
};

Elevator.prototype.drawGrid = function() {
  this.context.strokeStyle = "rgba(228,237,247,1)";
  this.context.beginPath();
  var step = Math.floor(this.visibleHeight / 5);
  for(var i = 0; i <= this.visibleHeight / step; i++) {
    var y = this.height - i * step - this.padding.bottom;
    this.context.moveTo(1.5, y + 0.5);
    this.context.lineTo(this.width + 0.5, y + 0.5);
    this.context.fillText(this.startY + Math.floor(i * step / this.factorY), 3, y - 3);
  }
  this.context.stroke();
  this.context.strokeStyle = "#000000";
};

Elevator.prototype.drawAxis = function() {
  this.context.beginPath();
  this.context.moveTo(0.5, 0.5);
  this.context.lineTo(0.5, this.height);
  this.context.lineTo(this.width, this.height);
  this.context.stroke();
};

Elevator.prototype.drawGraph = function() {
  this.visiblePoints = [];
  var previous = this.data[0];
  this.visiblePoints[previous.screen.x] = previous;
  this.context.beginPath();
  this.context.moveTo(this.padding.left, this.height - this.padding.bottom);
  for(var i = 0; i < this.data.length; i++) {
    var datum = this.data[i];
    this.context.quadraticCurveTo(
      previous.screen.x, previous.screen.y,
      datum.screen.x, datum.screen.y
    );
    this.visiblePoints[datum.screen.x] = datum;
    previous = datum;
  }
  this.context.quadraticCurveTo(
    previous.screen.x, previous.screen.y,
    this.width - this.padding.right, this.height - this.padding.bottom
  );
  this.context.clip();
  this.context.fillStyle = "rgba(240, 240, 240, 1)";
  this.context.fillRect(0, 0, this.width, this.height - 1);
  this.context.fillStyle = "#000000";
  this.context.stroke();
};
