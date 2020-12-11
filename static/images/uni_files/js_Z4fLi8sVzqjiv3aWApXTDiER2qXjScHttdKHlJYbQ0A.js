
/**
 * @file
 * icons.js
 * @author Bob Hutchinson http://drupal.org/user/52366
 * @copyright GNU GPL
 *
 * Icon manager for getlocations.
 * Required for markers to operate properly.
 * For Google maps API v3
 *
 * Derived from gmap icons.js
 */

/**
 * Get the Icon corresponding to a setname / sequence.
 * There is only one Icon for each slot in the sequence.
 * The marker set wraps around when reaching the end of the sequence.
 */

(function ($) {

  Drupal.getlocations = {};

  Drupal.getlocations.getIcon = function (setname, sequence) {

    if (!setname) {
      return;
    }

    if (!this.gicons) {
      this.gicons = {};
    }

    // If no sequence, synthesise one.
    if (!sequence) {
      // @TODO make this per-map.
      if (!this.sequences) {
        this.sequences = {};
      }
      if (!this.sequences[setname]) {
        this.sequences[setname] = -1;
      }
      this.sequences[setname]++;
      sequence = this.sequences[setname];
    }

    if (!this.gicons[setname]) {
      if (!Drupal.getlocations.icons[setname]) {
        var aa = {'!b': setname};
        alert(Drupal.t('Request for invalid marker set !b', aa));
      }
      this.gicons[setname] = [];
      var q = Drupal.getlocations.icons[setname];
      var p;
      var t = [];
      for (var i = 0; i < q.sequence.length; i++) {
        p = Drupal.getlocations.iconpath + q.path;

        t.image =  new google.maps.MarkerImage(
          p + q.sequence[i].f,
          new google.maps.Size(q.sequence[i].w, q.sequence[i].h),
          new google.maps.Point(q.imagepoint1X, q.imagepoint1Y),
          new google.maps.Point(q.imagepoint2X, q.imagepoint2Y)
        );
        if (q.shadow.f !== '') {
          t.shadow = new google.maps.MarkerImage(
            p + q.shadow.f,
            new google.maps.Size(q.shadow.w, q.shadow.h),
            new google.maps.Point(q.shadowpoint1X, q.shadowpoint1Y),
            new google.maps.Point(q.shadowpoint2X, q.shadowpoint2Y)
          );
        }
        // turn string in shapecoords into array
        if (q.shapecoords !== '') {
          t.shape = { coord: q.shapecoords.split(','), type: q.shapetype };
        }

        // @@@ imageMap?
        this.gicons[setname][i] = t;
      }
      delete Drupal.getlocations.icons[setname];
    }
    // TODO: Random, other cycle methods.
    return this.gicons[setname][sequence % this.gicons[setname].length];

  };

  /**
   * JSON callback to set up the icon defs.
   * When doing the JSON call, the data comes back in a packed format.
   * We need to expand it and file it away in a more useful format.
   */
  Drupal.getlocations.iconSetup = function () {
    Drupal.getlocations.icons = {};
    var m = Drupal.getlocations.icondata;
    var filef, filew, fileh, files;
    for (var path in m) {
      if (m.hasOwnProperty(path)) {
        // Reconstitute files array
        filef = m[path].f;
        filew = Drupal.getlocations.expandArray(m[path].w, filef.length);
        fileh = Drupal.getlocations.expandArray(m[path].h, filef.length);
        files = [];
        for (var i = 0; i < filef.length; i++) {
          files[i] = {f : filef[i], w : filew[i], h : fileh[i]};
        }

        for (var ini in m[path].i) {
          if (m[path].i.hasOwnProperty(ini)) {
            $.extend(Drupal.getlocations.icons, Drupal.getlocations.expandIconDef(m[path].i[ini], path, files));
          }
        }
      }
    }
  };

  /**
   * Expand a compressed array.
   * This will pad arr up to len using the last value of the old array.
   */
  Drupal.getlocations.expandArray = function (arr, len) {
    var d = arr[0];
    for (var i = 0; i < len; i++) {
      if (!arr[i]) {
        arr[i] = d;
      }
      else {
        d = arr[i];
      }
    }
    return arr;
  };

  /**
   * Expand icon definition.
   * This helper function is the reverse of the packer function found in
   * getlocations_markerinfo.inc.
   */
  Drupal.getlocations.expandIconDef = function (c, path, files) {

    var decomp = ['key', 'name', 'sequence',
      'imagepoint1X', 'imagepoint1Y', 'imagepoint2X', 'imagepoint2Y',
      'shadow', 'shadowpoint1X', 'shadowpoint1Y', 'shadowpoint2X', 'shadowpoint2Y',
      'shapecoords', 'shapetype'];

    var fallback = ['', '', [], 0, 0, 0, 0, {f: '', h: 0, w: 0}, 0, 0, 0, 0, '', ''];

    var imagerep = ['shadow'];

    var defaults = {};
    var sets = [];
    var i, j;
    // Part 1: Defaults / Markersets
    // Expand arrays and fill in missing ones with fallbacks
    for (i = 0; i < decomp.length; i++) {
      if (!c[0][i]) {
        c[0][i] = [ fallback[i] ];
      }
      c[0][i] = Drupal.getlocations.expandArray(c[0][i], c[0][0].length);
    }
    for (i = 0; i < c[0][0].length; i++) {
      for (j = 0; j < decomp.length; j++) {
        if (i === 0) {
          defaults[decomp[j]] = c[0][j][i];
        }
        else {
          if (!sets[i - 1]) {
            sets[i - 1] = {};
          }
          sets[i - 1][decomp[j]] = c[0][j][i];
        }
      }
    }
    for (i = 0; i < sets.length; i++) {
      for (j = 0; j < decomp.length; j++) {
        if (sets[i][decomp[j]] === fallback[j]) {
          sets[i][decomp[j]] = defaults[decomp[j]];
        }
      }
    }
    var icons = {};
    for (i = 0; i < sets.length; i++) {
      var key = sets[i].key;
      icons[key] = sets[i];
      icons[key].path = path;
      delete icons[key].key;
      delete sets[i];
      for (j = 0; j < icons[key].sequence.length; j++) {
        icons[key].sequence[j] = files[icons[key].sequence[j]];
      }
      for (j = 0; j < imagerep.length; j++) {
        if (typeof(icons[key][imagerep[j]]) === 'number') {
          icons[key][imagerep[j]] = files[icons[key][imagerep[j]]];
        }
      }
    }
    return icons;
  };

})(jQuery);
;
// Getlocations marker image data.
Drupal.getlocations.iconpath = "\/";
Drupal.getlocations.icondata = {"\/ug\/":{"f":[],"w":[],"h":[],"i":[]},"sites\/all\/libraries\/getlocations\/markers\/ug\/":{"f":["university.png","university-adm.png","icon.png","anemometer_mono.png","computers.png","wildlife.png","jogging.png","seals.png","hotel_0star.png","akademik.png","book.png"],"w":[32],"h":[37],"i":[[[["defaults","wydzial","administracja","nauk_biol","nauk_geogr","nauk_informatyk","ptaki","sport","fokarium","hotel","akademik","biblioteka"],["","Budynek wydzialu","Budynek administracji","Placowka Naukowo-Badawcza - biologiczna","Placowka Naukowo-Badawcza - geograficzna","Placowka Naukowo-Badawcza - informatyczna","Stacja Badania Wedrowek Ptakow","Obiekt sportowy","Fokarium","Hotel","Akademik","Biblioteka"],[[],[0],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10]]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[]]]]}};
;
/**
 * @name MarkerClustererPlus for Google Maps V3
 * @version 2.1.2 [May 28, 2014]
 * @author Gary Little
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of markers.
 * <p>
 * This is an enhanced V3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >V2 MarkerClusterer</a> by Xiaoxi Wu. It is based on the
 * <a href="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclusterer/"
 * >V3 MarkerClusterer</a> port by Luke Mahe. MarkerClustererPlus was created by Gary Little.
 * <p>
 * v2.0 release: MarkerClustererPlus v2.0 is backward compatible with MarkerClusterer v1.0. It
 *  adds support for the <code>ignoreHidden</code>, <code>title</code>, <code>batchSizeIE</code>,
 *  and <code>calculator</code> properties as well as support for four more events. It also allows
 *  greater control over the styling of the text that appears on the cluster marker. The
 *  documentation has been significantly improved and the overall code has been simplified and
 *  polished. Very large numbers of markers can now be managed without causing Javascript timeout
 *  errors on Internet Explorer. Note that the name of the <code>clusterclick</code> event has been
 *  deprecated. The new name is <code>click</code>, so please change your application code now.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @name ClusterIconStyle
 * @class This class represents the object for values in the <code>styles</code> array passed
 *  to the {@link MarkerClusterer} constructor. The element in this array that is used to
 *  style the cluster icon is determined by calling the <code>calculator</code> function.
 *
 * @property {string} url The URL of the cluster icon image file. Required.
 * @property {number} height The display height (in pixels) of the cluster icon. Required.
 * @property {number} width The display width (in pixels) of the cluster icon. Required.
 * @property {Array} [anchorText] The position (in pixels) from the center of the cluster icon to
 *  where the text label is to be centered and drawn. The format is <code>[yoffset, xoffset]</code>
 *  where <code>yoffset</code> increases as you go down from center and <code>xoffset</code>
 *  increases to the right of center. The default is <code>[0, 0]</code>.
 * @property {Array} [anchorIcon] The anchor position (in pixels) of the cluster icon. This is the
 *  spot on the cluster icon that is to be aligned with the cluster position. The format is
 *  <code>[yoffset, xoffset]</code> where <code>yoffset</code> increases as you go down and
 *  <code>xoffset</code> increases to the right of the top-left corner of the icon. The default
 *  anchor position is the center of the cluster icon.
 * @property {string} [textColor="black"] The color of the label text shown on the
 *  cluster icon.
 * @property {number} [textSize=11] The size (in pixels) of the label text shown on the
 *  cluster icon.
 * @property {string} [textDecoration="none"] The value of the CSS <code>text-decoration</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [fontWeight="bold"] The value of the CSS <code>font-weight</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [fontStyle="normal"] The value of the CSS <code>font-style</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [fontFamily="Arial,sans-serif"] The value of the CSS <code>font-family</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [backgroundPosition="0 0"] The position of the cluster icon image
 *  within the image defined by <code>url</code>. The format is <code>"xpos ypos"</code>
 *  (the same format as for the CSS <code>background-position</code> property). You must set
 *  this property appropriately when the image defined by <code>url</code> represents a sprite
 *  containing multiple images. Note that the position <i>must</i> be specified in px units.
 */
/**
 * @name ClusterIconInfo
 * @class This class is an object containing general information about a cluster icon. This is
 *  the object that a <code>calculator</code> function returns.
 *
 * @property {string} text The text of the label to be shown on the cluster icon.
 * @property {number} index The index plus 1 of the element in the <code>styles</code>
 *  array to be used to style the cluster icon.
 * @property {string} title The tooltip to display when the mouse moves over the cluster icon.
 *  If this value is <code>undefined</code> or <code>""</code>, <code>title</code> is set to the
 *  value of the <code>title</code> property passed to the MarkerClusterer.
 */
/**
 * A cluster icon.
 *
 * @constructor
 * @extends google.maps.OverlayView
 * @param {Cluster} cluster The cluster with which the icon is to be associated.
 * @param {Array} [styles] An array of {@link ClusterIconStyle} defining the cluster icons
 *  to use for various cluster sizes.
 * @private
 */
function ClusterIcon(cluster, styles) {
  cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

  this.cluster_ = cluster;
  this.className_ = cluster.getMarkerClusterer().getClusterClass();
  this.styles_ = styles;
  this.center_ = null;
  this.div_ = null;
  this.sums_ = null;
  this.visible_ = false;

  this.setMap(cluster.getMap()); // Note: this causes onAdd to be called
}


/**
 * Adds the icon to the DOM.
 */
ClusterIcon.prototype.onAdd = function () {
  var cClusterIcon = this;
  var cMouseDownInCluster;
  var cDraggingMapByCluster;

  this.div_ = document.createElement("div");
  this.div_.className = this.className_;
  if (this.visible_) {
    this.show();
  }

  this.getPanes().overlayMouseTarget.appendChild(this.div_);

  // Fix for Issue 157
  this.boundsChangedListener_ = google.maps.event.addListener(this.getMap(), "bounds_changed", function () {
    cDraggingMapByCluster = cMouseDownInCluster;
  });

  google.maps.event.addDomListener(this.div_, "mousedown", function () {
    cMouseDownInCluster = true;
    cDraggingMapByCluster = false;
  });

  google.maps.event.addDomListener(this.div_, "click", function (e) {
    cMouseDownInCluster = false;
    if (!cDraggingMapByCluster) {
      var theBounds;
      var mz;
      var mc = cClusterIcon.cluster_.getMarkerClusterer();
      /**
       * This event is fired when a cluster marker is clicked.
       * @name MarkerClusterer#click
       * @param {Cluster} c The cluster that was clicked.
       * @event
       */
      google.maps.event.trigger(mc, "click", cClusterIcon.cluster_);
      google.maps.event.trigger(mc, "clusterclick", cClusterIcon.cluster_); // deprecated name

      // The default click handler follows. Disable it by setting
      // the zoomOnClick property to false.
      if (mc.getZoomOnClick()) {
        // Zoom into the cluster.
        mz = mc.getMaxZoom();
        theBounds = cClusterIcon.cluster_.getBounds();
        mc.getMap().fitBounds(theBounds);
        // There is a fix for Issue 170 here:
        setTimeout(function () {
          mc.getMap().fitBounds(theBounds);
          // Don't zoom beyond the max zoom level
          if (mz !== null && (mc.getMap().getZoom() > mz)) {
            mc.getMap().setZoom(mz + 1);
          }
        }, 100);
      }

      // Prevent event propagation to the map:
      e.cancelBubble = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    }
  });

  google.maps.event.addDomListener(this.div_, "mouseover", function () {
    var mc = cClusterIcon.cluster_.getMarkerClusterer();
    /**
     * This event is fired when the mouse moves over a cluster marker.
     * @name MarkerClusterer#mouseover
     * @param {Cluster} c The cluster that the mouse moved over.
     * @event
     */
    google.maps.event.trigger(mc, "mouseover", cClusterIcon.cluster_);
  });

  google.maps.event.addDomListener(this.div_, "mouseout", function () {
    var mc = cClusterIcon.cluster_.getMarkerClusterer();
    /**
     * This event is fired when the mouse moves out of a cluster marker.
     * @name MarkerClusterer#mouseout
     * @param {Cluster} c The cluster that the mouse moved out of.
     * @event
     */
    google.maps.event.trigger(mc, "mouseout", cClusterIcon.cluster_);
  });
};


/**
 * Removes the icon from the DOM.
 */
ClusterIcon.prototype.onRemove = function () {
  if (this.div_ && this.div_.parentNode) {
    this.hide();
    google.maps.event.removeListener(this.boundsChangedListener_);
    google.maps.event.clearInstanceListeners(this.div_);
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};


/**
 * Draws the icon.
 */
ClusterIcon.prototype.draw = function () {
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.top = pos.y + "px";
    this.div_.style.left = pos.x + "px";
  }
};


/**
 * Hides the icon.
 */
ClusterIcon.prototype.hide = function () {
  if (this.div_) {
    this.div_.style.display = "none";
  }
  this.visible_ = false;
};


/**
 * Positions and shows the icon.
 */
ClusterIcon.prototype.show = function () {
  if (this.div_) {
    var img = "";
    // NOTE: values must be specified in px units
    var bp = this.backgroundPosition_.split(" ");
    var spriteH = parseInt(bp[0].replace(/^\s+|\s+$/g, ""), 10);
    var spriteV = parseInt(bp[1].replace(/^\s+|\s+$/g, ""), 10);
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    img = "<img src='" + this.url_ + "' style='position: absolute; top: " + spriteV + "px; left: " + spriteH + "px; ";
    if (!this.cluster_.getMarkerClusterer().enableRetinaIcons_) {
      img += "clip: rect(" + (-1 * spriteV) + "px, " + ((-1 * spriteH) + this.width_) + "px, " +
          ((-1 * spriteV) + this.height_) + "px, " + (-1 * spriteH) + "px);";
    }
    img += "'>";
    this.div_.innerHTML = img + "<div style='" +
        "position: absolute;" +
        "top: " + this.anchorText_[0] + "px;" +
        "left: " + this.anchorText_[1] + "px;" +
        "color: " + this.textColor_ + ";" +
        "font-size: " + this.textSize_ + "px;" +
        "font-family: " + this.fontFamily_ + ";" +
        "font-weight: " + this.fontWeight_ + ";" +
        "font-style: " + this.fontStyle_ + ";" +
        "text-decoration: " + this.textDecoration_ + ";" +
        "text-align: center;" +
        "width: " + this.width_ + "px;" +
        "line-height:" + this.height_ + "px;" +
        "'>" + this.sums_.text + "</div>";
    if (typeof this.sums_.title === "undefined" || this.sums_.title === "") {
      this.div_.title = this.cluster_.getMarkerClusterer().getTitle();
    } else {
      this.div_.title = this.sums_.title;
    }
    this.div_.style.display = "";
  }
  this.visible_ = true;
};


/**
 * Sets the icon styles to the appropriate element in the styles array.
 *
 * @param {ClusterIconInfo} sums The icon label text and styles index.
 */
ClusterIcon.prototype.useStyle = function (sums) {
  this.sums_ = sums;
  var index = Math.max(0, sums.index - 1);
  index = Math.min(this.styles_.length - 1, index);
  var style = this.styles_[index];
  this.url_ = style.url;
  this.height_ = style.height;
  this.width_ = style.width;
  this.anchorText_ = style.anchorText || [0, 0];
  this.anchorIcon_ = style.anchorIcon || [parseInt(this.height_ / 2, 10), parseInt(this.width_ / 2, 10)];
  this.textColor_ = style.textColor || "black";
  this.textSize_ = style.textSize || 11;
  this.textDecoration_ = style.textDecoration || "none";
  this.fontWeight_ = style.fontWeight || "bold";
  this.fontStyle_ = style.fontStyle || "normal";
  this.fontFamily_ = style.fontFamily || "Arial,sans-serif";
  this.backgroundPosition_ = style.backgroundPosition || "0 0";
};


/**
 * Sets the position at which to center the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function (center) {
  this.center_ = center;
};


/**
 * Creates the cssText style parameter based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position of the icon.
 * @return {string} The CSS style text.
 */
ClusterIcon.prototype.createCss = function (pos) {
  var style = [];
  style.push("cursor: pointer;");
  style.push("position: absolute; top: " + pos.y + "px; left: " + pos.x + "px;");
  style.push("width: " + this.width_ + "px; height: " + this.height_ + "px;");
  return style.join("");
};


/**
 * Returns the position at which to place the DIV depending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 */
ClusterIcon.prototype.getPosFromLatLng_ = function (latlng) {
  var pos = this.getProjection().fromLatLngToDivPixel(latlng);
  pos.x -= this.anchorIcon_[1];
  pos.y -= this.anchorIcon_[0];
  pos.x = parseInt(pos.x, 10);
  pos.y = parseInt(pos.y, 10);
  return pos;
};


/**
 * Creates a single cluster that manages a group of proximate markers.
 *  Used internally, do not call this constructor directly.
 * @constructor
 * @param {MarkerClusterer} mc The <code>MarkerClusterer</code> object with which this
 *  cluster is associated.
 */
function Cluster(mc) {
  this.markerClusterer_ = mc;
  this.map_ = mc.getMap();
  this.gridSize_ = mc.getGridSize();
  this.minClusterSize_ = mc.getMinimumClusterSize();
  this.averageCenter_ = mc.getAverageCenter();
  this.markers_ = [];
  this.center_ = null;
  this.bounds_ = null;
  this.clusterIcon_ = new ClusterIcon(this, mc.getStyles());
}


