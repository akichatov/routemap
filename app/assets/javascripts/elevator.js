function Elevator(map) {
  this.map = map;
  this.xattr = 'fdist';
  this.yattr = 'ele';
  this.height = 200;
  this.zoomFactorIndex = 0;
  this.zoomFactor = 1;
  this.zoomLimit = 5;
  this.padding = {top: 20, right: 30, bottom: 0, left: 40};
  this.playing = false;
  this.playSpeedTimeout = 100;
  this.playStep = 1;
  this.playSpeed = 0;
  this.playX = this.padding.left;
  this.playBound = $.proxy(this.play, this);
  this.stopPlayBound = $.proxy(this.stopPlay, this);
  this.doPlayBound = $.proxy(this.doPlay, this);
  $("#canvasElement, #canvasTemplateElement").attr('height', this.height);
  this.canvas = $("#canvasElement").get(0);
  this.canvasTemplate = $("#canvasTemplateElement").get(0);
  this.context = this.canvas.getContext('2d');
  this.contextTemplate = this.canvasTemplate.getContext('2d');
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
  $("#showEleDist").click($.proxy(this.axisChanged, this, 'ele', 'fdist'));
  $("#showSpeedDist").click($.proxy(this.axisChanged, this, 'speed', 'fdist'));
  $("#showEleTime").click($.proxy(this.axisChanged, this, 'ele', 'time'));
  $("#showSpeedTime").click($.proxy(this.axisChanged, this, 'speed', 'time'));
  $("#startPlay").click(this.playBound);
  $("#stopPlay").click(this.stopPlayBound);
  $("#speedDownPlay").click($.proxy(this.speedChangePlay, this, 1));
  $("#speedUpPlay").click($.proxy(this.speedChangePlay, this, -1));
}

Elevator.prototype.init = function() {
  this.screenPoints = [];
  this.calcMinMax();
  var factor = 10;
  var diff = this.maxY - this.minY;
  if(diff < 100) {
    factor = 5;
  }
  if(diff < 20) {
    factor = 1;
  }
  this.startY = Math.floor(this.minY / factor) * factor;
  this.endY = Math.ceil(this.maxY / factor) * factor;
  this.drawAxis();
  this.processScreenPoints();
  this.drawGraphTemplate();
  this.draw();
};

Elevator.prototype.axisChanged = function(yattr, xattr) {
  this.yattr = yattr;
  this.xattr = xattr;
  this.init();
};

Elevator.prototype.calcMinMax = function() {
  this.minX = this.maxX = this.minY = this.maxY = null;
  for(var i = 0; i < this.map.points.length; i++) {
    var point = this.map.points[i];
    if(point) {
      var valueX = point[this.xattr];
      var valueY = point[this.yattr];
      this.minX = this.minX && this.minX < valueX ? this.minX : valueX;
      this.maxX = this.maxX && this.maxX > valueX ? this.maxX : valueX;
      this.minY = this.minY && this.minY < valueY ? this.minY : valueY;
      this.maxY = this.maxY && this.maxY > valueY ? this.maxY : valueY;
    }
  }
};

Elevator.prototype.setupWidth = function() {
  this.initialWidth = $("#elevation").innerWidth();
  $("#elevationGraph").attr('width', this.initialWidth);
  this.initialVisibleWidth = this.initialWidth - this.padding.left - this.padding.right;
  this.visibleWidth = Math.floor(this.initialVisibleWidth * this.zoomFactor);
  this.width = this.visibleWidth + this.padding.left + this.padding.right;
  $("#canvasElement, #canvasTemplateElement").attr('width', this.width);
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
  this.factorX = (this.maxX - this.minX) / this.visibleWidth;
  this.factorY = this.visibleHeight / (diffY == 0 ? 1 : diffY);
  for(var i = 0; i < this.map.points.length; i++) {
    var point = this.map.points[i];
    if(point) {
      var screenPoint = this.calculateScreenPoint(point);
      var existent = this.screenPoints[screenPoint.x];
      if(!existent || existent.point[this.yattr] < point[this.yattr]) {
        this.screenPoints[screenPoint.x] = screenPoint;
        screenPoint.point = point;
      }
    }
  }
  for(var i = this.padding.left; i < this.screenPoints.length; i++) {
    var screenPoint = this.screenPoints[i];
    if(!screenPoint) {
      var previous = null;
      var next = null;
      for(var p = i - 1; p >= 0; p--) {
        previous = this.screenPoints[p];
        if(previous) {
          break;
        }
      }
      for(var n = i + 1; n < this.screenPoints.length; n++) {
        next = this.screenPoints[n];
        if(next) {
          break;
        }
      }
      var target = previous || next;
      if(previous && next) {
        target = previous.y > next.y ? previous : next;
      }
      this.screenPoints[i] = {x: i, y: target.y, point: target.point};
    }
  }
  
};

