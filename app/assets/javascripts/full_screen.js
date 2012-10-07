OpenLayers.Control.FullScreen = OpenLayers.Class(OpenLayers.Control, {
    inlinkText: "\u2198",
    outlinkText: "\u2196",
    linkId: "olFullScreenLink",

    draw: function() {
        var div = OpenLayers.Control.prototype.draw.apply(this),
            link = this.getOrCreateLink(div),
            eventsInstance = this.map.events;
        eventsInstance.register("buttonclick", this, this.onFullScreenClick);
        this.fullScreenLink = link;
        return div;
    },

    getOrCreateLink: function(el) {
        var link = document.getElementById(this.linkId);
        if (!link) {
            link = document.createElement("a");
            link.id = this.linkId;
            link.href = "#fullScreen";
            link.appendChild(document.createTextNode(this.inlinkText));
            link.className = "olControlFullScreen";
            el.appendChild(link);
        }
        OpenLayers.Element.addClass(link, "olButton");
        return link;
    },
    
    onFullScreenClick: function(evt) {
        var button = evt.buttonElement;
        if (button === this.fullScreenLink) {
          if($("#maps .map").hasClass("fullScreen")) {
            $("#maps .map").removeClass("fullScreen");
            $("#maps .map").height($(window).height() - 280);
            $("#maps .map").width($(window).width() - 280);
            $(this.fullScreenLink).html(this.inlinkText);
          } else {
            $("#maps .map").addClass("fullScreen");
            $("#maps .map").height($(window).height());
            $("#maps .map").width($(window).width());
            $(this.fullScreenLink).html(this.outlinkText);
          }
          this.map.updateSize();
        }
    },

    destroy: function() {
        if (this.map) {
            this.map.events.unregister("buttonclick", this, this.onFullScreenClick);
        }
        delete this.fullScreenLink;
        OpenLayers.Control.prototype.destroy.apply(this);
    },

    CLASS_NAME: "OpenLayers.Control.FullScreen"
});