/**
 * Returns the number of markers managed by the cluster. You can call this from
 * a <code>click</code>, <code>mouseover</code>, or <code>mouseout</code> event handler
 * for the <code>MarkerClusterer</code> object.
 *
 * @return {number} The number of markers in the cluster.
 */
Cluster.prototype.getSize = function () {
  return this.markers_.length;
};


/**
 * Returns the array of markers managed by the cluster. You can call this from
 * a <code>click</code>, <code>mouseover</code>, or <code>mouseout</code> event handler
 * for the <code>MarkerClusterer</code> object.
 *
 * @return {Array} The array of markers in the cluster.
 */
Cluster.prototype.getMarkers = function () {
  return this.markers_;
};


/**
 * Returns the center of the cluster. You can call this from
 * a <code>click</code>, <code>mouseover</code>, or <code>mouseout</code> event handler
 * for the <code>MarkerClusterer</code> object.
 *
 * @return {google.maps.LatLng} The center of the cluster.
 */
Cluster.prototype.getCenter = function () {
  return this.center_;
};


/**
 * Returns the map with which the cluster is associated.
 *
 * @return {google.maps.Map} The map.
 * @ignore
 */
Cluster.prototype.getMap = function () {
  return this.map_;
};


/**
 * Returns the <code>MarkerClusterer</code> object with which the cluster is associated.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 * @ignore
 */
Cluster.prototype.getMarkerClusterer = function () {
  return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 * @ignore
 */
Cluster.prototype.getBounds = function () {
  var i;
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  var markers = this.getMarkers();
  for (i = 0; i < markers.length; i++) {
    bounds.extend(markers[i].getPosition());
  }
  return bounds;
};


/**
 * Removes the cluster from the map.
 *
 * @ignore
 */
Cluster.prototype.remove = function () {
  this.clusterIcon_.setMap(null);
  this.markers_ = [];
  delete this.markers_;
};


/**
 * Adds a marker to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to be added.
 * @return {boolean} True if the marker was added.
 * @ignore
 */
Cluster.prototype.addMarker = function (marker) {
  var i;
  var mCount;
  var mz;

  if (this.isMarkerAlreadyAdded_(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  } else {
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
      var lat = (this.center_.lat() * (l - 1) + marker.getPosition().lat()) / l;
      var lng = (this.center_.lng() * (l - 1) + marker.getPosition().lng()) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
      this.calculateBounds_();
    }
  }

  marker.isAdded = true;
  this.markers_.push(marker);

  mCount = this.markers_.length;
  mz = this.markerClusterer_.getMaxZoom();
  if (mz !== null && this.map_.getZoom() > mz) {
    // Zoomed in past max zoom, so show the marker.
    if (marker.getMap() !== this.map_) {
      marker.setMap(this.map_);
    }
  } else if (mCount < this.minClusterSize_) {
    // Min cluster size not reached so show the marker.
    if (marker.getMap() !== this.map_) {
      marker.setMap(this.map_);
    }
  } else if (mCount === this.minClusterSize_) {
    // Hide the markers that were showing.
    for (i = 0; i < mCount; i++) {
      this.markers_[i].setMap(null);
    }
  } else {
    marker.setMap(null);
  }

  this.updateIcon_();
  return true;
};


/**
 * Determines if a marker lies within the cluster's bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 * @ignore
 */
Cluster.prototype.isMarkerInClusterBounds = function (marker) {
  return this.bounds_.contains(marker.getPosition());
};


/**
 * Calculates the extended bounds of the cluster with the grid.
 */
Cluster.prototype.calculateBounds_ = function () {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Updates the cluster icon.
 */
Cluster.prototype.updateIcon_ = function () {
  var mCount = this.markers_.length;
  var mz = this.markerClusterer_.getMaxZoom();

  if (mz !== null && this.map_.getZoom() > mz) {
    this.clusterIcon_.hide();
    return;
  }

  if (mCount < this.minClusterSize_) {
    // Min cluster size not yet reached.
    this.clusterIcon_.hide();
    return;
  }

  var numStyles = this.markerClusterer_.getStyles().length;
  var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
  this.clusterIcon_.setCenter(this.center_);
  this.clusterIcon_.useStyle(sums);
  this.clusterIcon_.show();
};


/**
 * Determines if a marker has already been added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker has already been added.
 */
Cluster.prototype.isMarkerAlreadyAdded_ = function (marker) {
  var i;
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) !== -1;
  } else {
    for (i = 0; i < this.markers_.length; i++) {
      if (marker === this.markers_[i]) {
        return true;
      }
    }
  }
  return false;
};


/**
 * @name MarkerClustererOptions
 * @class This class represents the optional parameter passed to
 *  the {@link MarkerClusterer} constructor.
 * @property {number} [gridSize=60] The grid size of a cluster in pixels. The grid is a square.
 * @property {number} [maxZoom=null] The maximum zoom level at which clustering is enabled or
 *  <code>null</code> if clustering is to be enabled at all zoom levels.
 * @property {boolean} [zoomOnClick=true] Whether to zoom the map when a cluster marker is
 *  clicked. You may want to set this to <code>false</code> if you have installed a handler
 *  for the <code>click</code> event and it deals with zooming on its own.
 * @property {boolean} [averageCenter=false] Whether the position of a cluster marker should be
 *  the average position of all markers in the cluster. If set to <code>false</code>, the
 *  cluster marker is positioned at the location of the first marker added to the cluster.
 * @property {number} [minimumClusterSize=2] The minimum number of markers needed in a cluster
 *  before the markers are hidden and a cluster marker appears.
 * @property {boolean} [ignoreHidden=false] Whether to ignore hidden markers in clusters. You
 *  may want to set this to <code>true</code> to ensure that hidden markers are not included
 *  in the marker count that appears on a cluster marker (this count is the value of the
 *  <code>text</code> property of the result returned by the default <code>calculator</code>).
 *  If set to <code>true</code> and you change the visibility of a marker being clustered, be
 *  sure to also call <code>MarkerClusterer.repaint()</code>.
 * @property {string} [title=""] The tooltip to display when the mouse moves over a cluster
 *  marker. (Alternatively, you can use a custom <code>calculator</code> function to specify a
 *  different tooltip for each cluster marker.)
 * @property {function} [calculator=MarkerClusterer.CALCULATOR] The function used to determine
 *  the text to be displayed on a cluster marker and the index indicating which style to use
 *  for the cluster marker. The input parameters for the function are (1) the array of markers
 *  represented by a cluster marker and (2) the number of cluster icon styles. It returns a
 *  {@link ClusterIconInfo} object. The default <code>calculator</code> returns a
 *  <code>text</code> property which is the number of markers in the cluster and an
 *  <code>index</code> property which is one higher than the lowest integer such that
 *  <code>10^i</code> exceeds the number of markers in the cluster, or the size of the styles
 *  array, whichever is less. The <code>styles</code> array element used has an index of
 *  <code>index</code> minus 1. For example, the default <code>calculator</code> returns a
 *  <code>text</code> value of <code>"125"</code> and an <code>index</code> of <code>3</code>
 *  for a cluster icon representing 125 markers so the element used in the <code>styles</code>
 *  array is <code>2</code>. A <code>calculator</code> may also return a <code>title</code>
 *  property that contains the text of the tooltip to be used for the cluster marker. If
 *   <code>title</code> is not defined, the tooltip is set to the value of the <code>title</code>
 *   property for the MarkerClusterer.
 * @property {string} [clusterClass="cluster"] The name of the CSS class defining general styles
 *  for the cluster markers. Use this class to define CSS styles that are not set up by the code
 *  that processes the <code>styles</code> array.
 * @property {Array} [styles] An array of {@link ClusterIconStyle} elements defining the styles
 *  of the cluster markers to be used. The element to be used to style a given cluster marker
 *  is determined by the function defined by the <code>calculator</code> property.
 *  The default is an array of {@link ClusterIconStyle} elements whose properties are derived
 *  from the values for <code>imagePath</code>, <code>imageExtension</code>, and
 *  <code>imageSizes</code>.
 * @property {boolean} [enableRetinaIcons=false] Whether to allow the use of cluster icons that
 * have sizes that are some multiple (typically double) of their actual display size. Icons such
 * as these look better when viewed on high-resolution monitors such as Apple's Retina displays.
 * Note: if this property is <code>true</code>, sprites cannot be used as cluster icons.
 * @property {number} [batchSize=MarkerClusterer.BATCH_SIZE] Set this property to the
 *  number of markers to be processed in a single batch when using a browser other than
 *  Internet Explorer (for Internet Explorer, use the batchSizeIE property instead).
 * @property {number} [batchSizeIE=MarkerClusterer.BATCH_SIZE_IE] When Internet Explorer is
 *  being used, markers are processed in several batches with a small delay inserted between
 *  each batch in an attempt to avoid Javascript timeout errors. Set this property to the
 *  number of markers to be processed in a single batch; select as high a number as you can
 *  without causing a timeout error in the browser. This number might need to be as low as 100
 *  if 15,000 markers are being managed, for example.
 * @property {string} [imagePath=MarkerClusterer.IMAGE_PATH]
 *  The full URL of the root name of the group of image files to use for cluster icons.
 *  The complete file name is of the form <code>imagePath</code>n.<code>imageExtension</code>
 *  where n is the image file number (1, 2, etc.).
 * @property {string} [imageExtension=MarkerClusterer.IMAGE_EXTENSION]
 *  The extension name for the cluster icon image files (e.g., <code>"png"</code> or
 *  <code>"jpg"</code>).
 * @property {Array} [imageSizes=MarkerClusterer.IMAGE_SIZES]
 *  An array of numbers containing the widths of the group of
 *  <code>imagePath</code>n.<code>imageExtension</code> image files.
 *  (The images are assumed to be square.)
 */
/**
 * Creates a MarkerClusterer object with the options specified in {@link MarkerClustererOptions}.
 * @constructor
 * @extends google.maps.OverlayView
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>} [opt_markers] The markers to be added to the cluster.
 * @param {MarkerClustererOptions} [opt_options] The optional parameters.
 */
function MarkerClusterer(map, opt_markers, opt_options) {
  // MarkerClusterer implements google.maps.OverlayView interface. We use the
  // extend function to extend MarkerClusterer with google.maps.OverlayView
  // because it might not always be available when the code is defined so we
  // look for it at the last possible moment. If it doesn't exist now then
  // there is no point going ahead :)
  this.extend(MarkerClusterer, google.maps.OverlayView);

  opt_markers = opt_markers || [];
  opt_options = opt_options || {};

  this.markers_ = [];
  this.clusters_ = [];
  this.listeners_ = [];
  this.activeMap_ = null;
  this.ready_ = false;

  this.gridSize_ = opt_options.gridSize || 60;
  this.minClusterSize_ = opt_options.minimumClusterSize || 2;
  this.maxZoom_ = opt_options.maxZoom || null;
  this.styles_ = opt_options.styles || [];
  this.title_ = opt_options.title || "";
  this.zoomOnClick_ = true;
  if (opt_options.zoomOnClick !== undefined) {
    this.zoomOnClick_ = opt_options.zoomOnClick;
  }
  this.averageCenter_ = false;
  if (opt_options.averageCenter !== undefined) {
    this.averageCenter_ = opt_options.averageCenter;
  }
  this.ignoreHidden_ = false;
  if (opt_options.ignoreHidden !== undefined) {
    this.ignoreHidden_ = opt_options.ignoreHidden;
  }
  this.enableRetinaIcons_ = false;
  if (opt_options.enableRetinaIcons !== undefined) {
    this.enableRetinaIcons_ = opt_options.enableRetinaIcons;
  }
  this.imagePath_ = opt_options.imagePath || MarkerClusterer.IMAGE_PATH;
  this.imageExtension_ = opt_options.imageExtension || MarkerClusterer.IMAGE_EXTENSION;
  this.imageSizes_ = opt_options.imageSizes || MarkerClusterer.IMAGE_SIZES;
  this.calculator_ = opt_options.calculator || MarkerClusterer.CALCULATOR;
  this.batchSize_ = opt_options.batchSize || MarkerClusterer.BATCH_SIZE;
  this.batchSizeIE_ = opt_options.batchSizeIE || MarkerClusterer.BATCH_SIZE_IE;
  this.clusterClass_ = opt_options.clusterClass || "cluster";

  if (navigator.userAgent.toLowerCase().indexOf("msie") !== -1) {
    // Try to avoid IE timeout when processing a huge number of markers:
    this.batchSize_ = this.batchSizeIE_;
  }

  this.setupStyles_();

  this.addMarkers(opt_markers, true);
  this.setMap(map); // Note: this causes onAdd to be called
}


/**
 * Implementation of the onAdd interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function () {
  var cMarkerClusterer = this;

  this.activeMap_ = this.getMap();
  this.ready_ = true;

  this.repaint();

  // Add the map event listeners
  this.listeners_ = [
    google.maps.event.addListener(this.getMap(), "zoom_changed", function () {
      cMarkerClusterer.resetViewport_(false);
      // Workaround for this Google bug: when map is at level 0 and "-" of
      // zoom slider is clicked, a "zoom_changed" event is fired even though
      // the map doesn't zoom out any further. In this situation, no "idle"
      // event is triggered so the cluster markers that have been removed
      // do not get redrawn. Same goes for a zoom in at maxZoom.
      if (this.getZoom() === (this.get("minZoom") || 0) || this.getZoom() === this.get("maxZoom")) {
        google.maps.event.trigger(this, "idle");
      }
    }),
    google.maps.event.addListener(this.getMap(), "idle", function () {
      cMarkerClusterer.redraw_();
    })
  ];
};


/**
 * Implementation of the onRemove interface method.
 * Removes map event listeners and all cluster icons from the DOM.
 * All managed markers are also put back on the map.
 * @ignore
 */
MarkerClusterer.prototype.onRemove = function () {
  var i;

  // Put all the managed markers back on the map:
  for (i = 0; i < this.markers_.length; i++) {
    if (this.markers_[i].getMap() !== this.activeMap_) {
      this.markers_[i].setMap(this.activeMap_);
    }
  }

  // Remove all clusters:
  for (i = 0; i < this.clusters_.length; i++) {
    this.clusters_[i].remove();
  }
  this.clusters_ = [];

  // Remove map event listeners:
  for (i = 0; i < this.listeners_.length; i++) {
    google.maps.event.removeListener(this.listeners_[i]);
  }
  this.listeners_ = [];

  this.activeMap_ = null;
  this.ready_ = false;
};


/**
 * Implementation of the draw interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function () {};


/**
 * Sets up the styles object.
 */
MarkerClusterer.prototype.setupStyles_ = function () {
  var i, size;
  if (this.styles_.length > 0) {
    return;
  }

  for (i = 0; i < this.imageSizes_.length; i++) {
    size = this.imageSizes_[i];
    this.styles_.push({
      url: this.imagePath_ + (i + 1) + "." + this.imageExtension_,
      height: size,
      width: size
    });
  }
};


/**
 *  Fits the map to the bounds of the markers managed by the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function () {
  var i;
  var markers = this.getMarkers();
  var bounds = new google.maps.LatLngBounds();
  for (i = 0; i < markers.length; i++) {
    bounds.extend(markers[i].getPosition());
  }

  this.getMap().fitBounds(bounds);
};


/**
 * Returns the value of the <code>gridSize</code> property.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function () {
  return this.gridSize_;
};


/**
 * Sets the value of the <code>gridSize</code> property.
 *
 * @param {number} gridSize The grid size.
 */
MarkerClusterer.prototype.setGridSize = function (gridSize) {
  this.gridSize_ = gridSize;
};


/**
 * Returns the value of the <code>minimumClusterSize</code> property.
 *
 * @return {number} The minimum cluster size.
 */
MarkerClusterer.prototype.getMinimumClusterSize = function () {
  return this.minClusterSize_;
};

/**
 * Sets the value of the <code>minimumClusterSize</code> property.
 *
 * @param {number} minimumClusterSize The minimum cluster size.
 */
MarkerClusterer.prototype.setMinimumClusterSize = function (minimumClusterSize) {
  this.minClusterSize_ = minimumClusterSize;
};


/**
 *  Returns the value of the <code>maxZoom</code> property.
 *
 *  @return {number} The maximum zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function () {
  return this.maxZoom_;
};


/**
 *  Sets the value of the <code>maxZoom</code> property.
 *
 *  @param {number} maxZoom The maximum zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function (maxZoom) {
  this.maxZoom_ = maxZoom;
};


/**
 *  Returns the value of the <code>styles</code> property.
 *
 *  @return {Array} The array of styles defining the cluster markers to be used.
 */
MarkerClusterer.prototype.getStyles = function () {
  return this.styles_;
};


/**
 *  Sets the value of the <code>styles</code> property.
 *
 *  @param {Array.<ClusterIconStyle>} styles The array of styles to use.
 */
MarkerClusterer.prototype.setStyles = function (styles) {
  this.styles_ = styles;
};


/**
 * Returns the value of the <code>title</code> property.
 *
 * @return {string} The content of the title text.
 */
MarkerClusterer.prototype.getTitle = function () {
  return this.title_;
};


/**
 *  Sets the value of the <code>title</code> property.
 *
 *  @param {string} title The value of the title property.
 */
MarkerClusterer.prototype.setTitle = function (title) {
  this.title_ = title;
};


/**
 * Returns the value of the <code>zoomOnClick</code> property.
 *
 * @return {boolean} True if zoomOnClick property is set.
 */
MarkerClusterer.prototype.getZoomOnClick = function () {
  return this.zoomOnClick_;
};


/**
 *  Sets the value of the <code>zoomOnClick</code> property.
 *
 *  @param {boolean} zoomOnClick The value of the zoomOnClick property.
 */
MarkerClusterer.prototype.setZoomOnClick = function (zoomOnClick) {
  this.zoomOnClick_ = zoomOnClick;
};


/**
 * Returns the value of the <code>averageCenter</code> property.
 *
 * @return {boolean} True if averageCenter property is set.
 */
MarkerClusterer.prototype.getAverageCenter = function () {
  return this.averageCenter_;
};


/**
 *  Sets the value of the <code>averageCenter</code> property.
 *
 *  @param {boolean} averageCenter The value of the averageCenter property.
 */
MarkerClusterer.prototype.setAverageCenter = function (averageCenter) {
  this.averageCenter_ = averageCenter;
};


/**
 * Returns the value of the <code>ignoreHidden</code> property.
 *
 * @return {boolean} True if ignoreHidden property is set.
 */
MarkerClusterer.prototype.getIgnoreHidden = function () {
  return this.ignoreHidden_;
};


/**
 *  Sets the value of the <code>ignoreHidden</code> property.
 *
 *  @param {boolean} ignoreHidden The value of the ignoreHidden property.
 */
MarkerClusterer.prototype.setIgnoreHidden = function (ignoreHidden) {
  this.ignoreHidden_ = ignoreHidden;
};


/**
 * Returns the value of the <code>enableRetinaIcons</code> property.
 *
 * @return {boolean} True if enableRetinaIcons property is set.
 */
MarkerClusterer.prototype.getEnableRetinaIcons = function () {
  return this.enableRetinaIcons_;
};


/**
 *  Sets the value of the <code>enableRetinaIcons</code> property.
 *
 *  @param {boolean} enableRetinaIcons The value of the enableRetinaIcons property.
 */
MarkerClusterer.prototype.setEnableRetinaIcons = function (enableRetinaIcons) {
  this.enableRetinaIcons_ = enableRetinaIcons;
};


/**
 * Returns the value of the <code>imageExtension</code> property.
 *
 * @return {string} The value of the imageExtension property.
 */