Elevator.prototype.calculateScreenPoint = function(point) {
  var x = Math.ceil((point[this.xattr] - this.minX) / this.factorX + this.padding.left);
  var y = this.height - Math.round((point[this.yattr] - this.startY) * this.factorY) - this.padding.bottom;
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
    if(this.playing) {
      this.playX = x;
      this.draw();
    } else {
      if(!this.selectionStart) {
        this.startSelection(x);
      } else if (!this.selectionEnd) {
        this.endSelection(x);
      } else {
        this.clearSelection(x);
      }
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
    if(!this.playing) {
      this.draw();
    }
  }
};

Elevator.prototype.play = function() {
  this.playing = true;
  if(this.playTimeoutId) {
    this.pausePlay();
  } else {
    if(this.hasPlaySpace()) {
      this.continuePlay();
    } else {
      this.startPlay();
    }
  }
};

Elevator.prototype.startPlay = function() {
  this.playX = this.padding.left;
  this.continuePlay();
};

Elevator.prototype.pausePlay = function() {
  $("#startPlay").html("\u25B6");
  clearTimeout(this.playTimeoutId);
  this.playTimeoutId = null;
};

Elevator.prototype.continuePlay = function() {
  $("#stopPlay").get(0).disabled = false;
  $("#startPlay").html("\u275A\u275A");
  this.doPlay();
};

Elevator.prototype.endPlay = function() {
  this.pausePlay();
};

Elevator.prototype.stopPlay = function() {
  $("#stopPlay").get(0).disabled = true;
  this.playing = false;
  this.endPlay();
  this.moveX = this.playX = this.padding.left;
  this.draw();
};

Elevator.prototype.hasPlaySpace = function() {
  return this.playX < (this.visibleWidth + this.padding.left);
};

Elevator.prototype.doPlay = function() {
  if(this.hasPlaySpace()) {
    this.moveX = this.playX;
    this.draw();
    this.playX+=this.playStep;
    this.playTimeoutId = setTimeout(this.doPlayBound, this.playSpeedTimeout);
  } else {
    this.endPlay();
  }
};

Elevator.prototype.speedChangePlay = function(factor) {
  if(this.playSpeedTimeout > 100 || factor < 0) {
    this.playSpeedTimeout += factor * 100;
    this.playSpeed += factor;
  } else {
    if(factor < 0) {}
    if(this.playStep > 1) {
      this.playSpeed += factor;
      this.playStep += factor;
    }
  }
  $("#playSpeed").html(this.playSpeed);
};