MarkerClusterer.prototype.getImageExtension = function () {
  return this.imageExtension_;
};


/**
 *  Sets the value of the <code>imageExtension</code> property.
 *
 *  @param {string} imageExtension The value of the imageExtension property.
 */
MarkerClusterer.prototype.setImageExtension = function (imageExtension) {
  this.imageExtension_ = imageExtension;
};


/**
 * Returns the value of the <code>imagePath</code> property.
 *
 * @return {string} The value of the imagePath property.
 */
MarkerClusterer.prototype.getImagePath = function () {
  return this.imagePath_;
};


/**
 *  Sets the value of the <code>imagePath</code> property.
 *
 *  @param {string} imagePath The value of the imagePath property.
 */
MarkerClusterer.prototype.setImagePath = function (imagePath) {
  this.imagePath_ = imagePath;
};


/**
 * Returns the value of the <code>imageSizes</code> property.
 *
 * @return {Array} The value of the imageSizes property.
 */
MarkerClusterer.prototype.getImageSizes = function () {
  return this.imageSizes_;
};


/**
 *  Sets the value of the <code>imageSizes</code> property.
 *
 *  @param {Array} imageSizes The value of the imageSizes property.
 */
MarkerClusterer.prototype.setImageSizes = function (imageSizes) {
  this.imageSizes_ = imageSizes;
};


/**
 * Returns the value of the <code>calculator</code> property.
 *
 * @return {function} the value of the calculator property.
 */
MarkerClusterer.prototype.getCalculator = function () {
  return this.calculator_;
};


/**
 * Sets the value of the <code>calculator</code> property.
 *
 * @param {function(Array.<google.maps.Marker>, number)} calculator The value
 *  of the calculator property.
 */
MarkerClusterer.prototype.setCalculator = function (calculator) {
  this.calculator_ = calculator;
};


/**
 * Returns the value of the <code>batchSizeIE</code> property.
 *
 * @return {number} the value of the batchSizeIE property.
 */
MarkerClusterer.prototype.getBatchSizeIE = function () {
  return this.batchSizeIE_;
};


/**
 * Sets the value of the <code>batchSizeIE</code> property.
 *
 *  @param {number} batchSizeIE The value of the batchSizeIE property.
 */
MarkerClusterer.prototype.setBatchSizeIE = function (batchSizeIE) {
  this.batchSizeIE_ = batchSizeIE;
};


/**
 * Returns the value of the <code>clusterClass</code> property.
 *
 * @return {string} the value of the clusterClass property.
 */
MarkerClusterer.prototype.getClusterClass = function () {
  return this.clusterClass_;
};


/**
 * Sets the value of the <code>clusterClass</code> property.
 *
 *  @param {string} clusterClass The value of the clusterClass property.
 */
MarkerClusterer.prototype.setClusterClass = function (clusterClass) {
  this.clusterClass_ = clusterClass;
};


/**
 *  Returns the array of markers managed by the clusterer.
 *
 *  @return {Array} The array of markers managed by the clusterer.
 */
MarkerClusterer.prototype.getMarkers = function () {
  return this.markers_;
};


/**
 *  Returns the number of markers managed by the clusterer.
 *
 *  @return {number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function () {
  return this.markers_.length;
};


/**
 * Returns the current array of clusters formed by the clusterer.
 *
 * @return {Array} The array of clusters formed by the clusterer.
 */
MarkerClusterer.prototype.getClusters = function () {
  return this.clusters_;
};


/**
 * Returns the number of clusters formed by the clusterer.
 *
 * @return {number} The number of clusters formed by the clusterer.
 */
MarkerClusterer.prototype.getTotalClusters = function () {
  return this.clusters_.length;
};


/**
 * Adds a marker to the clusterer. The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 */
MarkerClusterer.prototype.addMarker = function (marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw_();
  }
};


/**
 * Adds an array of markers to the clusterer. The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 */
MarkerClusterer.prototype.addMarkers = function (markers, opt_nodraw) {
  var key;
  for (key in markers) {
    if (markers.hasOwnProperty(key)) {
      this.pushMarkerTo_(markers[key]);
    }
  }  
  if (!opt_nodraw) {
    this.redraw_();
  }
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 */
MarkerClusterer.prototype.pushMarkerTo_ = function (marker) {
  // If the marker is draggable add a listener so we can update the clusters on the dragend:
  if (marker.getDraggable()) {
    var cMarkerClusterer = this;
    google.maps.event.addListener(marker, "dragend", function () {
      if (cMarkerClusterer.ready_) {
        this.isAdded = false;
        cMarkerClusterer.repaint();
      }
    });
  }
  marker.isAdded = false;
  this.markers_.push(marker);
};


/**
 * Removes a marker from the cluster.  The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>. Returns <code>true</code> if the
 *  marker was removed from the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 * @return {boolean} True if the marker was removed from the clusterer.
 */
MarkerClusterer.prototype.removeMarker = function (marker, opt_nodraw) {
  var removed = this.removeMarker_(marker);

  if (!opt_nodraw && removed) {
    this.repaint();
  }

  return removed;
};


/**
 * Removes an array of markers from the cluster. The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>. Returns <code>true</code> if markers
 *  were removed from the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 * @return {boolean} True if markers were removed from the clusterer.
 */
MarkerClusterer.prototype.removeMarkers = function (markers, opt_nodraw) {
  var i, r;
  var removed = false;

  for (i = 0; i < markers.length; i++) {
    r = this.removeMarker_(markers[i]);
    removed = removed || r;
  }

  if (!opt_nodraw && removed) {
    this.repaint();
  }

  return removed;
};


/**
 * Removes a marker and returns true if removed, false if not.
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 */
MarkerClusterer.prototype.removeMarker_ = function (marker) {
  var i;
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (i = 0; i < this.markers_.length; i++) {
      if (marker === this.markers_[i]) {
        index = i;
        break;
      }
    }
  }

  if (index === -1) {
    // Marker is not in our list of markers, so do nothing:
    return false;
  }

  marker.setMap(null);
  this.markers_.splice(index, 1); // Remove the marker from the list of managed markers
  return true;
};


/**
 * Removes all clusters and markers from the map and also removes all markers
 *  managed by the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function () {
  this.resetViewport_(true);
  this.markers_ = [];
};


/**
 * Recalculates and redraws all the marker clusters from scratch.
 *  Call this after changing any properties.
 */
MarkerClusterer.prototype.repaint = function () {
  var oldClusters = this.clusters_.slice();
  this.clusters_ = [];
  this.resetViewport_(false);
  this.redraw_();

  // Remove the old clusters.
  // Do it in a timeout to prevent blinking effect.
  setTimeout(function () {
    var i;
    for (i = 0; i < oldClusters.length; i++) {
      oldClusters[i].remove();
    }
  }, 0);
};


/**
 * Returns the current bounds extended by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 * @ignore
 */
MarkerClusterer.prototype.getExtendedBounds = function (bounds) {
  var projection = this.getProjection();

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};


/**
 * Redraws all the clusters.
 */
MarkerClusterer.prototype.redraw_ = function () {
  this.createClusters_(0);
};


/**
 * Removes all clusters from the map. The markers are also removed from the map
 *  if <code>opt_hide</code> is set to <code>true</code>.
 *
 * @param {boolean} [opt_hide] Set to <code>true</code> to also remove the markers
 *  from the map.
 */
MarkerClusterer.prototype.resetViewport_ = function (opt_hide) {
  var i, marker;
  // Remove all the clusters
  for (i = 0; i < this.clusters_.length; i++) {
    this.clusters_[i].remove();
  }
  this.clusters_ = [];

  // Reset the markers to not be added and to be removed from the map.
  for (i = 0; i < this.markers_.length; i++) {
    marker = this.markers_[i];
    marker.isAdded = false;
    if (opt_hide) {
      marker.setMap(null);
    }
  }
};


/**
 * Calculates the distance between two latlng locations in km.
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function (p1, p2) {
  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};


/**
 * Determines if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function (marker, bounds) {
  return bounds.contains(marker.getPosition());
};


/**
 * Adds a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 */
MarkerClusterer.prototype.addToClosestCluster_ = function (marker) {
  var i, d, cluster, center;
  var distance = 40000; // Some large number
  var clusterToAddTo = null;
  for (i = 0; i < this.clusters_.length; i++) {
    cluster = this.clusters_[i];
    center = cluster.getCenter();
    if (center) {
      d = this.distanceBetweenPoints_(center, marker.getPosition());
      if (d < distance) {
        distance = d;
        clusterToAddTo = cluster;
      }
    }
  }

  if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
    clusterToAddTo.addMarker(marker);
  } else {
    cluster = new Cluster(this);
    cluster.addMarker(marker);
    this.clusters_.push(cluster);
  }
};


/**
 * Creates the clusters. This is done in batches to avoid timeout errors
 *  in some browsers when there is a huge number of markers.
 *
 * @param {number} iFirst The index of the first marker in the batch of
 *  markers to be added to clusters.
 */
MarkerClusterer.prototype.createClusters_ = function (iFirst) {
  var i, marker;
  var mapBounds;
  var cMarkerClusterer = this;
  if (!this.ready_) {
    return;
  }

  // Cancel previous batch processing if we're working on the first batch:
  if (iFirst === 0) {
    /**
     * This event is fired when the <code>MarkerClusterer</code> begins
     *  clustering markers.
     * @name MarkerClusterer#clusteringbegin
     * @param {MarkerClusterer} mc The MarkerClusterer whose markers are being clustered.
     * @event
     */
    google.maps.event.trigger(this, "clusteringbegin", this);

    if (typeof this.timerRefStatic !== "undefined") {
      clearTimeout(this.timerRefStatic);
      delete this.timerRefStatic;
    }
  }

  // Get our current map view bounds.
  // Create a new bounds object so we don't affect the map.
  //
  // See Comments 9 & 11 on Issue 3651 relating to this workaround for a Google Maps bug:
  if (this.getMap().getZoom() > 3) {
    mapBounds = new google.maps.LatLngBounds(this.getMap().getBounds().getSouthWest(),
      this.getMap().getBounds().getNorthEast());
  } else {
    mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(85.02070771743472, -178.48388434375), new google.maps.LatLng(-85.08136444384544, 178.00048865625));
  }
  var bounds = this.getExtendedBounds(mapBounds);

  var iLast = Math.min(iFirst + this.batchSize_, this.markers_.length);

  for (i = iFirst; i < iLast; i++) {
    marker = this.markers_[i];
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
      if (!this.ignoreHidden_ || (this.ignoreHidden_ && marker.getVisible())) {
        this.addToClosestCluster_(marker);
      }
    }
  }

  if (iLast < this.markers_.length) {
    this.timerRefStatic = setTimeout(function () {
      cMarkerClusterer.createClusters_(iLast);
    }, 0);
  } else {
    delete this.timerRefStatic;

    /**
     * This event is fired when the <code>MarkerClusterer</code> stops
     *  clustering markers.
     * @name MarkerClusterer#clusteringend
     * @param {MarkerClusterer} mc The MarkerClusterer whose markers are being clustered.
     * @event
     */
    google.maps.event.trigger(this, "clusteringend", this);
  }
};


/**
 * Extends an object's prototype by another's.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function (obj1, obj2) {
  return (function (object) {
    var property;
    for (property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * The default function for determining the label text and style
 * for a cluster icon.
 *
 * @param {Array.<google.maps.Marker>} markers The array of markers represented by the cluster.
 * @param {number} numStyles The number of marker styles available.
 * @return {ClusterIconInfo} The information resource for the cluster.
 * @constant
 * @ignore
 */
MarkerClusterer.CALCULATOR = function (markers, numStyles) {
  var index = 0;
  var title = "";
  var count = markers.length.toString();

  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  index = Math.min(index, numStyles);
  return {
    text: count,
    index: index,
    title: title
  };
};


/**
 * The number of markers to process in one batch.
 *
 * @type {number}
 * @constant
 */
MarkerClusterer.BATCH_SIZE = 2000;


/**
 * The number of markers to process in one batch (IE only).
 *
 * @type {number}
 * @constant
 */
MarkerClusterer.BATCH_SIZE_IE = 500;


/**
 * The default root name for the marker cluster images.
 *
 * @type {string}
 * @constant
 */
MarkerClusterer.IMAGE_PATH = "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m";


/**
 * The default extension name for the marker cluster images.
 *
 * @type {string}
 * @constant
 */
MarkerClusterer.IMAGE_EXTENSION = "png";


/**
 * The default array of sizes for the marker cluster images.
 *
 * @type {Array.<number>}
 * @constant
 */
MarkerClusterer.IMAGE_SIZES = [53, 56, 66, 78, 90];
;
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3.js
// ==/ClosureCompiler==

/**
 * @name CSS3 InfoBubble with tabs for Google Maps API V3
 * @version 0.8
 * @author Luke Mahe
 * @fileoverview
 * This library is a CSS Infobubble with tabs. It uses css3 rounded corners and
 * drop shadows and animations. It also allows tabs
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A CSS3 InfoBubble v0.8
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @extends {google.maps.OverlayView}
 * @constructor
 */
function InfoBubble(opt_options) {
  this.extend(InfoBubble, google.maps.OverlayView);
  this.tabs_ = [];
  this.activeTab_ = null;
  this.baseZIndex_ = 100;
  this.isOpen_ = false;

  var options = opt_options || {};

  if (options['backgroundColor'] == undefined) {
    options['backgroundColor'] = this.BACKGROUND_COLOR_;
  }

  if (options['borderColor'] == undefined) {
    options['borderColor'] = this.BORDER_COLOR_;
  }

  if (options['borderRadius'] == undefined) {
    options['borderRadius'] = this.BORDER_RADIUS_;
  }

  if (options['borderWidth'] == undefined) {
    options['borderWidth'] = this.BORDER_WIDTH_;
  }

  if (options['padding'] == undefined) {
    options['padding'] = this.PADDING_;
  }

  if (options['arrowPosition'] == undefined) {
    options['arrowPosition'] = this.ARROW_POSITION_;
  }

  if (options['disableAutoPan'] == undefined) {
    options['disableAutoPan'] = false;
  }

  if (options['disableAnimation'] == undefined) {
    options['disableAnimation'] = false;
  }

  if (options['minWidth'] == undefined) {
    options['minWidth'] = this.MIN_WIDTH_;
  }

  if (options['shadowStyle'] == undefined) {
    options['shadowStyle'] = this.SHADOW_STYLE_;
  }

  if (options['arrowSize'] == undefined) {
    options['arrowSize'] = this.ARROW_SIZE_;
  }

  if (options['arrowStyle'] == undefined) {
    options['arrowStyle'] = this.ARROW_STYLE_;
  }

  this.buildDom_();

  this.setValues(options);
}
window['InfoBubble'] = InfoBubble;


/**
 * Default arrow size
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_SIZE_ = 15;


/**
 * Default arrow style
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_STYLE_ = 0;


/**
 * Default shadow style
 * @const
 * @private
 */
InfoBubble.prototype.SHADOW_STYLE_ = 1;


/**
 * Default min width
 * @const
 * @private
 */
InfoBubble.prototype.MIN_WIDTH_ = 50;


/**
 * Default arrow position
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_POSITION_ = 50;


/**
 * Default padding
 * @const
 * @private
 */
InfoBubble.prototype.PADDING_ = 10;


/**
 * Default border width
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_WIDTH_ = 1;


/**
 * Default border color
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_COLOR_ = '#ccc';


/**
 * Default border radius
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_RADIUS_ = 10;


/**
 * Default background color
 * @const
 * @private
 */
InfoBubble.prototype.BACKGROUND_COLOR_ = '#fff';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
InfoBubble.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Builds the InfoBubble dom
 * @private
 */
InfoBubble.prototype.buildDom_ = function() {
  var bubble = this.bubble_ = document.createElement('DIV');
  bubble.style['position'] = 'absolute';
  bubble.style['zIndex'] = this.baseZIndex_;

  var tabsContainer = this.tabsContainer_ = document.createElement('DIV');
  tabsContainer.style['position'] = 'relative';

  // Close button
  var close = this.close_ = document.createElement('IMG');
  close.style['position'] = 'absolute';
  close.style['width'] = this.px(12);
  close.style['height'] = this.px(12);
  close.style['border'] = 0;
  close.style['zIndex'] = this.baseZIndex_ + 1;
  close.style['cursor'] = 'pointer';
  close.src = 'http://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif';

  var that = this;
  google.maps.event.addDomListener(close, 'click', function() {
    that.close();
    google.maps.event.trigger(that, 'closeclick');
  });

  // Content area
  var contentContainer = this.contentContainer_ = document.createElement('DIV');
  contentContainer.style['overflowX'] = 'auto';
  contentContainer.style['overflowY'] = 'auto';
  contentContainer.style['cursor'] = 'default';
  contentContainer.style['clear'] = 'both';
  contentContainer.style['position'] = 'relative';

  var content = this.content_ = document.createElement('DIV');
  contentContainer.appendChild(content);

  // Arrow
  var arrow = this.arrow_ = document.createElement('DIV');
  arrow.style['position'] = 'relative';

  var arrowOuter = this.arrowOuter_ = document.createElement('DIV');
  var arrowInner = this.arrowInner_ = document.createElement('DIV');

  var arrowSize = this.getArrowSize_();

  arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
  arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
  arrowOuter.style['height'] = arrowInner.style['height'] = '0';
  arrowOuter.style['width'] = arrowInner.style['width'] = '0';
  arrowOuter.style['marginLeft'] = this.px(-arrowSize);
  arrowOuter.style['borderWidth'] = this.px(arrowSize);
  arrowOuter.style['borderBottomWidth'] = 0;

  // Shadow
  var bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
  bubbleShadow.style['position'] = 'absolute';

  // Hide the InfoBubble by default
  bubble.style['display'] = bubbleShadow.style['display'] = 'none';

  bubble.appendChild(this.tabsContainer_);
  bubble.appendChild(close);
  bubble.appendChild(contentContainer);
  arrow.appendChild(arrowOuter);
  arrow.appendChild(arrowInner);
  bubble.appendChild(arrow);

  var stylesheet = document.createElement('style');
  stylesheet.setAttribute('type', 'text/css');

  /**
   * The animation for the infobubble
   * @type {string}
   */
  this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);

  var css = '.' + this.animationName_ + '{-webkit-animation-name:' +
      this.animationName_ + ';-webkit-animation-duration:0.5s;' +
      '-webkit-animation-iteration-count:1;}' +
      '@-webkit-keyframes ' + this.animationName_ + ' {from {' +
      '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% ' +
      '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';

  stylesheet.textContent = css;
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
};


/**
 * Sets the background class name
 *
 * @param {string} className The class name to set.
 */
InfoBubble.prototype.setBackgroundClassName = function(className) {
  this.set('backgroundClassName', className);
};
InfoBubble.prototype['setBackgroundClassName'] =
    InfoBubble.prototype.setBackgroundClassName;


/**
 * changed MVC callback
 */
InfoBubble.prototype.backgroundClassName_changed = function() {
  this.content_.className = this.get('backgroundClassName');
};
InfoBubble.prototype['backgroundClassName_changed'] =
    InfoBubble.prototype.backgroundClassName_changed;


/**
 * Sets the class of the tab
 *
 * @param {string} className the class name to set.
 */
InfoBubble.prototype.setTabClassName = function(className) {
  this.set('tabClassName', className);
};
InfoBubble.prototype['setTabClassName'] =
    InfoBubble.prototype.setTabClassName;


/**
 * tabClassName changed MVC callback
 */
InfoBubble.prototype.tabClassName_changed = function() {
  this.updateTabStyles_();
};
InfoBubble.prototype['tabClassName_changed'] =
    InfoBubble.prototype.tabClassName_changed;


/**
 * Gets the style of the arrow
 *
 * @private
 * @return {number} The style of the arrow.
 */
InfoBubble.prototype.getArrowStyle_ = function() {
  return parseInt(this.get('arrowStyle'), 10) || 0;
};


/**
 * Sets the style of the arrow
 *
 * @param {number} style The style of the arrow.
 */
InfoBubble.prototype.setArrowStyle = function(style) {
  this.set('arrowStyle', style);
};
InfoBubble.prototype['setArrowStyle'] =
    InfoBubble.prototype.setArrowStyle;


/**
 * Arrow style changed MVC callback
 */
InfoBubble.prototype.arrowStyle_changed = function() {
  this.arrowSize_changed();
};
InfoBubble.prototype['arrowStyle_changed'] =
    InfoBubble.prototype.arrowStyle_changed;


/**
 * Gets the size of the arrow
 *
 * @private
 * @return {number} The size of the arrow.
 */
InfoBubble.prototype.getArrowSize_ = function() {
  return parseInt(this.get('arrowSize'), 10) || 0;
};


/**
 * Sets the size of the arrow
 *
 * @param {number} size The size of the arrow.
 */
InfoBubble.prototype.setArrowSize = function(size) {
  this.set('arrowSize', size);
};
InfoBubble.prototype['setArrowSize'] =
    InfoBubble.prototype.setArrowSize;


/**
 * Arrow size changed MVC callback
 */
InfoBubble.prototype.arrowSize_changed = function() {
  this.borderWidth_changed();
};
InfoBubble.prototype['arrowSize_changed'] =
    InfoBubble.prototype.arrowSize_changed;


/**
 * Set the position of the InfoBubble arrow
 *
 * @param {number} pos The position to set.
 */
InfoBubble.prototype.setArrowPosition = function(pos) {
  this.set('arrowPosition', pos);
};
InfoBubble.prototype['setArrowPosition'] =
    InfoBubble.prototype.setArrowPosition;


/**
 * Get the position of the InfoBubble arrow
 *
 * @private
 * @return {number} The position..
 */
InfoBubble.prototype.getArrowPosition_ = function() {
  return parseInt(this.get('arrowPosition'), 10) || 0;
};


/**
 * arrowPosition changed MVC callback
 */
InfoBubble.prototype.arrowPosition_changed = function() {
  var pos = this.getArrowPosition_();
  this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

  this.redraw_();
};
InfoBubble.prototype['arrowPosition_changed'] =
    InfoBubble.prototype.arrowPosition_changed;


/**
 * Set the zIndex of the InfoBubble
 *
 * @param {number} zIndex The zIndex to set.
 */
InfoBubble.prototype.setZIndex = function(zIndex) {
  this.set('zIndex', zIndex);
};
InfoBubble.prototype['setZIndex'] = InfoBubble.prototype.setZIndex;


/**
 * Get the zIndex of the InfoBubble
 *
 * @return {number} The zIndex to set.
 */
InfoBubble.prototype.getZIndex = function() {
  return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
};


/**
 * zIndex changed MVC callback
 */
InfoBubble.prototype.zIndex_changed = function() {
  var zIndex = this.getZIndex();

  this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
  this.close_.style['zIndex'] = zIndex + 1;
};
InfoBubble.prototype['zIndex_changed'] = InfoBubble.prototype.zIndex_changed;


/**
 * Set the style of the shadow
 *
 * @param {number} shadowStyle The style of the shadow.
 */
InfoBubble.prototype.setShadowStyle = function(shadowStyle) {
  this.set('shadowStyle', shadowStyle);
};
InfoBubble.prototype['setShadowStyle'] = InfoBubble.prototype.setShadowStyle;


/**
 * Get the style of the shadow
 *
 * @private
 * @return {number} The style of the shadow.
 */
InfoBubble.prototype.getShadowStyle_ = function() {
  return parseInt(this.get('shadowStyle'), 10) || 0;
};


/**
 * shadowStyle changed MVC callback
 */
InfoBubble.prototype.shadowStyle_changed = function() {
  var shadowStyle = this.getShadowStyle_();

  var display = '';
  var shadow = '';
  var backgroundColor = '';
  switch (shadowStyle) {
    case 0:
      display = 'none';
      break;
    case 1:
      shadow = '35px 25px 8px rgba(33,33,33,0.3)';
      backgroundColor = 'transparent';
      break;
    case 2:
      shadow = '0 0 2px rgba(33,33,33,0.3)';
      backgroundColor = 'rgba(33,33,33,0.35)';
      break;
  }
  this.bubbleShadow_.style['boxShadow'] =
      this.bubbleShadow_.style['webkitBoxShadow'] =
      this.bubbleShadow_.style['MozBoxShadow'] = shadow;
  this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
  if (this.isOpen_) {
    this.bubbleShadow_.style['display'] = display;
    this.draw();
  }
};
InfoBubble.prototype['shadowStyle_changed'] =
    InfoBubble.prototype.shadowStyle_changed;


/**
 * Show the close button
 */
InfoBubble.prototype.showCloseButton = function() {
  this.set('hideCloseButton', false);
};
InfoBubble.prototype['showCloseButton'] = InfoBubble.prototype.showCloseButton;


/**
 * Hide the close button
 */
InfoBubble.prototype.hideCloseButton = function() {
  this.set('hideCloseButton', true);
};
InfoBubble.prototype['hideCloseButton'] = InfoBubble.prototype.hideCloseButton;


/**
 * hideCloseButton changed MVC callback
 */
InfoBubble.prototype.hideCloseButton_changed = function() {
  this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
};
InfoBubble.prototype['hideCloseButton_changed'] =
    InfoBubble.prototype.hideCloseButton_changed;


/**
 * Set the background color
 *
 * @param {string} color The color to set.
 */
InfoBubble.prototype.setBackgroundColor = function(color) {
  if (color) {
    this.set('backgroundColor', color);
  }
};
InfoBubble.prototype['setBackgroundColor'] =
    InfoBubble.prototype.setBackgroundColor;


/**
 * backgroundColor changed MVC callback
 */
InfoBubble.prototype.backgroundColor_changed = function() {
  var backgroundColor = this.get('backgroundColor');
  this.contentContainer_.style['backgroundColor'] = backgroundColor;

  this.arrowInner_.style['borderColor'] = backgroundColor +
      ' transparent transparent';
  this.updateTabStyles_();
};
InfoBubble.prototype['backgroundColor_changed'] =
    InfoBubble.prototype.backgroundColor_changed;


/**
 * Set the border color
 *
 * @param {string} color The border color.
 */
InfoBubble.prototype.setBorderColor = function(color) {
  if (color) {
    this.set('borderColor', color);
  }
};
InfoBubble.prototype['setBorderColor'] = InfoBubble.prototype.setBorderColor;


/**
 * borderColor changed MVC callback
 */
InfoBubble.prototype.borderColor_changed = function() {
  var borderColor = this.get('borderColor');

  var contentContainer = this.contentContainer_;
  var arrowOuter = this.arrowOuter_;
  contentContainer.style['borderColor'] = borderColor;

  arrowOuter.style['borderColor'] = borderColor +
      ' transparent transparent';

  contentContainer.style['borderStyle'] =
      arrowOuter.style['borderStyle'] =
      this.arrowInner_.style['borderStyle'] = 'solid';

  this.updateTabStyles_();
};
InfoBubble.prototype['borderColor_changed'] =
    InfoBubble.prototype.borderColor_changed;


/**
 * Set the radius of the border
 *
 * @param {number} radius The radius of the border.
 */
InfoBubble.prototype.setBorderRadius = function(radius) {
  this.set('borderRadius', radius);
};
InfoBubble.prototype['setBorderRadius'] = InfoBubble.prototype.setBorderRadius;


/**
 * Get the radius of the border
 *
 * @private
 * @return {number} The radius of the border.
 */
InfoBubble.prototype.getBorderRadius_ = function() {
  return parseInt(this.get('borderRadius'), 10) || 0;
};


/**
 * borderRadius changed MVC callback
 */
InfoBubble.prototype.borderRadius_changed = function() {
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderRadius'] =
      this.contentContainer_.style['MozBorderRadius'] =
      this.contentContainer_.style['webkitBorderRadius'] =
      this.bubbleShadow_.style['borderRadius'] =
      this.bubbleShadow_.style['MozBorderRadius'] =
      this.bubbleShadow_.style['webkitBorderRadius'] = this.px(borderRadius);

  this.tabsContainer_.style['paddingLeft'] =
      this.tabsContainer_.style['paddingRight'] =
      this.px(borderRadius + borderWidth);

  this.redraw_();
};
InfoBubble.prototype['borderRadius_changed'] =
    InfoBubble.prototype.borderRadius_changed;


/**
 * Get the width of the border
 *
 * @private
 * @return {number} width The width of the border.
 */
InfoBubble.prototype.getBorderWidth_ = function() {
  return parseInt(this.get('borderWidth'), 10) || 0;
};


/**
 * Set the width of the border
 *
 * @param {number} width The width of the border.
 */
InfoBubble.prototype.setBorderWidth = function(width) {
  this.set('borderWidth', width);
};
InfoBubble.prototype['setBorderWidth'] = InfoBubble.prototype.setBorderWidth;


/**
 * borderWidth change MVC callback
 */
InfoBubble.prototype.borderWidth_changed = function() {
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
  this.tabsContainer_.style['top'] = this.px(borderWidth);

  this.updateArrowStyle_();
  this.updateTabStyles_();
  this.borderRadius_changed();
  this.redraw_();
};
InfoBubble.prototype['borderWidth_changed'] =
    InfoBubble.prototype.borderWidth_changed;


/**
 * Update the arrow style
 * @private
 */
InfoBubble.prototype.updateArrowStyle_ = function() {
  var borderWidth = this.getBorderWidth_();
  var arrowSize = this.getArrowSize_();
  var arrowStyle = this.getArrowStyle_();
  var arrowOuterSizePx = this.px(arrowSize);
  var arrowInnerSizePx = this.px(Math.max(0, arrowSize - borderWidth));

  var outer = this.arrowOuter_;
  var inner = this.arrowInner_;

  this.arrow_.style['marginTop'] = this.px(-borderWidth);
  outer.style['borderTopWidth'] = arrowOuterSizePx;
  inner.style['borderTopWidth'] = arrowInnerSizePx;

  // Full arrow or arrow pointing to the left
  if (arrowStyle == 0 || arrowStyle == 1) {
    outer.style['borderLeftWidth'] = arrowOuterSizePx;
    inner.style['borderLeftWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
  }

  // Full arrow or arrow pointing to the right
  if (arrowStyle == 0 || arrowStyle == 2) {
    outer.style['borderRightWidth'] = arrowOuterSizePx;
    inner.style['borderRightWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
  }

  if (arrowStyle < 2) {
    outer.style['marginLeft'] = this.px(-(arrowSize));
    inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth));
  } else {
    outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
  }

  // If there is no border then don't show thw outer arrow
  if (borderWidth == 0) {
    outer.style['display'] = 'none';
  } else {
    outer.style['display'] = '';
  }
};


/**
 * Set the padding of the InfoBubble
 *
 * @param {number} padding The padding to apply.
 */
InfoBubble.prototype.setPadding = function(padding) {
  this.set('padding', padding);
};
InfoBubble.prototype['setPadding'] = InfoBubble.prototype.setPadding;


/**
 * Set the padding of the InfoBubble
 *
 * @private
 * @return {number} padding The padding to apply.
 */
InfoBubble.prototype.getPadding_ = function() {
  return parseInt(this.get('padding'), 10) || 0;
};


/**
 * padding changed MVC callback
 */
InfoBubble.prototype.padding_changed = function() {
  var padding = this.getPadding_();
  this.contentContainer_.style['padding'] = this.px(padding);
  this.updateTabStyles_();

  this.redraw_();
};
InfoBubble.prototype['padding_changed'] = InfoBubble.prototype.padding_changed;


/**
 * Add px extention to the number
 *
 * @param {number} num The number to wrap.
 * @return {string|number} A wrapped number.
 */
InfoBubble.prototype.px = function(num) {
  if (num) {
    // 0 doesn't need to be wrapped
    return num + 'px';
  }
  return num;
};


/**
 * Add events to stop propagation
 * @private
 */
InfoBubble.prototype.addEvents_ = function() {
  // We want to cancel all the events so they do not go to the map
  var events = ['mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
      'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
      'dblclick', 'contextmenu', 'click'];

  var bubble = this.bubble_;
  this.listeners_ = [];
  for (var i = 0, event; event = events[i]; i++) {
    this.listeners_.push(
      google.maps.event.addDomListener(bubble, event, function(e) {
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
      })
    );
  }
};


/**
 * On Adding the InfoBubble to a map
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.onAdd = function() {
  if (!this.bubble_) {
    this.buildDom_();
  }

  this.addEvents_();

  var panes = this.getPanes();
  if (panes) {
    panes.floatPane.appendChild(this.bubble_);
    panes.floatShadow.appendChild(this.bubbleShadow_);
  }
};
InfoBubble.prototype['onAdd'] = InfoBubble.prototype.onAdd;


/**
 * Draw the InfoBubble
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

  if (!latLng) {
    this.close();
    return;
  }

  var tabHeight = 0;

  if (this.activeTab_) {
    tabHeight = this.activeTab_.offsetHeight;
  }

  var anchorHeight = this.getAnchorHeight_();
  var arrowSize = this.getArrowSize_();
  var arrowPosition = this.getArrowPosition_();

  arrowPosition = arrowPosition / 100;

  var pos = projection.fromLatLngToDivPixel(latLng);
  var width = this.contentContainer_.offsetWidth;
  var height = this.bubble_.offsetHeight;

  if (!width) {
    return;
  }

  // Adjust for the height of the info bubble
  var top = pos.y - (height + arrowSize);

  if (anchorHeight) {
    // If there is an anchor then include the height
    top -= anchorHeight;
  }

  var left = pos.x - (width * arrowPosition);

  this.bubble_.style['top'] = this.px(top);
  this.bubble_.style['left'] = this.px(left);

  var shadowStyle = parseInt(this.get('shadowStyle'), 10);

  switch (shadowStyle) {
    case 1:
      // Shadow is behind
      this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
      this.bubbleShadow_.style['left'] = this.px(left);
      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] =
          this.px(this.contentContainer_.offsetHeight - arrowSize);
      break;
    case 2:
      // Shadow is below
      width = width * 0.8;
      if (anchorHeight) {
        this.bubbleShadow_.style['top'] = this.px(pos.y);
      } else {
        this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
      }
      this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);

      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] = this.px(2);
      break;
  }
};
InfoBubble.prototype['draw'] = InfoBubble.prototype.draw;


/**
 * Removing the InfoBubble from a map
 */
InfoBubble.prototype.onRemove = function() {
  if (this.bubble_ && this.bubble_.parentNode) {
    this.bubble_.parentNode.removeChild(this.bubble_);
  }
  if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) {
    this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_);
  }

  for (var i = 0, listener; listener = this.listeners_[i]; i++) {
    google.maps.event.removeListener(listener);
  }
};
InfoBubble.prototype['onRemove'] = InfoBubble.prototype.onRemove;


/**
 * Is the InfoBubble open
 *
 * @return {boolean} If the InfoBubble is open.
 */
InfoBubble.prototype.isOpen = function() {
  return this.isOpen_;
};
InfoBubble.prototype['isOpen'] = InfoBubble.prototype.isOpen;


/**
 * Close the InfoBubble
 */
InfoBubble.prototype.close = function() {
  if (this.bubble_) {
    this.bubble_.style['display'] = 'none';
    // Remove the animation so we next time it opens it will animate again
    this.bubble_.className =
        this.bubble_.className.replace(this.animationName_, '');
  }

  if (this.bubbleShadow_) {
    this.bubbleShadow_.style['display'] = 'none';
    this.bubbleShadow_.className =
        this.bubbleShadow_.className.replace(this.animationName_, '');
  }
  this.isOpen_ = false;
};
InfoBubble.prototype['close'] = InfoBubble.prototype.close;


/**
 * Open the InfoBubble (asynchronous).
 *
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open = function(opt_map, opt_anchor) {
  var that = this;
  window.setTimeout(function() {
    that.open_(opt_map, opt_anchor);
  }, 0);
};

/**
 * Open the InfoBubble
 * @private
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open_ = function(opt_map, opt_anchor) {
  this.updateContent_();

  if (opt_map) {
    this.setMap(opt_map);
  }

  if (opt_anchor) {
    this.set('anchor', opt_anchor);
    this.bindTo('anchorPoint', opt_anchor);
    this.bindTo('position', opt_anchor);
  }

  // Show the bubble and the show
  this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
  var animation = !this.get('disableAnimation');

  if (animation) {
    // Add the animation
    this.bubble_.className += ' ' + this.animationName_;
    this.bubbleShadow_.className += ' ' + this.animationName_;
  }

  this.redraw_();
  this.isOpen_ = true;

  var pan = !this.get('disableAutoPan');
  if (pan) {
    var that = this;
    window.setTimeout(function() {
      // Pan into view, done in a time out to make it feel nicer :)
      that.panToView();
    }, 200);
  }
};
InfoBubble.prototype['open'] = InfoBubble.prototype.open;


/**
 * Set the position of the InfoBubble
 *
 * @param {google.maps.LatLng} position The position to set.
 */
InfoBubble.prototype.setPosition = function(position) {
  if (position) {
    this.set('position', position);
  }
};
InfoBubble.prototype['setPosition'] = InfoBubble.prototype.setPosition;


/**
 * Returns the position of the InfoBubble
 *
 * @return {google.maps.LatLng} the position.
 */
InfoBubble.prototype.getPosition = function() {
  return /** @type {google.maps.LatLng} */ (this.get('position'));
};
InfoBubble.prototype['getPosition'] = InfoBubble.prototype.getPosition;


/**
 * position changed MVC callback
 */
InfoBubble.prototype.position_changed = function() {
  this.draw();
};
InfoBubble.prototype['position_changed'] =
    InfoBubble.prototype.position_changed;


/**
 * Pan the InfoBubble into view
 */
InfoBubble.prototype.panToView = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  if (!this.bubble_) {
    // No Bubble yet so do nothing
    return;
  }

  var anchorHeight = this.getAnchorHeight_();
  var height = this.bubble_.offsetHeight + anchorHeight;
  var map = this.get('map');
  var mapDiv = map.getDiv();
  var mapHeight = mapDiv.offsetHeight;

  var latLng = this.getPosition();
  var centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
  var pos = projection.fromLatLngToContainerPixel(latLng);

  // Find out how much space at the top is free
  var spaceTop = centerPos.y - height;

  // Fine out how much space at the bottom is free
  var spaceBottom = mapHeight - centerPos.y;

  var needsTop = spaceTop < 0;
  var deltaY = 0;

  if (needsTop) {
    spaceTop *= -1;
    deltaY = (spaceTop + spaceBottom) / 2;
  }

  pos.y -= deltaY;
  latLng = projection.fromContainerPixelToLatLng(pos);

  if (map.getCenter() != latLng) {
    map.panTo(latLng);
  }
};
InfoBubble.prototype['panToView'] = InfoBubble.prototype.panToView;


/**
 * Converts a HTML string to a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {Node} A HTML document fragment.
 * @private
 */