Elevator.prototype.mouseOut = function(event) {
  if(!this.dragging && !this.playing) {
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

Elevator.prototype.getScreenPoint = function(x) {
  var screenPoint = this.screenPoints[x];
  if(!screenPoint) {
    for(var i = 0; i < 100; i++) {
      var next = this.screenPoints[x + i];
      var previous = this.screenPoints[x - i];
      if(next || previous) {
        return next || previous;
      }
    }
  }
  return screenPoint;
};

Elevator.prototype.startSelection = function(x) {
  var screenPoint = this.getScreenPoint(x);
  if(screenPoint) {
    this.selectionStart = screenPoint;
    $(document).trigger("selection:start", screenPoint.point);
  }
};

Elevator.prototype.endSelection = function(x) {
  if(this.selectionStart != x) {
    var screenPoint = this.getScreenPoint(x);
    if(screenPoint) {
      this.selectionEnd = screenPoint;
      $(document).trigger("selection:end", screenPoint.point);
    }
  }
};

Elevator.prototype.clearSelection = function(x) {
  this.selectionStart = this.selectionEnd = null;
  this.draw();
  var screenPoint = this.getScreenPoint(x);
  if(screenPoint) {
    $(document).trigger("selection:clear", screenPoint.point);
  }
};

Elevator.prototype.getLabel = function(screenPoint) {
  return screenPoint.point[this.yattr] + '';
};

Elevator.prototype.clear = function() {
  this.context.clearRect(1, 0, this.width, this.height - 1);
};

Elevator.prototype.draw = function() {
  this.clear();
  this.drawGrid();
  if(this.map.points.length > 1) {
    this.drawGraph();
    this.drawSelection();
    if(this.moveX) {
      this.drawVLineAt(this.moveX);
      var screenPoint = this.getScreenPoint(this.moveX);
      if(screenPoint) {
        this.context.fillText(this.getLabel(screenPoint), this.moveX, this.padding.top - 5);
        $(document).trigger("elevation:over", screenPoint.point);
      }
    }
  }
};

Elevator.prototype.drawSelection = function() {
  if(this.selectionStart) {
    var fillWidth = this.selectionStart.x - (this.selectionEnd ? this.selectionEnd.x : this.moveX);
    this.context.fillStyle = "rgba(228,237,247,0.7)";
    this.context.fillRect(this.selectionStart.x + 1, this.padding.top, -fillWidth, this.height - this.padding.top - this.padding.bottom - 1);
    this.context.strokeStyle = "rgba(123,132,142,1)";
    this.drawVLineAt(this.selectionStart.x);
    this.drawVLineAt(this.selectionEnd ? this.selectionEnd.x : this.moveX);
    this.context.strokeStyle = this.context.fillStyle = "#000000";
  }
};

Elevator.prototype.drawVLineAt = function(x) {
  this.context.beginPath();
  this.context.moveTo(x + 0.5, this.padding.top);
  this.context.lineTo(x + 0.5, this.height - 1);
  this.context.stroke();
};

Elevator.prototype.drawGrid = function() {
  this.context.restore();
  this.context.strokeStyle = "rgba(228,237,247,1)";
  this.context.beginPath();
  var count = 5;
  var diff = this.endY - this.startY;
  var dividers = [7, 6, 5, 4, 3, 2];
  for(var i = 0; i < dividers.length; i++) {
    if(diff % dividers[i] == 0) {
      count = dividers[i];
      break;
    }
  }
  var step = Math.floor(this.visibleHeight / count);
  for(var i = 0; i <= this.visibleHeight / step; i++) {
    var y = this.height - i * step - this.padding.bottom;
    this.context.moveTo(1.5, y + 0.5);
    this.context.lineTo(this.width + 0.5, y + 0.5);
    this.context.fillText(this.startY + Math.round(i * step / this.factorY), 3, y - 3);
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

Elevator.prototype.drawGraphTemplate = function() {
  this.contextTemplate.restore();
  this.contextTemplate.clearRect(this.padding.left, 0, this.width - this.padding.left - this.padding.right, this.height - 1);
  this.contextTemplate.beginPath();
  var previous = {x: this.padding.left, y: this.height - this.padding.bottom};
  this.contextTemplate.moveTo(previous.x, previous.y);
  var current = null;
  for(var i = 0; i < this.screenPoints.length; i++) {
    current = this.screenPoints[i];
    if(current) {
      this.contextTemplate.lineTo(
        previous.x, previous.y,
        current.x, current.y
      );
      previous = current;
    }
  }
  this.contextTemplate.lineTo(
    previous.x, previous.y,
    this.width - this.padding.right, this.height - this.padding.bottom
  );
  this.contextTemplate.lineTo(
    this.width - this.padding.right, this.height - this.padding.bottom,
    this.padding.left, this.height - this.padding.bottom
  );
  this.contextTemplate.save();
  this.contextTemplate.clip();
  this.contextTemplate.fillStyle = "rgba(240, 240, 240, 1)";
  this.contextTemplate.fillRect(0, 0, this.width, this.height - 1);
  this.contextTemplate.lineWidth = 2;
  this.contextTemplate.stroke();
};

Elevator.prototype.drawGraph = function() {
  this.context.save();
  var ptrn = this.context.createPattern(this.canvasTemplate, 'no-repeat');
  this.context.fillStyle = ptrn;
  this.context.fillRect(this.padding.left, 0, this.width - this.padding.left - this.padding.right, this.height - 1);
  this.context.restore();
};