InfoBubble.prototype.htmlToDocumentFragment_ = function(htmlString) {
  htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
  var tempDiv = document.createElement('DIV');
  tempDiv.innerHTML = htmlString;
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Removes all children from the node.
 *
 * @param {Node} node The node to remove all children from.
 * @private
 */
InfoBubble.prototype.removeChildren_ = function(node) {
  if (!node) {
    return;
  }

  var child;
  while (child = node.firstChild) {
    node.removeChild(child);
  }
};


/**
 * Sets the content of the infobubble.
 *
 * @param {string|Node} content The content to set.
 */
InfoBubble.prototype.setContent = function(content) {
  this.set('content', content);
};
InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;


/**
 * Get the content of the infobubble.
 *
 * @return {string|Node} The marker content.
 */
InfoBubble.prototype.getContent = function() {
  return /** @type {Node|string} */ (this.get('content'));
};
InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;


/**
 * Sets the marker content and adds loading events to images
 */
InfoBubble.prototype.updateContent_ = function() {
  if (!this.content_) {
    // The Content area doesnt exist.
    return;
  }

  this.removeChildren_(this.content_);
  var content = this.getContent();
  if (content) {
    if (typeof content == 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    this.content_.appendChild(content);

    var that = this;
    var images = this.content_.getElementsByTagName('IMG');
    for (var i = 0, image; image = images[i]; i++) {
      // Because we don't know the size of an image till it loads, add a
      // listener to the image load so the marker can resize and reposition
      // itself to be the correct height.
      google.maps.event.addDomListener(image, 'load', function() {
        that.imageLoaded_();
      });
    }
    google.maps.event.trigger(this, 'domready');
  }
  this.redraw_();
};

/**
 * Image loaded
 * @private
 */
InfoBubble.prototype.imageLoaded_ = function() {
  var pan = !this.get('disableAutoPan');
  this.redraw_();
  if (pan && (this.tabs_.length == 0 || this.activeTab_.index == 0)) {
    this.panToView();
  }
};

/**
 * Updates the styles of the tabs
 * @private
 */
InfoBubble.prototype.updateTabStyles_ = function() {
  if (this.tabs_ && this.tabs_.length) {
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      this.setTabStyle_(tab.tab);
    }
    this.activeTab_.style['zIndex'] = this.baseZIndex_;
    var borderWidth = this.getBorderWidth_();
    var padding = this.getPadding_() / 2;
    this.activeTab_.style['borderBottomWidth'] = 0;
    this.activeTab_.style['paddingBottom'] = this.px(padding + borderWidth);
  }
};


/**
 * Sets the style of a tab
 * @private
 * @param {Element} tab The tab to style.
 */
InfoBubble.prototype.setTabStyle_ = function(tab) {
  var backgroundColor = this.get('backgroundColor');
  var borderColor = this.get('borderColor');
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();
  var padding = this.getPadding_();

  var marginRight = this.px(-(Math.max(padding, borderRadius)));
  var borderRadiusPx = this.px(borderRadius);

  var index = this.baseZIndex_;
  if (tab.index) {
    index -= tab.index;
  }

  // The styles for the tab
  var styles = {
    'cssFloat': 'left',
    'position': 'relative',
    'cursor': 'pointer',
    'backgroundColor': backgroundColor,
    'border': this.px(borderWidth) + ' solid ' + borderColor,
    'padding': this.px(padding / 2) + ' ' + this.px(padding),
    'marginRight': marginRight,
    'whiteSpace': 'nowrap',
    'borderRadiusTopLeft': borderRadiusPx,
    'MozBorderRadiusTopleft': borderRadiusPx,
    'webkitBorderTopLeftRadius': borderRadiusPx,
    'borderRadiusTopRight': borderRadiusPx,
    'MozBorderRadiusTopright': borderRadiusPx,
    'webkitBorderTopRightRadius': borderRadiusPx,
    'zIndex': index,
    'display': 'inline'
  };

  for (var style in styles) {
    tab.style[style] = styles[style];
  }

  var className = this.get('tabClassName');
  if (className != undefined) {
    tab.className += ' ' + className;
  }
};


/**
 * Add user actions to a tab
 * @private
 * @param {Object} tab The tab to add the actions to.
 */
InfoBubble.prototype.addTabActions_ = function(tab) {
  var that = this;
  tab.listener_ = google.maps.event.addDomListener(tab, 'click', function() {
    that.setTabActive_(this);
  });
};


/**
 * Set a tab at a index to be active
 *
 * @param {number} index The index of the tab.
 */
InfoBubble.prototype.setTabActive = function(index) {
  var tab = this.tabs_[index - 1];

  if (tab) {
    this.setTabActive_(tab.tab);
  }
};
InfoBubble.prototype['setTabActive'] = InfoBubble.prototype.setTabActive;


/**
 * Set a tab to be active
 * @private
 * @param {Object} tab The tab to set active.
 */
InfoBubble.prototype.setTabActive_ = function(tab) {
  if (!tab) {
    this.setContent('');
    this.updateContent_();
    return;
  }

  var padding = this.getPadding_() / 2;
  var borderWidth = this.getBorderWidth_();

  if (this.activeTab_) {
    var activeTab = this.activeTab_;
    activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
    activeTab.style['paddingBottom'] = this.px(padding);
    activeTab.style['borderBottomWidth'] = this.px(borderWidth);
  }

  tab.style['zIndex'] = this.baseZIndex_;
  tab.style['borderBottomWidth'] = 0;
  tab.style['marginBottomWidth'] = '-10px';
  tab.style['paddingBottom'] = this.px(padding + borderWidth);

  this.setContent(this.tabs_[tab.index].content);
  this.updateContent_();

  this.activeTab_ = tab;

  this.redraw_();
};


/**
 * Set the max width of the InfoBubble
 *
 * @param {number} width The max width.
 */
InfoBubble.prototype.setMaxWidth = function(width) {
  this.set('maxWidth', width);
};
InfoBubble.prototype['setMaxWidth'] = InfoBubble.prototype.setMaxWidth;


/**
 * maxWidth changed MVC callback
 */
InfoBubble.prototype.maxWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxWidth_changed'] =
    InfoBubble.prototype.maxWidth_changed;


/**
 * Set the max height of the InfoBubble
 *
 * @param {number} height The max height.
 */
InfoBubble.prototype.setMaxHeight = function(height) {
  this.set('maxHeight', height);
};
InfoBubble.prototype['setMaxHeight'] = InfoBubble.prototype.setMaxHeight;


/**
 * maxHeight changed MVC callback
 */
InfoBubble.prototype.maxHeight_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxHeight_changed'] =
    InfoBubble.prototype.maxHeight_changed;


/**
 * Set the min width of the InfoBubble
 *
 * @param {number} width The min width.
 */
InfoBubble.prototype.setMinWidth = function(width) {
  this.set('minWidth', width);
};
InfoBubble.prototype['setMinWidth'] = InfoBubble.prototype.setMinWidth;


/**
 * minWidth changed MVC callback
 */
InfoBubble.prototype.minWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['minWidth_changed'] =
    InfoBubble.prototype.minWidth_changed;


/**
 * Set the min height of the InfoBubble
 *
 * @param {number} height The min height.
 */
InfoBubble.prototype.setMinHeight = function(height) {
  this.set('minHeight', height);
};
InfoBubble.prototype['setMinHeight'] = InfoBubble.prototype.setMinHeight;


/**
 * minHeight changed MVC callback
 */
InfoBubble.prototype.minHeight_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['minHeight_changed'] =
    InfoBubble.prototype.minHeight_changed;


/**
 * Add a tab
 *
 * @param {string} label The label of the tab.
 * @param {string|Element} content The content of the tab.
 */
InfoBubble.prototype.addTab = function(label, content) {
  var tab = document.createElement('DIV');
  tab.innerHTML = label;

  this.setTabStyle_(tab);
  this.addTabActions_(tab);

  this.tabsContainer_.appendChild(tab);

  this.tabs_.push({
    label: label,
    content: content,
    tab: tab
  });

  tab.index = this.tabs_.length - 1;
  tab.style['zIndex'] = this.baseZIndex_ - tab.index;

  if (!this.activeTab_) {
    this.setTabActive_(tab);
  }

  tab.className = tab.className + ' ' + this.animationName_;

  this.redraw_();
};
InfoBubble.prototype['addTab'] = InfoBubble.prototype.addTab;

/**
 * Update a tab at a speicifc index
 *
 * @param {number} index The index of the tab.
 * @param {?string} opt_label The label to change to.
 * @param {?string} opt_content The content to update to.
 */
InfoBubble.prototype.updateTab = function(index, opt_label, opt_content) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  if (opt_label != undefined) {
    tab.tab.innerHTML = tab.label = opt_label;
  }

  if (opt_content != undefined) {
    tab.content = opt_content;
  }

  if (this.activeTab_ == tab.tab) {
    this.setContent(tab.content);
    this.updateContent_();
  }
  this.redraw_();
};
InfoBubble.prototype['updateTab'] = InfoBubble.prototype.updateTab;


/**
 * Remove a tab at a specific index
 *
 * @param {number} index The index of the tab to remove.
 */
InfoBubble.prototype.removeTab = function(index) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  tab.tab.parentNode.removeChild(tab.tab);

  google.maps.event.removeListener(tab.tab.listener_);

  this.tabs_.splice(index, 1);

  delete tab;

  for (var i = 0, t; t = this.tabs_[i]; i++) {
    t.tab.index = i;
  }

  if (tab.tab == this.activeTab_) {
    // Removing the current active tab
    if (this.tabs_[index]) {
      // Show the tab to the right
      this.activeTab_ = this.tabs_[index].tab;
    } else if (this.tabs_[index - 1]) {
      // Show a tab to the left
      this.activeTab_ = this.tabs_[index - 1].tab;
    } else {
      // No tabs left to sho
      this.activeTab_ = undefined;
    }

    this.setTabActive_(this.activeTab_);
  }

  this.redraw_();
};
InfoBubble.prototype['removeTab'] = InfoBubble.prototype.removeTab;


/**
 * Get the size of an element
 * @private
 * @param {Node|string} element The element to size.
 * @param {number=} opt_maxWidth Optional max width of the element.
 * @param {number=} opt_maxHeight Optional max height of the element.
 * @return {google.maps.Size} The size of the element.
 */
InfoBubble.prototype.getElementSize_ = function(element, opt_maxWidth,
                                                opt_maxHeight) {
  var sizer = document.createElement('DIV');
  sizer.style['display'] = 'inline';
  sizer.style['position'] = 'absolute';
  sizer.style['visibility'] = 'hidden';

  if (typeof element == 'string') {
    sizer.innerHTML = element;
  } else {
    sizer.appendChild(element.cloneNode(true));
  }

  document.body.appendChild(sizer);
  var size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);

  // If the width is bigger than the max width then set the width and size again
  if (opt_maxWidth && size.width > opt_maxWidth) {
    sizer.style['width'] = this.px(opt_maxWidth);
    size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  }

  // If the height is bigger than the max height then set the height and size
  // again
  if (opt_maxHeight && size.height > opt_maxHeight) {
    sizer.style['height'] = this.px(opt_maxHeight);
    size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  }

  document.body.removeChild(sizer);
  delete sizer;
  return size;
};


/**
 * Redraw the InfoBubble
 * @private
 */
InfoBubble.prototype.redraw_ = function() {
  this.figureOutSize_();
  this.positionCloseButton_();
  this.draw();
};


/**
 * Figure out the optimum size of the InfoBubble
 * @private
 */
InfoBubble.prototype.figureOutSize_ = function() {
  var map = this.get('map');

  if (!map) {
    return;
  }

  var padding = this.getPadding_();
  var borderWidth = this.getBorderWidth_();
  var borderRadius = this.getBorderRadius_();
  var arrowSize = this.getArrowSize_();

  var mapDiv = map.getDiv();
  var gutter = arrowSize * 2;
  var mapWidth = mapDiv.offsetWidth - gutter;
  var mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
  var tabHeight = 0;
  var width = /** @type {number} */ (this.get('minWidth') || 0);
  var height = /** @type {number} */ (this.get('minHeight') || 0);
  var maxWidth = /** @type {number} */ (this.get('maxWidth') || 0);
  var maxHeight = /** @type {number} */ (this.get('maxHeight') || 0);

  maxWidth = Math.min(mapWidth, maxWidth);
  maxHeight = Math.min(mapHeight, maxHeight);

  var tabWidth = 0;
  if (this.tabs_.length) {
    // If there are tabs then you need to check the size of each tab's content
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      var tabSize = this.getElementSize_(tab.tab, maxWidth, maxHeight);
      var contentSize = this.getElementSize_(tab.content, maxWidth, maxHeight);

      if (width < tabSize.width) {
        width = tabSize.width;
      }

      // Add up all the tab widths because they might end up being wider than
      // the content
      tabWidth += tabSize.width;

      if (height < tabSize.height) {
        height = tabSize.height;
      }

      if (tabSize.height > tabHeight) {
        tabHeight = tabSize.height;
      }

      if (width < contentSize.width) {
        width = contentSize.width;
      }

      if (height < contentSize.height) {
        height = contentSize.height;
      }
    }
  } else {
    var content = /** @type {string|Node} */ (this.get('content'));
    if (typeof content == 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    if (content) {
      var contentSize = this.getElementSize_(content, maxWidth, maxHeight);

      if (width < contentSize.width) {
        width = contentSize.width;
      }

      if (height < contentSize.height) {
        height = contentSize.height;
      }
    }
  }

  if (maxWidth) {
    width = Math.min(width, maxWidth);
  }

  if (maxHeight) {
    height = Math.min(height, maxHeight);
  }

  width = Math.max(width, tabWidth);

  if (width == tabWidth) {
    width = width + 2 * padding;
  }

  arrowSize = arrowSize * 2;
  width = Math.max(width, arrowSize);

  // Maybe add this as a option so they can go bigger than the map if the user
  // wants
  if (width > mapWidth) {
    width = mapWidth;
  }

  if (height > mapHeight) {
    height = mapHeight - tabHeight;
  }

  if (this.tabsContainer_) {
    this.tabHeight_ = tabHeight;
    this.tabsContainer_.style['width'] = this.px(tabWidth);
  }

  this.contentContainer_.style['width'] = this.px(width);
  this.contentContainer_.style['height'] = this.px(height);
};


/**
 *  Get the height of the anchor
 *
 *  This function is a hack for now and doesn't really work that good, need to
 *  wait for pixelBounds to be correctly exposed.
 *  @private
 *  @return {number} The height of the anchor.
 */
InfoBubble.prototype.getAnchorHeight_ = function() {
  var anchor = this.get('anchor');
  if (anchor) {
    var anchorPoint = /** @type google.maps.Point */(this.get('anchorPoint'));

    if (anchorPoint) {
      return -1 * anchorPoint.y;
    }
  }
  return 0;
};

InfoBubble.prototype.anchorPoint_changed = function() {
  this.draw();
};
InfoBubble.prototype['anchorPoint_changed'] = InfoBubble.prototype.anchorPoint_changed;


/**
 * Position the close button in the right spot.
 * @private
 */
InfoBubble.prototype.positionCloseButton_ = function() {
  var br = this.getBorderRadius_();
  var bw = this.getBorderWidth_();

  var right = 2;
  var top = 2;

  if (this.tabs_.length && this.tabHeight_) {
    top += this.tabHeight_;
  }

  top += bw;
  right += bw;

  var c = this.contentContainer_;
  if (c && c.clientHeight < c.scrollHeight) {
    // If there are scrollbars then move the cross in so it is not over
    // scrollbar
    right += 15;
  }

  this.close_.style['right'] = this.px(right);
  this.close_.style['top'] = this.px(top);
};
;
/**
 * @file
 * @author https://drupal.org/user/2210776
 * @copyright GNU GPL
 * Adds new methods to the Infobubble.prototype class.
 * Adapted from the gmap_style_bubbles module.
 * See https://drupal.org/node/2035847
 */

if (typeof InfoBubble === 'function') {
  /* First new method: bubbleBackgroundClassName allows theming of the whole
     popup bubble via css. */
  InfoBubble.prototype.setBubbleBackgroundClassName = function(className) {
    this.contentContainer_.classList.add(className);
  };
  InfoBubble.prototype['setBubbleBackgroundClassName'] =
    InfoBubble.prototype.setBubbleBackgroundClassName;

  /* Second new method: closeImage allows reference to a custom image to
     close the popup window. */
  InfoBubble.prototype.setCloseImage = function(image) {
    this.close_.src = image;
  };
  InfoBubble.prototype['setCloseImage'] =
    InfoBubble.prototype.setCloseImage;

  /* Third new method: closePosition allows you to set the position to something
     other than absolute. */
  InfoBubble.prototype.setClosePosition = function(position) {
    this.close_.style['position'] = position;
  };
  InfoBubble.prototype['setClosePosition'] =
    InfoBubble.prototype.setClosePosition;

  /* Fourth new method: closeWidth allows you to specify a custom close image width */
  InfoBubble.prototype.setCloseWidth = function(width) {
    this.close_.style['width'] = width;
  };
  InfoBubble.prototype['setCloseWidth'] =
    InfoBubble.prototype.setCloseWidth;

  /* Fifth new method: closeHeight allows you to specify a custom close image height */
  InfoBubble.prototype.setCloseHeight = function(height) {
    this.close_.style['height'] = height;
  };
  InfoBubble.prototype['setCloseHeight'] =
    InfoBubble.prototype.setCloseHeight;

  /* Sixth new method: closeBorder allows you to add a border to the close image. */
  InfoBubble.prototype.setCloseBorder = function(border) {
    this.close_.style['border'] = border;
  };
  InfoBubble.prototype['setCloseBorder'] =
    InfoBubble.prototype.setCloseBorder;

  /* Seventh new method: closeZIndex allows you to set a custom zindex for your
     close image. */
  InfoBubble.prototype.setCloseZIndex = function(zIndex) {
    this.close_.style['zIndex'] = zIndex;
  };
  InfoBubble.prototype['setCloseZIndex'] =
    InfoBubble.prototype.setCloseZIndex;

  /* Eighth new method: closeCursor allows you change what your cursor turns
     into on hovering on the close image. */
  InfoBubble.prototype.setCloseCursor = function(cursor) {
    this.close_.style['cursor'] = cursor;
  };
  InfoBubble.prototype['setCloseCursor'] =
    InfoBubble.prototype.setCloseCursor;
}
;

/**
 * @file
 * getlocations.js
 * @author Bob Hutchinson http://drupal.org/user/52366
 * @copyright GNU GPL
 *
 * Javascript functions for getlocations module for Drupal 7
 * this is for googlemaps API version 3
*/

(function ($) {

  Drupal.getlocations_inputmap = [];
  Drupal.getlocations_pano = [];
  Drupal.getlocations_data = [];
  Drupal.getlocations_markers = [];
  Drupal.getlocations_settings = [];
  Drupal.getlocations_map = [];

  // in icons.js
  Drupal.getlocations.iconSetup();

  Drupal.behaviors.getlocations = {
    attach: function(context, settings) {

      // work over all class 'getlocations_map_canvas'
      $(".getlocations_map_canvas", context).once('getlocations-map-processed', function(index, element) {
        var elemID = $(element).attr('id');
        var key = elemID.replace(/^getlocations_map_canvas_/, '');
        // is there really a map?
        if ( $("#getlocations_map_canvas_" + key).is('div') ) {

          // defaults
          var global_settings = {
            maxzoom: 16,
            minzoom: 7,
            nodezoom: 12,
            minzoom_map: -1,
            maxzoom_map: -1,
            mgr: '',
            cmgr: '',
            cmgr_gridSize: null,
            cmgr_maxZoom: null,
            cmgr_minClusterSize: null,
            cmgr_styles: '',
            cmgr_style: null,
            defaultIcon: '',
            useInfoBubble: false,
            useInfoWindow: false,
            useCustomContent: false,
            useLink: false,
            markeraction: 0,
            markeractiontype: 1,
            markeraction_click_zoom: -1,
            markeraction_click_center: 0,
            show_maplinks: false,
            show_maplinks_viewport: false,
            show_bubble_on_one_marker: false,
            infoBubbles: [],
            datanum: 0,
            batchr: []
          };

          var setting = settings.getlocations[key];
          var lat = parseFloat(setting.lat);
          var lng = parseFloat(setting.lng);

          var selzoom = parseInt(setting.zoom);
          var controltype = setting.controltype;
          var pancontrol = setting.pancontrol;
          var scale = setting.scale;
          var overview = setting.overview;
          var overview_opened = setting.overview_opened;
          var sv_show = setting.sv_show;
          var scrollw = setting.scrollwheel;
          var maptype = (setting.maptype ? setting.maptype : '');
          var baselayers = (setting.baselayers ? setting.baselayers : '');
          var map_marker = setting.map_marker;
          var poi_show = setting.poi_show;
          var transit_show = setting.transit_show;
          var pansetting = setting.pansetting;
          var draggable = setting.draggable;
          var map_styles = setting.styles;
          var map_backgroundcolor = setting.map_backgroundcolor;
          var fullscreen = (setting.fullscreen ? true : false);
          if (setting.is_mobile && setting.fullscreen_disable) {
            fullscreen = false;
          }
          var js_path = setting.js_path;
          var useOpenStreetMap = false;
          var nokeyboard = (setting.nokeyboard ? true : false);
          var nodoubleclickzoom = (setting.nodoubleclickzoom ? true : false);
          var pancontrolposition = setting.pancontrolposition;
          var mapcontrolposition = setting.mapcontrolposition;
          var zoomcontrolposition = setting.zoomcontrolposition;
          var scalecontrolposition = setting.scalecontrolposition;
          var svcontrolposition = setting.svcontrolposition;
          var fullscreen_controlposition = setting.fullscreen_controlposition;

          global_settings.info_path = setting.info_path;
          global_settings.lidinfo_path = setting.lidinfo_path;
          global_settings.preload_data = setting.preload_data;
          if (setting.preload_data) {
            global_settings.getlocations_info = Drupal.settings.getlocations_info[key];
          }
          global_settings.getdirections_link = setting.getdirections_link;

          Drupal.getlocations_markers[key] = {};
          Drupal.getlocations_markers[key].coords = {};
          Drupal.getlocations_markers[key].lids = {};
          Drupal.getlocations_markers[key].cat = {};

          global_settings.locale_prefix = (setting.locale_prefix ? setting.locale_prefix + "/" : "");
          global_settings.show_bubble_on_one_marker = (setting.show_bubble_on_one_marker ? true : false);
          global_settings.minzoom = parseInt(setting.minzoom);
          global_settings.maxzoom = parseInt(setting.maxzoom);
          global_settings.nodezoom = parseInt(setting.nodezoom);

          // highlighting
          if (setting.highlight_enable) {
            global_settings.highlight_enable = setting.highlight_enable;
            global_settings.highlight_strokecolor = setting.highlight_strokecolor;
            global_settings.highlight_strokeopacity = setting.highlight_strokeopacity;
            global_settings.highlight_strokeweight = setting.highlight_strokeweight;
            global_settings.highlight_fillcolor = setting.highlight_fillcolor;
            global_settings.highlight_fillopacity = setting.highlight_fillopacity;
            global_settings.highlight_radius = setting.highlight_radius;
          }

          if (setting.minzoom_map == -1) {
            global_settings.minzoom_map = null;
          }
          else {
            global_settings.minzoom_map = parseInt(setting.minzoom_map);
          }
          if (setting.maxzoom_map == -1) {
            global_settings.maxzoom_map = null;
          }
          else {
            global_settings.maxzoom_map = parseInt(setting.maxzoom_map);
          }

          global_settings.datanum = Drupal.getlocations_data[key].datanum;

          global_settings.markermanagertype = setting.markermanagertype;
          global_settings.pansetting = setting.pansetting;
          // mobiles
          global_settings.is_mobile = setting.is_mobile;
          global_settings.show_maplinks = setting.show_maplinks;
          global_settings.show_maplinks_viewport = (setting.show_maplinks_viewport ? true : false);
          global_settings.show_search_distance = setting.show_search_distance;

          // streetview overlay settings
          global_settings.sv_showfirst              = (setting.sv_showfirst ? true : false);
          global_settings.sv_heading                = setting.sv_heading;
          global_settings.sv_zoom                   = setting.sv_zoom;
          global_settings.sv_pitch                  = setting.sv_pitch;
          global_settings.sv_addresscontrol         = (setting.sv_addresscontrol ? true : false);
          global_settings.sv_addresscontrolposition = setting.sv_addresscontrolposition;
          global_settings.sv_pancontrol             = (setting.sv_pancontrol ? true : false);
          global_settings.sv_pancontrolposition     = setting.sv_pancontrolposition;
          global_settings.sv_zoomcontrol            = setting.sv_zoomcontrol;
          global_settings.sv_zoomcontrolposition    = setting.sv_zoomcontrolposition;
          global_settings.sv_linkscontrol           = (setting.sv_linkscontrol ? true : false);
          global_settings.sv_imagedatecontrol       = (setting.sv_imagedatecontrol ? true : false);
          global_settings.sv_scrollwheel            = (setting.sv_scrollwheel ? true : false);
          global_settings.sv_clicktogo              = (setting.sv_clicktogo ? true : false);

          // prevent old msie from running markermanager
          var ver = Drupal.getlocations.msiedetect();
          var pushit = false;
          if ( (ver == '') || (ver && ver > 8)) {
            pushit = true;
          }

          if (pushit && setting.markermanagertype == 1 && setting.usemarkermanager) {
            global_settings.usemarkermanager = true;
            global_settings.useclustermanager = false;
          }
          else if (pushit && setting.markermanagertype == 2 && setting.useclustermanager == 1) {
            global_settings.cmgr_styles = Drupal.settings.getlocations_markerclusterer;
            global_settings.cmgr_style = (setting.markerclusterer_style == -1 ? null : setting.markerclusterer_style);
            global_settings.cmgr_gridSize = (setting.markerclusterer_size == -1 ? null : parseInt(setting.markerclusterer_size));
            global_settings.cmgr_maxZoom = (setting.markerclusterer_zoom == -1 ? null : parseInt(setting.markerclusterer_zoom));
            global_settings.cmgr_minClusterSize = (setting.markerclusterer_minsize == -1 ? null : parseInt(setting.markerclusterer_minsize));
            global_settings.cmgr_title = setting.markerclusterer_title;
            global_settings.cmgr_imgpath = setting.markerclusterer_imgpath;
            global_settings.useclustermanager = true;
            global_settings.usemarkermanager = false;
          }
          else {
            global_settings.usemarkermanager = false;
            global_settings.useclustermanager = false;
          }

          global_settings.markeraction = setting.markeraction;
          global_settings.markeractiontype = 'click';
          if (setting.markeractiontype == 2) {
            global_settings.markeractiontype = 'mouseover';
          }

          if (global_settings.markeraction == 1) {
            global_settings.useInfoWindow = true;
          }

          else if (global_settings.markeraction == 2) {
            global_settings.useInfoBubble = true;
          }
          else if (global_settings.markeraction == 3) {
            global_settings.useLink = true;
          }
          global_settings.markeraction_click_zoom = setting.markeraction_click_zoom;
          global_settings.markeraction_click_center = setting.markeraction_click_center;

          if((global_settings.useInfoWindow || global_settings.useInfoBubble) && setting.custom_content_enable == 1) {
            global_settings.useCustomContent = true;
          }
          global_settings.defaultIcon = Drupal.getlocations.getIcon(map_marker);

          // each map has its own data so when a map is replaced by ajax the new data is too.
          global_settings.latlons = (Drupal.getlocations_data[key].latlons ? Drupal.getlocations_data[key].latlons : '');

          // map type
          var maptypes = [];
          if (maptype) {
            if (maptype == 'Map' && baselayers.Map) { maptype = google.maps.MapTypeId.ROADMAP; }
            else if (maptype == 'Satellite' && baselayers.Satellite) { maptype = google.maps.MapTypeId.SATELLITE; }
            else if (maptype == 'Hybrid' && baselayers.Hybrid) { maptype = google.maps.MapTypeId.HYBRID; }
            else if (maptype == 'Physical' && baselayers.Physical) { maptype = google.maps.MapTypeId.TERRAIN; }

            if (baselayers.Map) { maptypes.push(google.maps.MapTypeId.ROADMAP); }
            if (baselayers.Satellite) { maptypes.push(google.maps.MapTypeId.SATELLITE); }
            if (baselayers.Hybrid) { maptypes.push(google.maps.MapTypeId.HYBRID); }
            if (baselayers.Physical) { maptypes.push(google.maps.MapTypeId.TERRAIN); }

            var copyrightNode = document.createElement('div');
            copyrightNode.id = 'copyright-control';
            copyrightNode.style.fontSize = '11px';
            copyrightNode.style.fontFamily = 'Arial, sans-serif';
            copyrightNode.style.margin = '0 2px 2px 0';
            copyrightNode.style.whiteSpace = 'nowrap';

            var baselayer_keys = new Array();
            for(var bl_key in baselayers) {
              baselayer_keys[baselayer_keys.length] = bl_key;
            }
            for (var c = 0; c < baselayer_keys.length; c++) {
              var bl_key = baselayer_keys[c];
              if ( bl_key != 'Map' && bl_key != 'Satellite' && bl_key != 'Hybrid' && bl_key != 'Physical') {
                // do stuff
                if (baselayers[bl_key]) {
                  maptypes.push(bl_key);
                  useOpenStreetMap = true;
                }
              }
            }
          }
          else {
            maptype = google.maps.MapTypeId.ROADMAP;
            maptypes.push(google.maps.MapTypeId.ROADMAP);
            maptypes.push(google.maps.MapTypeId.SATELLITE);
            maptypes.push(google.maps.MapTypeId.HYBRID);
            maptypes.push(google.maps.MapTypeId.TERRAIN);
          }
          // map styling
          var styles_array = [];
          if (map_styles) {
            try {
              styles_array = eval(map_styles);
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.log(e.message);
                // Error on parsing string. Using default.
                styles_array = [];
              }
            }
          }

          // Merge styles with our settings.
          var styles = styles_array.concat([
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: (poi_show ? 'on' : 'off') }] },
            { featureType: "transit", elementType: "labels", stylers: [{ visibility: (transit_show ? 'on' : 'off') }] }
          ]);

          var controlpositions = [];
          controlpositions['tl'] = google.maps.ControlPosition.TOP_LEFT;
          controlpositions['tc'] = google.maps.ControlPosition.TOP_CENTER;
          controlpositions['tr'] = google.maps.ControlPosition.TOP_RIGHT;
          controlpositions['rt'] = google.maps.ControlPosition.RIGHT_TOP;
          controlpositions['rc'] = google.maps.ControlPosition.RIGHT_CENTER;
          controlpositions['rb'] = google.maps.ControlPosition.RIGHT_BOTTOM;
          controlpositions['br'] = google.maps.ControlPosition.BOTTOM_RIGHT;
          controlpositions['bc'] = google.maps.ControlPosition.BOTTOM_CENTER;
          controlpositions['bl'] = google.maps.ControlPosition.BOTTOM_LEFT;
          controlpositions['lb'] = google.maps.ControlPosition.LEFT_BOTTOM;
          controlpositions['lc'] = google.maps.ControlPosition.LEFT_CENTER;
          controlpositions['lt'] = google.maps.ControlPosition.LEFT_TOP;
          global_settings.controlpositions = controlpositions;

          var mapOpts = {
            zoom: selzoom,
            minZoom: global_settings.minzoom_map,
            maxZoom: global_settings.maxzoom_map,
            center: new google.maps.LatLng(lat, lng),
            mapTypeId: maptype,
            scrollwheel: (scrollw ? true : false),
            draggable: (draggable ? true : false),
            styles: styles,
            overviewMapControl: (overview ? true : false),
            overviewMapControlOptions: {opened: (overview_opened ? true : false)},
            keyboardShortcuts: (nokeyboard ? false : true),
            disableDoubleClickZoom: nodoubleclickzoom
          };
          if (map_backgroundcolor) {
            mapOpts.backgroundColor = map_backgroundcolor;
          }
          // zoom control
          if (controltype == 'none') {
            mapOpts.zoomControl = false;
          }
          else {
            mapOpts.zoomControl = true;
            var zco = {};
            if (zoomcontrolposition) {
              zco.position = controlpositions[zoomcontrolposition];
            }
            if (controltype == 'small') {
              zco.style = google.maps.ZoomControlStyle.SMALL;
            }
            else if (controltype == 'large') {
              zco.style = google.maps.ZoomControlStyle.LARGE;
            }
            if (zco) {
              mapOpts.zoomControlOptions = zco;
            }
          }

          // pancontrol
          if (pancontrol) {
            mapOpts.panControl = true;
            if (pancontrolposition) {
              mapOpts.panControlOptions = {position: controlpositions[pancontrolposition]};
            }
          }
          else {
            mapOpts.panControl = false;
          }

          // map control
          if (setting.mtc == 'none') {
            mapOpts.mapTypeControl = false;
          }
          else {
            mapOpts.mapTypeControl = true;
            var mco = {};
            mco.mapTypeIds = maptypes;
            if (setting.mtc == 'standard') {
              mco.style = google.maps.MapTypeControlStyle.HORIZONTAL_BAR;
            }
            else if (setting.mtc == 'menu') {
              mco.style = google.maps.MapTypeControlStyle.DROPDOWN_MENU;
            }
            if (mapcontrolposition) {
              mco.position = controlpositions[mapcontrolposition];
            }
            mapOpts.mapTypeControlOptions = mco;
          }

          // scale control
          if (scale) {
            mapOpts.scaleControl = true;
            if (scalecontrolposition) {
              mapOpts.ScaleControlOptions = {position: controlpositions[scalecontrolposition]};
            }
          }
          else {
            mapOpts.scaleControl = false;
          }

          // pegman
          if (sv_show) {
            mapOpts.streetViewControl = true;
            if (svcontrolposition) {
              mapOpts.StreetViewControlOptions = {position: controlpositions[svcontrolposition]};
            }
          }
          else {
            mapOpts.streetViewControl = false;
          }

          // google_old_controlstyle
          if (setting.google_old_controlstyle) {
            google.maps.controlStyle = 'azteca';
          }

          // make the map
          Drupal.getlocations_map[key] = new google.maps.Map(document.getElementById("getlocations_map_canvas_" + key), mapOpts);
          // another way
          // Drupal.getlocations_map[key] = new google.maps.Map($(element).get(0), mapOpts);

          // other maps
          // OpenStreetMap
          if (useOpenStreetMap) {
            for (var c = 0; c < baselayer_keys.length; c++) {
              var bl_key = baselayer_keys[c];
              if ( bl_key != 'Map' && bl_key != 'Satellite' && bl_key != 'Hybrid' && bl_key != 'Physical') {
                if (baselayers[bl_key] ) {
                  setupNewMap(key, bl_key);
                }
              }
            }
            google.maps.event.addListener(Drupal.getlocations_map[key], 'maptypeid_changed', updateAttribs);
            Drupal.getlocations_map[key].controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(copyrightNode);
          }

          // input map
          if (setting.inputmap) {
            Drupal.getlocations_inputmap[key] = Drupal.getlocations_map[key];
          }

          // set up markermanager
          if (global_settings.usemarkermanager) {
            global_settings.mgr = new MarkerManager(Drupal.getlocations_map[key], {
              borderPadding: 50,
              maxZoom: global_settings.maxzoom,
              trackMarkers: false
            });
          }
          else if (global_settings.useclustermanager) {
            var cmgr_settings = {
              gridSize: global_settings.cmgr_gridSize,
              maxZoom: global_settings.cmgr_maxZoom,
              styles: global_settings.cmgr_styles[global_settings.cmgr_style],
              minimumClusterSize: global_settings.cmgr_minClusterSize,
              title: global_settings.cmgr_title
            };
            if (global_settings.cmgr_imgpath) {
              cmgr_settings.imagePath = global_settings.cmgr_imgpath + '/m';
            }
            global_settings.cmgr = new MarkerClusterer(
              Drupal.getlocations_map[key],
              [],
              cmgr_settings
            );
          }

          // KML
          if (setting.kml_url) {
            var kmlLayer = {};
            var kmlLayertoggleState = [];
            kmlLayer[key] = new google.maps.KmlLayer({
              url: setting.kml_url,
              preserveViewport: (setting.kml_url_viewport ? true : false),
              clickable: (setting.kml_url_click ? true : false),
              suppressInfoWindows: (setting.kml_url_infowindow ? true : false)
            });
            if (setting.kml_url_button_state > 0) {
              kmlLayer[key].setMap(Drupal.getlocations_map[key]);
              kmlLayertoggleState[key] = true;
            }
            else {
              kmlLayer[key].setMap(null);
              kmlLayertoggleState[key] = false;
            }
            $("#getlocations_toggleKmlLayer_" + key).click( function() {
              var label = '';
              l = (setting.kml_url_button_label ? setting.kml_url_button_label : Drupal.t('Kml Layer'));
              if (kmlLayertoggleState[key]) {
                kmlLayer[key].setMap(null);
                kmlLayertoggleState[key] = false;
                label = l + ' ' + Drupal.t('On');
              }
              else {
                kmlLayer[key].setMap(Drupal.getlocations_map[key]);
                kmlLayertoggleState[key] = true;
                label = l + ' ' + Drupal.t('Off');
              }
              $(this).val(label);
            });
          }

          // Traffic Layer
          if (setting.trafficinfo) {
            var trafficInfo = {};
            var traffictoggleState = [];
            trafficInfo[key] = new google.maps.TrafficLayer();
            if (setting.trafficinfo_state > 0) {
              trafficInfo[key].setMap(Drupal.getlocations_map[key]);
              traffictoggleState[key] = true;
            }
            else {
              trafficInfo[key].setMap(null);
              traffictoggleState[key] = false;
            }
            $("#getlocations_toggleTraffic_" + key).click( function() {
              var label = '';
              if (traffictoggleState[key]) {
                trafficInfo[key].setMap(null);
                traffictoggleState[key] = false;
                label = Drupal.t('Traffic Info On');
              }
              else {
                trafficInfo[key].setMap(Drupal.getlocations_map[key]);
                traffictoggleState[key] = true;
                label = Drupal.t('Traffic Info Off');
              }
              $(this).val(label);
            });
          }

          // Bicycling Layer
          if (setting.bicycleinfo) {
            var bicycleInfo = {};
            var bicycletoggleState =  [];
            bicycleInfo[key] = new google.maps.BicyclingLayer();
            if (setting.bicycleinfo_state > 0) {
              bicycleInfo[key].setMap(Drupal.getlocations_map[key]);
              bicycletoggleState[key] = true;
            }
            else {
              bicycleInfo[key].setMap(null);
              bicycletoggleState[key] = false;
            }
            $("#getlocations_toggleBicycle_" + key).click( function() {
              var label = '';
              if (bicycletoggleState[key]) {
                bicycleInfo[key].setMap(null);
                bicycletoggleState[key] = false;
                label = Drupal.t('Bicycle Info On');
              }
              else {
                bicycleInfo[key].setMap(Drupal.getlocations_map[key]);
                bicycletoggleState[key] = true;
                label = Drupal.t('Bicycle Info Off');
              }
              $(this).val(label);
            });
          }

          // Transit Layer
          if (setting.transitinfo) {
            var transitInfo = {};
            var transittoggleState = [];
            transitInfo[key] = new google.maps.TransitLayer();
            if (setting.transitinfo_state > 0) {
              transitInfo[key].setMap(Drupal.getlocations_map[key]);
              transittoggleState[key] = true;
            }
            else {
              transitInfo[key].setMap(null);
              transittoggleState[key] = false;
            }
            $("#getlocations_toggleTransit_" + key).click( function() {
              var label = '';
              if (transittoggleState[key]) {
                transitInfo[key].setMap(null);
                transittoggleState[key] = false;
                label = Drupal.t('Transit Info On');
              }
              else {
                transitInfo[key].setMap(Drupal.getlocations_map[key]);
                transittoggleState[key] = true;
                label = Drupal.t('Transit Info Off');
              }
              $(this).val(label);
            });
          }

          // Panoramio Layer
          if (setting.panoramio_use && setting.panoramio_show) {
            var panoramioLayer = {};
            var panoramiotoggleState = [];
            panoramioLayer[key] = new google.maps.panoramio.PanoramioLayer();
            if (setting.panoramio_state > 0) {
              panoramioLayer[key].setMap(Drupal.getlocations_map[key]);
              panoramiotoggleState[key] = true;
            }
            else {
              panoramioLayer[key].setMap(null);
              panoramiotoggleState[key] = false;
            }
            $("#getlocations_togglePanoramio_" + key).click( function() {
              var label = '';
              if (panoramiotoggleState[key]) {
                panoramioLayer[key].setMap(null);
                panoramiotoggleState[key] = false;
                label = Drupal.t('Panoramio On');
              }
              else {
                panoramioLayer[key].setMap(Drupal.getlocations_map[key]);
                panoramiotoggleState[key] = true;
                label = Drupal.t('Panoramio Off');
              }
              $(this).val(label);
            });
          }

          // Weather Layer
          if (setting.weather_use) {
            if (setting.weather_show) {
              var weatherLayer = {};
              var weathertoggleState = {};
              tu = google.maps.weather.TemperatureUnit.CELSIUS;
              if (setting.weather_temp == 2) {
                tu = google.maps.weather.TemperatureUnit.FAHRENHEIT;
              }
              sp = google.maps.weather.WindSpeedUnit.KILOMETERS_PER_HOUR;
              if (setting.weather_speed == 2) {
                sp = google.maps.weather.WindSpeedUnit.METERS_PER_SECOND;
              }
              else if (setting.weather_speed == 3) {
                sp = google.maps.weather.WindSpeedUnit.MILES_PER_HOUR;
              }
              var weatherOpts =  {
                temperatureUnits: tu,
                windSpeedUnits: sp,
                clickable: (setting.weather_clickable ? true : false),
                suppressInfoWindows: (setting.weather_info ? false : true)
              };
              if (setting.weather_label > 0) {
                weatherOpts.labelColor = google.maps.weather.LabelColor.BLACK;
                if (setting.weather_label == 2) {
                  weatherOpts.labelColor = google.maps.weather.LabelColor.WHITE;
                }
              }
              weatherLayer[key] = new google.maps.weather.WeatherLayer(weatherOpts);
              if (setting.weather_state > 0) {
                weatherLayer[key].setMap(Drupal.getlocations_map[key]);
                weathertoggleState[key] = true;
              }
              else {
                weatherLayer[key].setMap(null);
                weathertoggleState[key] = false;
              }
              $("#getlocations_toggleWeather_" + key).click( function() {
                var label = '';
                if (weathertoggleState[key]) {
                  weatherLayer[key].setMap(null);
                  weathertoggleState[key] = false;
                  label = Drupal.t('Weather On');
                }
                else {
                  weatherLayer[key].setMap(Drupal.getlocations_map[key]);
                  weathertoggleState[key] = true;
                  label = Drupal.t('Weather Off');
                }
                $(this).val(label);
              });
            }
            if (setting.weather_cloud) {
              var cloudLayer = {};
              var cloudtoggleState = [];
              cloudLayer[key] = new google.maps.weather.CloudLayer();
              if (setting.weather_cloud_state > 0) {
                cloudLayer[key].setMap(Drupal.getlocations_map[key]);
                cloudtoggleState[key] = true;
              }
              else {
                cloudLayer[key].setMap(null);
                cloudtoggleState[key] = false;
              }
              $("#getlocations_toggleCloud_" + key).click( function() {
                var label = '';
                if (cloudtoggleState[key] == 1) {
                  cloudLayer[key].setMap(null);
                  cloudtoggleState[key] = false;
                  label = Drupal.t('Clouds On');
                }
                else {
                  cloudLayer[key].setMap(Drupal.getlocations_map[key]);
                  cloudtoggleState[key] = true;
                  label = Drupal.t('Clouds Off');
                }
                $(this).val(label);
              });
            }
          }

          // exporting global_settings to Drupal.getlocations_settings
          Drupal.getlocations_settings[key] = global_settings;

          // markers and bounding
          if (! setting.inputmap && ! setting.extcontrol) {

            doAllMarkers(Drupal.getlocations_map[key], global_settings, key);

            if (global_settings.show_maplinks && global_settings.show_maplinks_viewport && (global_settings.useInfoWindow || global_settings.useInfoBubble || global_settings.useLink)) {
              google.maps.event.addListener(Drupal.getlocations_map[key], 'bounds_changed', function() {
                var b = Drupal.getlocations_map[key].getBounds();
                for (var i = 0; i < Drupal.getlocations_data[key].latlons.length; i++) {
                  var a = Drupal.getlocations_data[key].latlons[i];
                  var lat = a[0];
                  var lon = a[1];
                  var lid = a[2];
                  var p = new google.maps.LatLng(lat, lon);
                  // is this point within the bounds?
                  if (b.contains(p)) {
                    // hide and show the links for markers in the current viewport
                    $("li a.lid-" + lid).show();
                  }
                  else {
                    $("li a.lid-" + lid).hide();
                  }
                }
              });
            }

            // Bounding
            Drupal.getlocations.redoMap(key);

          }

          // fullscreen
          if (fullscreen) {
            var fsdiv = '';
            $(document).keydown( function(kc) {
              var cd = (kc.keyCode ? kc.keyCode : kc.which);
              if(cd == 27){
                if($("body").hasClass("fullscreen-body-" + key)){
                  toggleFullScreen();
                }
              }
            });
            var fsdoc = document.createElement("DIV");
            var fs = new FullScreenControl(fsdoc);
            fsdoc.index = 0;
            var fs_p = controlpositions['tr'];
            if (fullscreen_controlposition) {
              var fs_p = controlpositions[fullscreen_controlposition];
            }
            Drupal.getlocations_map[key].controls[fs_p].setAt(0, fsdoc);
          }

          // search_places in getlocations_search_places.js
          if (setting.search_places && $.isFunction(Drupal.getlocations_search_places)) {
            Drupal.getlocations_search_places(key);
          }

          //geojson in getlocations_geojson.js
          if (setting.geojson_enable && setting.geojson_data && $.isFunction(Drupal.getlocations_geojson)) {
            Drupal.getlocations_geojson(key);
          }

        } // end is there really a map?

        // functions
        function FullScreenControl(fsd) {
          fsd.style.margin = "5px";
          fsd.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.4)";
          fsdiv = document.createElement("DIV");
          fsdiv.style.height = "22px";
          fsdiv.style.backgroundColor = "white";
          fsdiv.style.borderColor = "#717B87";
          fsdiv.style.borderStyle = "solid";
          fsdiv.style.borderWidth = "1px";
          fsdiv.style.cursor = "pointer";
          fsdiv.style.textAlign = "center";
          fsdiv.title = Drupal.t('Full screen');
          fsdiv.innerHTML = '<img id="btnFullScreen" src="' + js_path + 'images/fs-map-full.png"/>';
          fsd.appendChild(fsdiv);
          google.maps.event.addDomListener(fsdiv, "click", function() {
            toggleFullScreen();
          });
        }

        function toggleFullScreen() {
          var cnt = Drupal.getlocations_map[key].getCenter();
          $("#getlocations_map_wrapper_" + key).toggleClass("fullscreen");
          $("html,body").toggleClass("fullscreen-body-" + key);
          $(document).scrollTop(0);
          google.maps.event.trigger(Drupal.getlocations_map[key], "resize");
          Drupal.getlocations_map[key].setCenter(cnt);
          setTimeout( function() {
            if($("#getlocations_map_wrapper_" + key).hasClass("fullscreen")) {
              $("#btnFullScreen").attr("src", js_path + 'images/fs-map-normal.png');
              fsdiv.title = Drupal.t('Normal screen');
            }
            else {
              $("#btnFullScreen").attr("src", js_path + 'images/fs-map-full.png');
              fsdiv.title = Drupal.t('Full screen');
            }
          },200);
        }

        function doAllMarkers(map, gs, mkey) {

          var arr = gs.latlons;
          for (var i = 0; i < arr.length; i++) {
            var arr2 = arr[i];
            if (arr2.length < 2) {
              return;
            }
            var lat = arr2[0];
            var lon = arr2[1];
            var lid = arr2[2];
            var name = arr2[3];
            var mark = arr2[4];
            var lidkey = arr2[5];
            var customContent = arr2[6];
            var cat = arr2[7];

            if (mark === '') {
              gs.markdone = gs.defaultIcon;
            }
            else {
              gs.markdone = Drupal.getlocations.getIcon(mark);
            }
            var m = Drupal.getlocations.makeMarker(map, gs, lat, lon, lid, name, lidkey, customContent, cat, mkey);
            // still experimental
            Drupal.getlocations_markers[mkey].lids[lid] = m;
            if (gs.usemarkermanager || gs.useclustermanager) {
              gs.batchr.push(m);
            }
          }
          // add batchr
          if (gs.usemarkermanager) {
           gs.mgr.addMarkers(gs.batchr, gs.minzoom, gs.maxzoom);
            gs.mgr.refresh();
          }
          else if (gs.useclustermanager) {
            gs.cmgr.addMarkers(gs.batchr, 0);
          }
        }

        function updateCopyrights(attrib) {
          if (attrib) {
            copyrightNode.innerHTML = attrib;
            if (setting.trafficinfo) {
              $("#getlocations_toggleTraffic_" + key).attr('disabled', true);
            }
            if (setting.bicycleinfo) {
              $("#getlocations_toggleBicycle_" + key).attr('disabled', true);
            }
            if (setting.transitinfo) {
              $("#getlocations_toggleTransit_" + key).attr('disabled', true);
            }
          }
          else {
            copyrightNode.innerHTML = "";
            if (setting.trafficinfo) {
              $("#getlocations_toggleTraffic_" + key).attr('disabled', false);
            }
            if (setting.bicycleinfo) {
              $("#getlocations_toggleBicycle_" + key).attr('disabled', false);
            }
            if (setting.transitinfo) {
              $("#getlocations_toggleTransit_" + key).attr('disabled', false);
            }
          }
        }

        function setupNewMap(k, blk) {
          if (setting.baselayer_settings != undefined) {
            if (setting.baselayer_settings[blk] != undefined) {
              var tle = setting.baselayer_settings[blk].title;
              if (setting.mtc == 'menu') {
                tle = setting.baselayer_settings[blk].short_title;
              }
              var tilesize = parseInt(setting.baselayer_settings[blk].tilesize);
              var url_template = setting.baselayer_settings[blk].url;
              Drupal.getlocations_map[k].mapTypes.set(blk, new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                  var url = '';
                  if (url_template) {
                    url = url_template.replace(/__Z__/, zoom).replace(/__X__/, coord.x).replace(/__Y__/, coord.y);
                  }
                  return url;
                },
                tileSize: new google.maps.Size(tilesize, tilesize),
                name: tle,
                minZoom: parseInt(setting.baselayer_settings[blk].minzoom),
                maxZoom: parseInt(setting.baselayer_settings[blk].maxzoom)
              }));
            }
          }
        }

        function updateAttribs() {
          var blk = Drupal.getlocations_map[key].getMapTypeId();
          for (var c = 0; c < baselayer_keys.length; c++) {
            var bl_key = baselayer_keys[c];
            if ( bl_key != 'Map' && bl_key != 'Satellite' && bl_key != 'Hybrid' && bl_key != 'Physical') {
              if ( bl_key == blk ) {
                var attrib = setting.baselayer_settings[blk].attribution;
                if (attrib) {
                  updateCopyrights(attrib);
                }
              }
            }
            else {
              updateCopyrights('');
            }
          }
        }

        // end functions

      }); // end once
    } // end attach
  }; // end behaviors

  // external functions
  Drupal.getlocations.makeMarker = function(map, gs, lat, lon, lid, title, lidkey, customContent, cat, mkey) {

    //if (! gs.markdone) {
    //  return;
    //}

    // categories
    if (cat) {
      Drupal.getlocations_markers[mkey].cat[lid] = cat;
    }

    // check for duplicates
    var hash = new String(lat + lon);
    if (Drupal.getlocations_markers[mkey].coords[hash] == null) {
      Drupal.getlocations_markers[mkey].coords[hash] = 1;
    }
    else {
      // we have a duplicate
      // 10000 constrains the max, 0.0001 constrains the min distance
      m1 = (Math.random() /10000) + 0.0001;
      // randomise the operator
      m2 = Math.random();
      if (m2 > 0.5) {
        lat = parseFloat(lat) + m1;
      }
      else {
        lat = parseFloat(lat) - m1;
      }
      m1 = (Math.random() /10000) + 0.0001;
      m2 = Math.random();
      if (m2 > 0.5) {
        lon = parseFloat(lon) + m1;
      }
      else {
        lon = parseFloat(lon) - m1;
      }
    }

    // relocate function
    var get_winlocation = function(gs, lid, lidkey) {
      if (gs.preload_data) {
        arr = gs.getlocations_info;
        for (var i = 0; i < arr.length; i++) {
          data = arr[i];
          if (lid == data.lid && lidkey == data.lidkey && data.content) {
            window.location = data.content;
          }
        }
      }
      else {
        // fetch link and relocate
        $.get(gs.lidinfo_path, {'lid': lid, 'key': lidkey}, function(data) {
          if (data.content) {
            window.location = data.content;
          }
        });
      }
    };

    var mouseoverTimeoutId = null;
    var mouseoverTimeout = (gs.markeractiontype == 'mouseover' ? 300 : 0);
    var p = new google.maps.LatLng(lat, lon);
    var m = new google.maps.Marker({
      icon: gs.markdone.image,
      shadow: gs.markdone.shadow,
      shape: gs.markdone.shape,
      map: map,
      position: p,
      title: title,
      clickable: (gs.markeraction > 0 ? true : false),
      optimized: false
    });

    if (gs.markeraction > 0) {
      google.maps.event.addListener(m, gs.markeractiontype, function() {
        mouseoverTimeoutId = setTimeout(function() {
          if (gs.useLink) {
            // relocate
            get_winlocation(gs, lid, lidkey);
          }
          else {
            if(gs.useCustomContent) {
              var cc = [];
              cc.content = customContent;
              Drupal.getlocations.showPopup(map, m, gs, cc, mkey);
            }
            else {
              // fetch bubble content
              if (gs.preload_data) {
                arr = gs.getlocations_info;
                for (var i = 0; i < arr.length; i++) {
                  data = arr[i];
                  if (lid == data.lid && lidkey == data.lidkey && data.content) {
                    Drupal.getlocations.showPopup(map, m, gs, data, mkey);
                  }
                }
              }
              else {
                var qs = {};
                qs.lid = lid;
                qs.key = lidkey;
                qs.gdlink = gs.getdirections_link;
                var slat = false;
                var slon = false;
                var sunit = false;
                if (gs.show_distance) {
                  // getlocations_search module
                  if ($("#getlocations_search_slat_" + mkey).is('div')) {
                    var slat = $("#getlocations_search_slat_" + mkey).html();
                    var slon = $("#getlocations_search_slon_" + mkey).html();
                    var sunit = $("#getlocations_search_sunit_" + mkey).html();
                  }
                }
                else if (gs.show_search_distance) {
                  // getlocations_fields distance views filter and field
                  if ($("#getlocations_fields_search_views_search_wrapper_" + mkey).is('div')) {
                    var slat = $("#getlocations_fields_search_views_search_latitude_" + mkey).html();
                    var slon = $("#getlocations_fields_search_views_search_longitude_" + mkey).html();
                    var sunit = $("#getlocations_fields_search_views_search_units_" + mkey).html();
                  }
                }
                if (slat && slon) {
                  qs.sdist = sunit + '|' + slat + '|' + slon;
                }

                $.get(gs.info_path, qs, function(data) {
                  Drupal.getlocations.showPopup(map, m, gs, data, mkey);
                });
              }
            }

            if (gs.markeraction_click_center) {
              var mp = m.getPosition();
              if (gs.markeraction_click_center == 1) {
                map.setCenter(mp);
              }
              else {
                map.panTo(mp);
              }
            }
            if (gs.markeraction_click_zoom > -1) {
              map.setZoom(parseInt(gs.markeraction_click_zoom));
            }

          }
        }, mouseoverTimeout);
      });
      google.maps.event.addListener(m,'mouseout', function() {
        if(mouseoverTimeoutId) {
          clearTimeout(mouseoverTimeoutId);
          mouseoverTimeoutId = null;
        }
      });

    }

    // highlighting
    if (gs.markeractiontype != 'mouseover' && gs.highlight_enable) {
      var conv = [];
      var temp = 0.5;
      for (var c = 21; c > 0; c--) {
        temp += temp;
        conv[c] = temp;
      }
      var circOpts = {
        strokeColor: gs.highlight_strokecolor,
        strokeOpacity: gs.highlight_strokeopacity,
        strokeWeight: gs.highlight_strokeweight,
        fillColor: gs.highlight_fillcolor,
        fillOpacity: gs.highlight_fillopacity,
        radius: parseInt(gs.highlight_radius),
        center: p,
        map: map,
        visible: false,
        clickable: false
      };
      var circ =  new google.maps.Circle(circOpts);
      google.maps.event.addListener(m,'mouseover', function() {
        circ.setRadius(parseInt(gs.highlight_radius * conv[map.getZoom()] * 0.1));
        circ.setVisible(true);
      });
      google.maps.event.addListener(m,'mouseout', function() {
        circ.setVisible(false);
      });
    }

    // we only have one marker
    if (gs.datanum == 1) {
      if (gs.pansetting > 0) {
        map.setCenter(p);
        map.setZoom(gs.nodezoom);
      }
      // show_bubble_on_one_marker
      if (gs.show_bubble_on_one_marker && (gs.useInfoWindow || gs.useInfoBubble)) {
        google.maps.event.trigger(m, 'click');
      }
      // streetview first feature
      if (gs.sv_showfirst) {
        var popt = {
          position: p,
          pov: {
            heading: parseInt(gs.sv_heading),
            pitch: parseInt(gs.sv_pitch)
          },
          enableCloseButton: true,
          zoom: parseInt(gs.sv_zoom)
        };

        if (gs.sv_addresscontrol) {
          popt.addressControl = true;
          if (gs.sv_addresscontrolposition) {
            popt.addressControlOptions = {position: gs.controlpositions[gs.sv_addresscontrolposition]};
          }
        }
        else {
          popt.addressControl = false;
        }
        if (gs.sv_pancontrol) {
          popt.panControl = true;
          if (gs.sv_pancontrolposition) {
            popt.panControlOptions = {position: gs.controlpositions[gs.sv_pancontrolposition]};
          }
        }
        else {
          popt.panControl = false;
        }
        if (gs.sv_zoomcontrol == 'none') {
          popt.zoomControl = false;
        }
        else {
          popt.zoomControl = true;
          var zco = {};
          if (gs.sv_zoomcontrolposition) {
            zco.position = gs.controlpositions[gs.sv_zoomcontrolposition];
          }
          if (gs.sv_zoomcontrol == 'small') {
            zco.style = google.maps.ZoomControlStyle.SMALL;
          }
          else if (gs.sv_zoomcontrol == 'large') {
            zco.style = google.maps.ZoomControlStyle.LARGE;
          }
          if (zco) {
            popt.zoomControlOptions = zco;
          }
        }
        if (! gs.sv_linkscontrol) {
          popt.linksControl = false;
        }
        if (gs.sv_imagedatecontrol) {
          popt.imageDateControl = true;
        }
        else {
          popt.imageDateControl = false;
        }
        if (! gs.sv_scrollwheel) {
          popt.scrollwheel = false;
        }
        if (! gs.sv_clicktogo) {
          popt.clickToGo = false;
        }

        Drupal.getlocations_pano[mkey] = new google.maps.StreetViewPanorama(document.getElementById("getlocations_map_canvas_" + mkey), popt);
        Drupal.getlocations_pano[mkey].setVisible(true);
      }
    }

    // show_maplinks
    if (gs.show_maplinks && (gs.useInfoWindow || gs.useInfoBubble || gs.useLink)) {
      // add link
      $("div#getlocations_map_links_" + mkey + " ul").append('<li><a href="#maptop_' + mkey + '" class="lid-' + lid + '">' + title + '</a></li>');
      // Add listener
      $("div#getlocations_map_links_" + mkey + " a.lid-" + lid).click(function(){
        $("div#getlocations_map_links_" + mkey + " a").removeClass('active');
        $("div#getlocations_map_links_" + mkey + " a.lid-" + lid).addClass('active');
        if (gs.useLink) {
          // relocate
          get_winlocation(gs, lid, lidkey);
        }
        else {
          // emulate
          google.maps.event.trigger(m, 'click');
        }
      });
    }
    return m;

  };

  Drupal.getlocations.showPopup = function(map, m, gs, data, key) {
    var ver = Drupal.getlocations.msiedetect();
    var pushit = false;
    if ( (ver == '') || (ver && ver > 8)) {
      pushit = true;
    }

    if (pushit) {
      // close any previous instances
      for (var i in Drupal.getlocations_settings[key].infoBubbles) {
        Drupal.getlocations_settings[key].infoBubbles[i].close();
      }
    }

    if (gs.useInfoBubble) {
      if (typeof(infoBubbleOptions) == 'object') {
        var infoBubbleOpts = infoBubbleOptions;
      }
      else {
        var infoBubbleOpts = {};
      }
      infoBubbleOpts.content = data.content;
      var infoBubble = new InfoBubble(infoBubbleOpts);
      infoBubble.open(map, m);
      if (pushit) {
        // add to the array
        Drupal.getlocations_settings[key].infoBubbles.push(infoBubble);
      }
    }
    else {
      if (typeof(infoWindowOptions) == 'object') {
        var infoWindowOpts = infoWindowOptions;
      }
      else {
        var infoWindowOpts = {};
      }
      infoWindowOpts.content = data.content;
      var infowindow = new google.maps.InfoWindow(infoWindowOpts);
      infowindow.open(map, m);
      if (pushit) {
        // add to the array
        Drupal.getlocations_settings[key].infoBubbles.push(infowindow);
      }
    }
  };

  Drupal.getlocations.doBounds = function(map, minlat, minlon, maxlat, maxlon, dopan) {
    if (minlat !== '' && minlon !== '' && maxlat !== '' && maxlon !== '') {
      // Bounding
      var minpoint = new google.maps.LatLng(parseFloat(minlat), parseFloat(minlon));
      var maxpoint = new google.maps.LatLng(parseFloat(maxlat), parseFloat(maxlon));
      var bounds = new google.maps.LatLngBounds(minpoint, maxpoint);
      if (dopan) {
        map.panToBounds(bounds);
      }
      else {
        map.fitBounds(bounds);
      }
    }
  };

  Drupal.getlocations.redoMap = function(key) {
    var settings = Drupal.settings.getlocations[key];
    var minmaxes = (Drupal.getlocations_data[key].minmaxes ? Drupal.getlocations_data[key].minmaxes : '');
    var minlat = '';
    var minlon = '';
    var maxlat = '';
    var maxlon = '';
    var cenlat = '';
    var cenlon = '';
    if (minmaxes) {
      minlat = parseFloat(minmaxes.minlat);
      minlon = parseFloat(minmaxes.minlon);
      maxlat = parseFloat(minmaxes.maxlat);
      maxlon = parseFloat(minmaxes.maxlon);
      cenlat = ((minlat + maxlat) / 2);
      cenlon = ((minlon + maxlon) / 2);
    }
    google.maps.event.trigger(Drupal.getlocations_map[key], "resize");
    if (! settings.inputmap && ! settings.extcontrol) {
      if (settings.pansetting == 1) {
        Drupal.getlocations.doBounds(Drupal.getlocations_map[key], minlat, minlon, maxlat, maxlon, true);
      }
      else if (settings.pansetting == 2) {
        Drupal.getlocations.doBounds(Drupal.getlocations_map[key], minlat, minlon, maxlat, maxlon, false);
      }
      else if (settings.pansetting == 3 && cenlat && cenlon) {
        var c = new google.maps.LatLng(parseFloat(cenlat), parseFloat(cenlon));
        Drupal.getlocations_map[key].setCenter(c);
      }
    }
  };

  Drupal.getlocations.get_marker_from_latlon = function(k, lat, lon) {
    var lid;
    var gmark = false;
    for (lid in Drupal.getlocations_markers[k].lids) {
      mark = Drupal.getlocations_markers[k].lids[lid];
      pos = mark.getPosition();
      xlat = parseFloat(pos.lat());
      xlon = parseFloat(pos.lng());
      if (xlat.toFixed(6) == lat.toFixed(6) && xlon.toFixed(6) == lon.toFixed(6)) {
        gmark = mark;
        break;
      }
    }
    return gmark;
  };

  Drupal.getlocations.msiedetect = function() {
    var ieversion = '';
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
     ieversion = new Number(RegExp.$1) // capture x.x portion and store as a number
    }
    return ieversion;
  };

  Drupal.getlocations.getGeoErrCode = function(errcode) {
    var errstr;
    if (errcode == google.maps.GeocoderStatus.ERROR) {
      errstr = Drupal.t("There was a problem contacting the Google servers.");
    }
    else if (errcode == google.maps.GeocoderStatus.INVALID_REQUEST) {
      errstr = Drupal.t("This GeocoderRequest was invalid.");
    }
    else if (errcode == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
      errstr = Drupal.t("The webpage has gone over the requests limit in too short a period of time.");
    }
    else if (errcode == google.maps.GeocoderStatus.REQUEST_DENIED) {
      errstr = Drupal.t("The webpage is not allowed to use the geocoder.");
    }
    else if (errcode == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
      errstr = Drupal.t("A geocoding request could not be processed due to a server error. The request may succeed if you try again.");
    }
    else if (errcode == google.maps.GeocoderStatus.ZERO_RESULTS) {
      errstr = Drupal.t("No result was found for this GeocoderRequest.");
    }
    return errstr;
  };

  Drupal.getlocations.geolocationErrorMessages = function(error) {
    var ret = '';
    switch(error.code) {
      case error.PERMISSION_DENIED:
        ret = Drupal.t("because you didn't give me permission");
        break;
      case error.POSITION_UNAVAILABLE:
        ret = Drupal.t("because your browser couldn't determine your location");
        break;
      case error.TIMEOUT:
        ret = Drupal.t("because it was taking too long to determine your location");
        break;
      case error.UNKNOWN_ERROR:
        ret = Drupal.t("due to an unknown error");
        break;
    }
    return ret;
  };

})(jQuery);
;

/**
 * @file
 * getlocations_field_group.js
 * @author Bob Hutchinson http://drupal.org/user/52366
 * @copyright GNU GPL
 *
 * Javascript functions for getlocations module for Drupal 7
 */

(function ($) {
  Drupal.behaviors.getlocations_field_group = {
    attach: function () {

      // bail out
      if (typeof Drupal.settings.getlocations === 'undefined') {
        return;
      }

      $.each(Drupal.settings.getlocations, function (key, settings) {

        // Drupal field_group module support
        if (settings.field_group_enable) {
          // field group multipage support
          if ($(".multipage-link-next,.multipage-link-previous").is('input')) {
            $(".multipage-link-next,.multipage-link-previous").one('click', function(event) {
              Drupal.getlocations.redoMap(key);
              if (Drupal.getlocations_data[key].datanum == 1) {
                var ll = Drupal.getlocations_data[key].latlons;
                var ll2 = ll[0];
                Drupal.getlocations_map[key].setCenter({lat: parseFloat(ll2[0]), lng: parseFloat(ll2[1])});
              }
            });
          }
          // field group vert and horiz tabs
          if ($(".vertical-tabs-list,.horizontal-tabs-list").is('ul')) {
            $("li.vertical-tab-button a, li.horizontal-tab-button a").bind('click', function(event) {
              Drupal.getlocations.redoMap(key);
              if (Drupal.getlocations_data[key].datanum == 1) {
                var ll = Drupal.getlocations_data[key].latlons;
                var ll2 = ll[0];
                Drupal.getlocations_map[key].setCenter({lat: parseFloat(ll2[0]), lng: parseFloat(ll2[1])});
              }
            });
          }
          // field group accordion
          if ($(".field-group-accordion, .field-group-accordion-wrapper").is('div')) {
            $(".accordion-item").bind('click', function(event) {
              Drupal.getlocations.redoMap(key);
              if (Drupal.getlocations_data[key].datanum == 1) {
                var ll = Drupal.getlocations_data[key].latlons;
                var ll2 = ll[0];
                Drupal.getlocations_map[key].setCenter({lat: parseFloat(ll2[0]), lng: parseFloat(ll2[1])});
              }
            });
          }
          // field-group-format-wrapper
          if ($(".field-group-format, .field-group-format-wrapper").is('div')) {
            $(".field-group-format-title").one('click', function(event) {
              Drupal.getlocations.redoMap(key);
              if (Drupal.getlocations_data[key].datanum == 1) {
                var ll = Drupal.getlocations_data[key].latlons;
                var ll2 = ll[0];
                Drupal.getlocations_map[key].setCenter({lat: parseFloat(ll2[0]), lng: parseFloat(ll2[1])});
              }
            });
          }
        }
      }); // end each

    } // end attach
  }; // end behaviors

})(jQuery);
;
/*
 * Supposition v0.2 - an optional enhancer for Superfish jQuery menu widget.
 *
 * Copyright (c) 2008 Joel Birch - based mostly on work by Jesse Klaasse and credit goes largely to him.
 * Special thanks to Karl Swedberg for valuable input.
 *
 * Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */
/*
 * This is not the original jQuery Supersubs plugin.
 * Please refer to the README for more information.
 */

(function($){
  $.fn.supposition = function(){
    var $w = $(window), /*do this once instead of every onBeforeShow call*/
    _offset = function(dir) {
      return window[dir == 'y' ? 'pageYOffset' : 'pageXOffset']
      || document.documentElement && document.documentElement[dir=='y' ? 'scrollTop' : 'scrollLeft']
      || document.body[dir=='y' ? 'scrollTop' : 'scrollLeft'];
    },
    onHide = function(){
      this.css({bottom:''});
    },
    onBeforeShow = function(){
      this.each(function(){
        var $u = $(this);
        $u.css('display','block');
        var menuWidth = $u.width(),
        menuParentWidth = $u.closest('li').outerWidth(true),
        menuParentLeft = $u.closest('li').offset().left,
        totalRight = $w.width() + _offset('x'),
        menuRight = $u.offset().left + menuWidth,
        exactMenuWidth = (menuRight > (menuParentWidth + menuParentLeft)) ? menuWidth - (menuRight - (menuParentWidth + menuParentLeft)) : menuWidth;  
        if ($u.parents('.sf-js-enabled').hasClass('rtl')) {
          if (menuParentLeft < exactMenuWidth) {
            $u.css('left', menuParentWidth + 'px');
            $u.css('right', 'auto');
          }
        }
        else {
          if (menuRight > totalRight && menuParentLeft > menuWidth) {
            $u.css('right', menuParentWidth + 'px');
            $u.css('left', 'auto');
          }
        }
        var windowHeight = $w.height(),
        offsetTop = $u.offset().top,
        menuParentShadow = ($u.closest('.sf-menu').hasClass('sf-shadow') && $u.css('padding-bottom').length > 0) ? parseInt($u.css('padding-bottom').slice(0,-2)) : 0,
        menuParentHeight = ($u.closest('.sf-menu').hasClass('sf-vertical')) ? '-' + menuParentShadow : $u.parent().outerHeight(true) - menuParentShadow,
        menuHeight = $u.height(),
        baseline = windowHeight + _offset('y');
        var expandUp = ((offsetTop + menuHeight > baseline) && (offsetTop > menuHeight));
        if (expandUp) {
          $u.css('bottom', menuParentHeight + 'px');
          $u.css('top', 'auto');
        }
        $u.css('display','none');
      });
    };

    return this.each(function() {
      var o = $.fn.superfish.o[this.serial]; /* get this menu's options */

      /* if callbacks already set, store them */
      var _onBeforeShow = o.onBeforeShow,
      _onHide = o.onHide;

      $.extend($.fn.superfish.o[this.serial],{
        onBeforeShow: function() {
          onBeforeShow.call(this); /* fire our Supposition callback */
          _onBeforeShow.call(this); /* fire stored callbacks */
        },
        onHide: function() {
          onHide.call(this); /* fire our Supposition callback */
          _onHide.call(this); /* fire stored callbacks */
        }
      });
    });
  };
})(jQuery);;
/* Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version 2.1.2
 */
(function(a){a.fn.bgiframe=(a.browser.msie&&/msie 6\.0/i.test(navigator.userAgent)?function(d){d=a.extend({top:"auto",left:"auto",width:"auto",height:"auto",opacity:true,src:"javascript:false;"},d);var c='<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+d.src+'"style="display:block;position:absolute;z-index:-1;'+(d.opacity!==false?"filter:Alpha(Opacity='0');":"")+"top:"+(d.top=="auto"?"expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+'px')":b(d.top))+";left:"+(d.left=="auto"?"expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+'px')":b(d.left))+";width:"+(d.width=="auto"?"expression(this.parentNode.offsetWidth+'px')":b(d.width))+";height:"+(d.height=="auto"?"expression(this.parentNode.offsetHeight+'px')":b(d.height))+';"/>';return this.each(function(){if(a(this).children("iframe.bgiframe").length===0){this.insertBefore(document.createElement(c),this.firstChild)}})}:function(){return this});a.fn.bgIframe=a.fn.bgiframe;function b(c){return c&&c.constructor===Number?c+"px":c}})(jQuery);;
/*
 * Superfish v1.4.8 - jQuery menu widget
 * Copyright (c) 2008 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 * CHANGELOG: http://users.tpg.com.au/j_birch/plugins/superfish/changelog.txt
 */
/*
 * This is not the original jQuery Supersubs plugin.
 * Please refer to the README for more information.
 */

(function($){
  $.fn.superfish = function(op){
    var sf = $.fn.superfish,
      c = sf.c,
      $arrow = $(['<span class="',c.arrowClass,'"> &#187;</span>'].join('')),
      over = function(){
        var $$ = $(this), menu = getMenu($$);
        clearTimeout(menu.sfTimer);
        $$.showSuperfishUl().siblings().hideSuperfishUl();
      },
      out = function(){
        var $$ = $(this), menu = getMenu($$), o = sf.op;
        clearTimeout(menu.sfTimer);
        menu.sfTimer=setTimeout(function(){
          o.retainPath=($.inArray($$[0],o.$path)>-1);
          $$.hideSuperfishUl();
          if (o.$path.length && $$.parents(['li.',o.hoverClass].join('')).length<1){over.call(o.$path);}
        },o.delay);
      },
      getMenu = function($menu){
        var menu = $menu.parents(['ul.',c.menuClass,':first'].join(''))[0];
        sf.op = sf.o[menu.serial];
        return menu;
      },
      addArrow = function($a){ $a.addClass(c.anchorClass).append($arrow.clone()); };

    return this.each(function() {
      var s = this.serial = sf.o.length;
      var o = $.extend({},sf.defaults,op);
      o.$path = $('li.'+o.pathClass,this).slice(0,o.pathLevels).each(function(){
        $(this).addClass([o.hoverClass,c.bcClass].join(' '))
          .filter('li:has(ul)').removeClass(o.pathClass);
      });
      sf.o[s] = sf.op = o;

      $('li:has(ul)',this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over,out).each(function() {
        if (o.autoArrows) addArrow( $('>a:first-child',this) );
      })
      .not('.'+c.bcClass)
        .hideSuperfishUl();

      var $a = $('a',this);
      $a.each(function(i){
        var $li = $a.eq(i).parents('li');
        $a.eq(i).focus(function(){over.call($li);}).blur(function(){out.call($li);});
      });
      o.onInit.call(this);

    }).each(function() {
      var menuClasses = [c.menuClass];
      if (sf.op.dropShadows  && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
      $(this).addClass(menuClasses.join(' '));
    });
  };

  var sf = $.fn.superfish;
  sf.o = [];
  sf.op = {};
  sf.IE7fix = function(){
    var o = sf.op;
    if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity!=undefined)
      this.toggleClass(sf.c.shadowClass+'-off');
    };
  sf.c = {
    bcClass: 'sf-breadcrumb',
    menuClass: 'sf-js-enabled',
    anchorClass: 'sf-with-ul',
    arrowClass: 'sf-sub-indicator',
    shadowClass: 'sf-shadow'
  };
  sf.defaults = {
    hoverClass: 'sfHover',
    pathClass: 'overideThisToUse',
    pathLevels: 1,
    delay: 800,
    animation: {opacity:'show'},
    speed: 'normal',
    autoArrows: true,
    dropShadows: true,
    disableHI: false, // true disables hoverIntent detection
    onInit: function(){}, // callback functions
    onBeforeShow: function(){},
    onShow: function(){},
    onHide: function(){}
  };
  $.fn.extend({
    hideSuperfishUl : function(){
      var o = sf.op,
        not = (o.retainPath===true) ? o.$path : '';
      o.retainPath = false;
      var $ul = $(['li.',o.hoverClass].join(''),this).add(this).not(not).removeClass(o.hoverClass)
          .find('>ul').addClass('sf-hidden');
      o.onHide.call($ul);
      return this;
    },
    showSuperfishUl : function(){
      var o = sf.op,
        sh = sf.c.shadowClass+'-off',
        $ul = this.addClass(o.hoverClass)
          .find('>ul.sf-hidden').hide().removeClass('sf-hidden');
      sf.IE7fix.call($ul);
      o.onBeforeShow.call($ul);
      $ul.animate(o.animation,o.speed,function(){ sf.IE7fix.call($ul); o.onShow.call($ul); });
      return this;
    }
  });
})(jQuery);;
/**
 * @file
 * The Superfish Drupal Behavior to apply the Superfish jQuery plugin to lists.
 */

(function ($) {
  Drupal.behaviors.superfish = {
    attach: function (context, settings) {
      // Take a look at each list to apply Superfish to.
      $.each(settings.superfish || {}, function(index, options) {
        // Process all Superfish lists.
        $('#superfish-' + options.id, context).once('superfish', function() {
          var list = $(this);

          // Check if we are to apply the Supersubs plug-in to it.
          if (options.plugins || false) {
            if (options.plugins.supersubs || false) {
              list.supersubs(options.plugins.supersubs);
            }
          }

          // Apply Superfish to the list.
          list.superfish(options.sf);

          // Check if we are to apply any other plug-in to it.
          if (options.plugins || false) {
            if (options.plugins.touchscreen || false) {
              list.sftouchscreen(options.plugins.touchscreen);
            }
            if (options.plugins.smallscreen || false) {
              list.sfsmallscreen(options.plugins.smallscreen);
            }
            if (options.plugins.supposition || false) {
              list.supposition();
            }
            if (options.plugins.bgiframe || false) {
              list.find('ul').bgIframe({opacity:false});
            }
          }
        });
      });
    }
  };
})(jQuery);;
