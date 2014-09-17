L.Path.XLINK_NS = 'http://www.w3.org/1999/xlink';

/*
 * Functions that support displaying text on an SVG path
 */
var TextFunctions = TextFunctions || {
  __addPath: L.SVG.prototype._addPath,
  _addPath: function(layer) {
    TextFunctions.__addPath.call(this, layer);
    if (layer.options.text) {
      this._createText(layer);
    }
  },

  __removePath: L.SVG.prototype._removePath,
  _removePath: function(layer) {
    TextFunctions.__removePath.call(this, layer);
    if (layer._text) {
      L.DomUtil.remove(layer._text);
    }
    if (layer._pathDef) {
      L.DomUtil.remove(layer._pathDef);
    }
  },

  __updatePath: L.SVG.prototype._updatePath,
  _updatePath: function (layer) {
    this.__updatePath.call(this, layer);

    if (layer.options.text) {
      this._createText(layer);
    }
  },

  __setPath: L.SVG.prototype._setPath,
  _setPath: function (layer, path) {
	  this.__setPath.call(this, layer, path);

	  if (layer.options.text) {
		  this._createText(layer);
	  }
  },

  _initText: function (layer) {
    if (layer.options.text) {
      this._createText(layer);
    }
  },

  getTextAnchor: function (layer) {
    if (layer._point) {
      return layer._point;
    }
  },

  setTextAnchor: function (layer, anchorPoint) {
    if (layer._text) {
      layer._text.setAttribute('x', anchorPoint.x);
      layer._text.setAttribute('y', anchorPoint.y);
    }
  },

  _createText: function (layer) {
    var options = layer.options.text || {};

    // Set element style
    var setStyle = function (element, style) {
      var styleString = '';

      for (var key in style) {
        styleString += key + ': ' + style[key] + ';';
      }

      element.setAttribute('style', styleString);

      return element;
    };

    // Set attributes for an element
    var setAttr = function (element, attr) {
      for (var key in attr) {
        element.setAttribute(key, attr[key]);
      }

      return element;
    };

    if (layer._text) {
      L.DomUtil.remove(layer._text);
      layer.text = null;
    }
    if (layer._pathDef) {
      L.DomUtil.remove(layer._pathDef);
      layer._pathDef = null;
    }

    layer._text = L.SVG.create('text');
    layer._text.setAttribute('id', L.stamp(layer._text));

    var textNode = document.createTextNode(options.text);

    // If path is true, then create a textPath element and append it
    // to the text element; otherwise, populate the text element with a text node
    if (options.path) {

      var pathOptions = options.path;

      var clonedPath = L.SVG.create('path');
      clonedPath.setAttribute('d', layer._path.getAttribute('d'));
      clonedPath.setAttribute('id', L.stamp(clonedPath));

      this._createDefs();

      this._defs.appendChild(clonedPath);
      layer._pathDef = clonedPath;

      // Create the textPath element and add attributes to reference this path
      var textPath = L.SVG.create('textPath');

      if (pathOptions.startOffset) {
        textPath.setAttribute('startOffset', pathOptions.startOffset);
      }

      if (pathOptions.attr) {
        setAttr(textPath, pathOptions.attr);
      }

      if (pathOptions.style) {
        setStyle(textPath, pathOptions.style);
      }

      textPath.setAttributeNS(L.Path.XLINK_NS, 'xlink:href', '#' + L.stamp(clonedPath));
      textPath.appendChild(textNode);

      // Add the textPath element to the text element
      layer._text.appendChild(textPath);
    }
    else {
      layer._text.appendChild(textNode);
      layer._project();
      var anchorPoint = layer.getTextAnchor ? layer.getTextAnchor() : this.getTextAnchor(layer);
      this.setTextAnchor(layer, anchorPoint);
    }

    //className
    if (options.className) {
      layer._text.setAttribute('class', options.className);
    }
    else {
      layer._text.setAttribute('class', 'leaflet-svg-text');
    }

    //attributes
    if (options.attr) {
      setAttr(layer._text, options.attr);
    }

    //style
    if (options.style) {
      setStyle(layer._text, options.style);
    }

    this._container.appendChild(layer._text);
  }
};

/*
 * Functions that support additions to the basic SVG Path features provided by Leaflet
 */
var PathFunctions = PathFunctions || {
  __updateStyle: L.SVG.prototype._updateStyle,

  _createDefs: function () {
    if (!this._defs) {
      this._defs = L.SVG.create('defs');
      this._container.appendChild(this._defs);
    }
  },

  // __addPath: L.SVG.prototype._addPath,
	_addPath: function (layer) {

    // this.__addPath(layer);

    TextFunctions._addPath.call(this, layer);

    if (layer._gradient) {
      this._defs.appendChild(layer._gradient);
    }
    if (layer._dropShadow) {
      this._defs.appendChild(layer._dropShadow);
    }
    if (layer._fillPattern) {
      this._defs.appendChild(layer._fillPattern);
    }
    if (layer._shapePattern) {
      this._defs.appendChild(layer._shapePattern);
    }
    if (layer._shape) {
      this._container.insertBefore(layer._shape, layer._path.nextSibling);
    }
    if (layer._pathDef) {
      this._defs.appendChild(layer._pathDef);
    }
    if (layer._text) {
      this._container.appendChild(layer._text);
    }
	},

  // __updatePath: L.SVG.prototype._updatePath,
	_updatePath: function (layer) {
    TextFunctions._updatePath.call(this, layer);
  },

  // __removePath: L.SVG.prototype._removePath,
	_removePath: function (layer) {
    // this.__removePath(layer);

    TextFunctions._removePath.call(this, layer);

    if (layer._gradient) {
      L.DomUtil.remove(layer._gradient);
    }
    if (layer._dropShadow) {
      L.DomUtil.remove(layer._dropShadow);
    }
    if (layer._fillPattern) {
      L.DomUtil.remove(layer._fillPattern);
    }
    if (layer._shapePattern) {
      L.DomUtil.remove(layer._shapePattern);
    }
    if (layer._shape) {
      L.DomUtil.remove(layer._shape);
    }

    if (layer._g) {
      L.DomUtil.remove(layer._g);
    }
	},

  _createGradient: function (layer) {
    this._createDefs();

    var options = layer.options !== true ? L.extend({}, layer.options) : {};

    var gradient;
    var gradientOptions;
    var vectorOptions;
    
    gradientOptions = options.gradient || {};
    
    if (gradientOptions.gradientType == "radial") {
      gradient = L.SVG.create("radialGradient");
      vectorOptions = gradientOptions.radial || { cx: '50%', cy: '50%', r: '50%', fx: '50%', fy: '50%' };
    } else {
      gradient = L.SVG.create("linearGradient");
      var vector = gradientOptions.vector || [ [ "0%", "0%" ], [ "100%", "100%" ] ];
      vectorOptions = {
        x1: vector[0][0],
        x2: vector[1][0],
        y1: vector[0][1],
        y2: vector[1][1]
      };
    }

    var stops = gradientOptions.stops || [
      {
        offset: '0%',
        style: {
          color: 'rgb(255, 255, 255)',
          opacity: 1
        }
      },
      {
        offset: '60%',
        style: {
          color: options.fillColor || options.color,
          opacity: 1
        }
      }
    ];

    gradient.setAttribute('id', L.stamp(gradient));
    
    for (var key in vectorOptions) {
      gradient.setAttribute(key, vectorOptions[key]);
    }

    for (var i = 0; i < stops.length; ++i) {
      var stop = stops[i];
      var stopElement = L.SVG.create('stop');

      stop.style = stop.style || {};

      for (key in stop) {
        var stopProperty = stop[key];

        if (key === 'style') {
          var styleProperty = '';

          stopProperty.color = stopProperty.color || (options.fillColor || options.color);
          stopProperty.opacity = typeof stopProperty.opacity === 'undefined' ? 1 : stopProperty.opacity;

          for (var propKey in stopProperty) {
            styleProperty += 'stop-' + propKey + ':' + stopProperty[propKey] + ';';
          }

          stopProperty = styleProperty;
        }

        stopElement.setAttribute(key, stopProperty);
      }

      gradient.appendChild(stopElement);
    }

    // remove old gradient
    if (layer._gradient) {
      L.DomUtil.remove(layer._gradient);
    }

    layer._gradient = gradient;
    return L.stamp(gradient);
  },

  _createDropShadow: function (layer) {

    this._createDefs();

    var filter = L.SVG.create('filter');

    var feOffset = L.SVG.create('feOffset');
    var feGaussianBlur = L.SVG.create('feGaussianBlur');
    var feBlend = L.SVG.create('feBlend');

    var options = layer.options || {
      width: '200%',
      height: '200%'
    };

    options.id = L.stamp(filter);

    for (var key in options) {
      filter.setAttribute(key, options[key]);
    }

    var offsetOptions = {
      result: 'offOut',
      'in': 'SourceAlpha',
      dx: '2',
      dy: '2'
    };

    var blurOptions = {
      result: 'blurOut',
      'in': 'offOut',
      stdDeviation: '2'
    };

    var blendOptions = {
      'in': 'SourceGraphic',
      in2: 'blurOut',
      mode: 'lighten'
    };

    for (key in offsetOptions) {
      feOffset.setAttribute(key, offsetOptions[key]);
    }

    for (key in blurOptions) {
      feGaussianBlur.setAttribute(key, blurOptions[key]);
    }

    for (key in blendOptions) {
      feBlend.setAttribute(key, blendOptions[key]);
    }

    filter.appendChild(feOffset);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feBlend);

    if (layer._dropShadow) {
      L.DomUtil.remove(layer._dropShadow);
    }
    layer._dropShadow = filter;

    return L.stamp(filter);
  },

  _createCustomElement: function (tag, attributes) {
    var element = L.SVG.create(tag);
    element.setAttribute('id', L.stamp(element));

    for (var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        element.setAttribute(key, attributes[key]);
      }
    }

    return element;
  },

  _createImage: function (imageOptions) {
    var image = L.SVG.create('image');
    image.setAttribute('id', L.stamp(image));
    image.setAttribute('width', imageOptions.width);
    image.setAttribute('height', imageOptions.height);
    image.setAttribute('x', imageOptions.x || 0);
    image.setAttribute('y', imageOptions.y || 0);
    image.setAttributeNS(L.Path.XLINK_NS, 'xlink:href', imageOptions.url);

    return image;
  },

  _createPattern: function (patternOptions) {
    var pattern = L.SVG.create('pattern');
    pattern.setAttribute('id', L.stamp(pattern));
    pattern.setAttribute('width', patternOptions.width);
    pattern.setAttribute('height', patternOptions.height);
    pattern.setAttribute('x', patternOptions.x || 0);
    pattern.setAttribute('y', patternOptions.y || 0);
    pattern.setAttribute('patternUnits', patternOptions.patternUnits || 'objectBoundingBox');
    return pattern;
  },

  _createShape: function (type, shapeOptions) {
    var shape = this._createCustomElement(type, shapeOptions);
    return shape;
  },

  _createFillPattern: function (layer) {
    this._createDefs();

    var patternOptions = L.extend({}, layer.options.fillPattern);
    var pattern = this._createPattern(patternOptions.pattern);

    var imageOptions = L.extend({
      url: patternOptions.url
    }, patternOptions.image);
    var image = this._createImage(imageOptions);

    pattern.appendChild(image);

    if (layer._fillPattern) {
      L.DomUtil.remove(layer._fillPattern);
    }
    layer._fillPattern = pattern;

    return L.stamp(pattern);
  },

  _getDefaultDiameter: function (radius) {
    return 1.75 * radius;
  },

  // Added for image circle
  _createShapeImage: function (layer) {
    this._createDefs();

    var imageOptions = layer.options.shapeImage || {};

    var radius = layer.options.radius || Math.max(layer.options.radiusX, layer.options.radiusY);
    var diameter = layer._getDefaultDiameter ? layer._getDefaultDiameter(radius) : this._getDefaultDiameter(radius);
    var imageSize = imageOptions.imageSize || new L.Point(diameter, diameter);

    var circleSize = imageOptions.radius || diameter/2;

    var shapeOptions = imageOptions.shape || {
      circle: {
        r: circleSize,
        cx: 0,
        cy: 0
      }
    };

    var patternOptions = imageOptions.pattern || {
      width: imageSize.x,
      height: imageSize.y,
      x: 0,
      y: 0
    };

    patternOptions.patternUnits = patternOptions.patternUnits || 'objectBoundingBox';

    var pattern = this._createPattern(patternOptions);
    L.stamp(pattern);

    var shapeKeys = Object.keys(shapeOptions);
    var shapeType = shapeKeys.length > 0 ? shapeKeys[0] : 'circle';

    shapeOptions[shapeType].fill = 'url(#' + L.stamp(pattern) + ')';

    var shape = this._createShape(shapeType, shapeOptions[shapeType]);

    if (layer.options.clickable) {
      shape.setAttribute('class', 'leaflet-clickable');
    }

    imageOptions = imageOptions.image || {
      width: imageSize.x,
      height: imageSize.y,
      x: 0,
      y: 0,
      url: layer.options.imageCircleUrl
    };

    var image = this._createImage(imageOptions);
    image.setAttributeNS(L.Path.XLINK_NS, 'xlink:href', imageOptions.url);

    pattern.appendChild(image);

    if (layer._shapePattern) {
      L.DomUtil.remove(layer._shapePattern);
    }
    if (layer._shape) {
      L.DomUtil.remove(layer._shape);
    }

    layer._shapePattern = pattern;
    layer._shape = shape;

    return L.stamp(pattern);
  },

  _updateStyle: function (layer) {
    this.__updateStyle.call(this, layer);

    if (layer.options.text) {
        layer._renderer._createText(layer);
    }

    var context = layer ? layer : this;
    var guid;

    if (context.options.stroke) {
      if (context.options.lineCap) {
        context._path.setAttribute('stroke-linecap', context.options.lineCap);
      }

      if (context.options.lineJoin) {
        context._path.setAttribute('stroke-linejoin', context.options.lineJoin);
      }
    }

    if (context.options.gradient) {
      guid = this._createGradient(context);

      context._path.setAttribute('fill', 'url(#' + guid + ')');
    }
    else if (!context.options.fill) {
      context._path.setAttribute('fill', 'none');
    }

    if (context.options.dropShadow) {
      guid = this._createDropShadow(context);

      context._path.setAttribute('filter', 'url(#' + guid + ')');
    }
    else {
      context._path.removeAttribute('filter');
    }

    if (context.options.fillPattern) {
      guid = this._createFillPattern(context);
      context._path.setAttribute('fill', 'url(#' + guid + ')');
    }

    if (context._applyCustomStyles) {
      context._applyCustomStyles();
    }

    if (layer._gradient) {
      this._defs.appendChild(layer._gradient);
    }
    if (layer._dropShadow) {
      this._defs.appendChild(layer._dropShadow);
    }
    if (layer._fillPattern) {
      this._defs.appendChild(layer._fillPattern);
    }
    if (layer._shapePattern) {
      this._defs.appendChild(layer._shapePattern);
    }
    if (layer._shape) {
      this._container.insertBefore(layer._shape, layer._path.nextSibling);
    }
  }

};

/*
if (L.SVG) {
  // Potential fix for working with 0.8
  var SVGStyleFunctions = L.Util.extend(PathFunctions, {
    __updateStyle: L.SVG.prototype._updateStyle
  });

  var SVGTextFunctions = L.Util.extend(TextFunctions, {
    __updatePath: L.SVG.prototype._updatePath
  });

  L.SVG.include(SVGStyleFunctions);
  L.SVG.include(SVGTextFunctions);
}
*/

// Extend the TextFunctions above and change the __updatePath reference, since
// _updatePath for a line/polygon is different than for a regular path
//var LineTextFunctions = L.extend({}, TextFunctions);
//LineTextFunctions.__updatePath = L.Polyline.prototype._updatePath;

// Pulled from the Leaflet discussion here:  https://github.com/Leaflet/Leaflet/pull/1586
// This is useful for getting a centroid/anchor point for centering text or other SVG markup
/*
LineTextFunctions.getCenter = function (layer) {
    var latlngs = layer._latlngs,
        len = latlngs.length,
        i, j, p1, p2, f, center;

    for (i = 0, j = len - 1, area = 0, lat = 0, lng = 0; i < len; j = i++) {
        p1 = latlngs[i];
        p2 = latlngs[j];
        f = p1.lat * p2.lng - p2.lat * p1.lng;
        lat += (p1.lat + p2.lat) * f;
        lng += (p1.lng + p2.lng) * f;
        area += f / 2;
    }

    center = area ? new L.LatLng(lat / (6 * area), lng / (6 * area)) : latlngs[0];
    center.area = area;

    return center;
};
*/

// Sets the text anchor to the centroid of a line/polygon
/*
 * TODO: this breaks dcmetrobus example when hovering
LineTextFunctions.getTextAnchor = function (layer) {
  var center = this.getCenter(layer);

  return layer._map.latLngToLayerPoint(center);
};
*/

/**
 * Extend L.Polyline with an alternative getCenter method.  The current getCenter method
 * doesn't account for the case where you have a line with the same starting/ending point
 */
var PolylineFunctions = {
	_getCenter: L.Polyline.prototype.getCenter,
	getCenter: function () {
		var centerPoint = this._getCenter.call(this);
		
		if (!centerPoint) {
			centerPoint = this._latlngs[0];
		}
		
		return centerPoint;
	}
}

L.extend(L.Polyline.prototype, PolylineFunctions);

L.Polyline.prototype.getTextAnchor = function () {
	var center = this.getCenter();

	return this._map.latLngToLayerPoint(center);
}
/*
L.Polyline.include(LineTextFunctions);
L.CircleMarker.include(TextFunctions);

L.Path.include(PathFunctions);
L.Polygon.include(PathFunctions);
L.Polyline.include(PathFunctions);
L.CircleMarker.include(PathFunctions);

L.CircleMarker = L.CircleMarker.extend({
  _applyCustomStyles: function () {
    // Added for image circle
    if (this.options.shapeImage || this.options.imageCircleUrl) {
      this._createShapeImage(this.options.shapeImage);
    }
  }
});
*/

L.extend(L.SVG.prototype, TextFunctions, PathFunctions);

/*
 * Rotates a point the provided number of degrees about another point.  Code inspired/borrowed from OpenLayers
 */
L.Point.prototype.rotate = function(angle, point) {
  var radius = this.distanceTo(point);
  var theta = (angle * L.LatLng.DEG_TO_RAD) + Math.atan2(this.y - point.y, this.x - point.x);
  this.x = point.x + (radius * Math.cos(theta));
  this.y = point.y + (radius * Math.sin(theta));
};

/*
 * Let's override the default behavior of L.GeoJSON.asFeature, since it doesn't handle nested FeatureCollections
 */
L.extend(L.GeoJSON, {
  asFeature: function (geoJSON) {
    if (geoJSON.type === 'Feature' || geoJSON.type === 'FeatureCollection') {
      return geoJSON;
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: geoJSON
    };
  }
});

/*
 * Draws a Leaflet map marker using SVG rather than an icon, allowing the marker to be dynamically styled
 */
L.MapMarker = L.Path.extend({

  // includes: TextFunctions,

  initialize: function (centerLatLng, options) {
    L.setOptions(this, options);
    this._latlng = centerLatLng;
  },

  options: {
    fill: true,
    fillOpacity: 1,
    opacity: 1,
    radius: 15,
    innerRadius: 5,
    position: {
      x: 0,
      y: 0
    },
    rotation: 0,
    numberOfSides: 50,
    color: '#000000',
    fillColor: '#0000FF',
    weight: 1,
    gradient: true,
    dropShadow: true,
    clickable: true
  },

  setLatLng: function (latlng) {
    this._latlng = latlng;
    return this.redraw();
  },

  projectLatLngs: function () {
    this._point = this._map.latLngToLayerPoint(this._latlng);
    this._points = this._getPoints();

    if (this.options.innerRadius > 0) {
      this._innerPoints = this._getPoints(true).reverse();
    }
  },

  _project: function () {
    this.projectLatLngs();
    this._updateBounds();
  },

  _updateBounds: function () {
    var map = this._map,
    height = this.options.radius * 3,
    point = map.project(this._latlng),
    swPoint = new L.Point(point.x - this.options.radius, point.y),
    nePoint = new L.Point(point.x + this.options.radius, point.y - height);
    this._pxBounds = new L.Bounds(swPoint, nePoint);
  },

  _update: function () {
    if (this._map) {
      this._renderer._setPath(this, this.getPathString());
      //this._renderer._updatePath(this);
    }
  },

  getBounds: function () {
    var map = this._map,
      height = this.options.radius * 3,
      point = map.project(this._latlng),
      swPoint = new L.Point(point.x - this.options.radius, point.y),
      nePoint = new L.Point(point.x + this.options.radius, point.y - height),
      sw = map.unproject(swPoint),
      ne = map.unproject(nePoint);

    return new L.LatLngBounds(sw, ne);
  },

  getLatLng: function () {
    return this._latlng;
  },

  setRadius: function (radius) {
    this.options.radius = radius;
    return this.redraw();
  },

  setInnerRadius: function (innerRadius) {
    this.options.innerRadius = innerRadius;
    return this.redraw();
  },

  setRotation: function (rotation) {
    this.options.rotation = rotation;
    return this.redraw();
  },

  setNumberOfSides: function (numberOfSides) {
    this.options.numberOfSides = numberOfSides;
    return this.redraw();
  },

  getPathString: function () {
    var anchorPoint = this.getTextAnchor();

    if (this._shape) {
      if (this._shape.tagName === 'circle' || this._shape.tagName === 'ellipse') {
        this._shape.setAttribute('cx', anchorPoint.x);
        this._shape.setAttribute('cy', anchorPoint.y);
      }
      else {
        var width = this._shape.getAttribute('width');
        var height = this._shape.getAttribute('height');
        this._shape.setAttribute('x', anchorPoint.x - Number(width)/2);
        this._shape.setAttribute('y', anchorPoint.y - Number(height)/2);
      }
    }

    this._path.setAttribute('shape-rendering', 'geometricPrecision');
    return new L.SVGPathBuilder(this._points, this._innerPoints).build(6);
  },

  getTextAnchor: function () {
    return new L.Point(this._point.x, this._point.y - 2 * this.options.radius);
  },

  _getPoints: function (inner) {
    var maxDegrees = !inner ? 210 : 360;
    var angleSize = !inner ? maxDegrees / 50 : maxDegrees / Math.max(this.options.numberOfSides, 3);
    var degrees = !inner ? maxDegrees : maxDegrees + this.options.rotation;
    var angle = !inner ? -30 : this.options.rotation;
    var points = [];
    var newPoint;
    var angleRadians;
    var radius = this.options.radius;
    var multiplier = Math.sqrt(0.75);

    var toRad = function (number) {
      return number * L.LatLng.DEG_TO_RAD;
    };

    var startPoint = this._point;

    if (!inner) {
      points.push(startPoint);
      points.push(new L.Point(startPoint.x + multiplier * radius, startPoint.y - 1.5 * radius));
    }

    while (angle < degrees) {

      angleRadians = toRad(angle);

      // Calculate the point the radius pixels away from the center point at the
      // given angle;
      newPoint = this._getPoint(angleRadians, radius, inner);

      // Add the point to the latlngs array
      points.push(newPoint);

      // Increment the angle
      angle += angleSize;
    }

    if (!inner) {
      points.push(new L.Point(startPoint.x - multiplier * radius, startPoint.y - 1.5 * radius));
    }

    return points;
  },

  _getPoint: function (angle, radius, inner) {
    var markerRadius = radius;

    radius = !inner ? radius : this.options.innerRadius;

    return new L.Point(this._point.x + this.options.position.x + radius * Math.cos(angle), this._point.y - 2 * markerRadius + this.options.position.y - radius * Math.sin(angle));
  },

  _applyCustomStyles: function () {
    // Added for image circle
    if (this.options.shapeImage || this.options.imageCircleUrl) {
      this._renderer._createShapeImage(this);
    }
  },

  toGeoJSON: function () {
    var geoJSON = L.Marker.prototype.toGeoJSON.call(this);

    geoJSON.properties = this.options;

    return geoJSON;
  }
});

L.mapMarker = function (centerLatLng, options) {
  return new L.MapMarker(centerLatLng, options);
};

L.extend(L.LatLng, {
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
  MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

/*
 * Draws a regular polygon marker on the map given a radius (or x and y radii) in pixels
 */
L.RegularPolygonMarker = L.Path.extend({
  includes: TextFunctions,

  initialize: function (centerLatLng, options) {
    L.setOptions(this, options);

    this._latlng = centerLatLng;

    this.options.numberOfSides = Math.max(this.options.numberOfSides, 3);
  },

  options: {
    fill: true,
    radiusX: 10,
    radiusY: 10,
    rotation: 0,
    numberOfSides: 3,
    position: {
      x: 0,
      y: 0
    },
    maxDegrees: 360,
    gradient: true,
    dropShadow: false,
    clickable: true
  },

  setLatLng: function (latlng) {
    this._latlng = latlng;
    return this.redraw();
  },

  projectLatLngs: function () {
    this._point = this._map.latLngToLayerPoint(this._latlng);
    this._points = this._getPoints();

    if (this.options.innerRadius || (this.options.innerRadiusX && this.options.innerRadiusY)) {
      this._innerPoints = this._getPoints(true).reverse();
    }
  },

  _project: function () {
    this.projectLatLngs();
    this._updateBounds();
  },

  _updateBounds: function () {
    var map = this._map,
    radiusX = this.options.radius || this.options.radiusX,
    radiusY = this.options.radius || this.options.radiusY,
    deltaX = radiusX * Math.cos(Math.PI / 4),
    deltaY = radiusY * Math.sin(Math.PI / 4),
    point = map.project(this._latlng),
    swPoint = new L.Point(point.x - deltaX, point.y + deltaY),
    nePoint = new L.Point(point.x + deltaX, point.y - deltaY);
    this._pxBounds = new L.Bounds(swPoint, nePoint);
  },

  _update: function () {
    if (this._map) {
      this._renderer._setPath(this, this.getPathString());
      //this._renderer._updatePath(this);
    }
  },

  getBounds: function () {
    var map = this._map,
      radiusX = this.options.radius || this.options.radiusX,
      radiusY = this.options.radius || this.options.radiusY,
      deltaX = radiusX * Math.cos(Math.PI / 4),
      deltaY = radiusY * Math.sin(Math.PI / 4),
      point = map.project(this._latlng),
      swPoint = new L.Point(point.x - deltaX, point.y + deltaY),
      nePoint = new L.Point(point.x + deltaX, point.y - deltaY),
      sw = map.unproject(swPoint),
      ne = map.unproject(nePoint);

    return new L.LatLngBounds(sw, ne);
  },

  setRadius: function (radius) {
    this.options.radius = radius;
    return this.redraw();
  },

  setRadiusXY: function (radiusX, radiusY) {
    this.options.radius = null;
    this.options.radiusX = radiusX;
    this.options.radiusY = radiusY;
    return this.redraw();
  },

  setInnerRadius: function (innerRadius) {
    this.options.innerRadius = innerRadius;
    return this.redraw();
  },

  setInnerRadiusXY: function (innerRadiusX, innerRadiusY) {
    this.options.innerRadius = null;
    this.options.innerRadiusX = innerRadiusX;
    this.options.innerRadiusY = innerRadiusY;
    return this.redraw();
  },

  setRotation: function (rotation) {
    this.options.rotation = rotation;
    return this.redraw();
  },

  setNumberOfSides: function (numberOfSides) {
    this.options.numberOfSides = numberOfSides;
    return this.redraw();
  },

  getLatLng: function () {
    return this._latlng;
  },

  getPathString: function () {
    var anchorPoint = this.getTextAnchor();

    if (this._shape) {
      if (this._shape.tagName === 'circle' || this._shape.tagName === 'ellipse') {
        this._shape.setAttribute('cx', anchorPoint.x);
        this._shape.setAttribute('cy', anchorPoint.y);
      }
      else {
        var width = this._shape.getAttribute('width');
        var height = this._shape.getAttribute('height');
        this._shape.setAttribute('x', anchorPoint.x - Number(width)/2);
        this._shape.setAttribute('y', anchorPoint.y - Number(height)/2);
      }
    }

    this._path.setAttribute('shape-rendering', 'geometricPrecision');
    return new L.SVGPathBuilder(this._points, this._innerPoints).build(6);
  },

  getTextAnchor: function () {
    return this._point;
  },

  _getPoints: function (inner) {
    var maxDegrees = this.options.maxDegrees || 360;
    var angleSize = maxDegrees / Math.max(this.options.numberOfSides, 3);
    var degrees = maxDegrees; //+ this.options.rotation;
    var angle = 0; //this.options.rotation;
    var points = [];
    var newPoint;
    var angleRadians;
    var radiusX = !inner ? this.options.radius || this.options.radiusX : this.options.innerRadius || this.options.innerRadiusX;
    var radiusY = !inner ? this.options.radius || this.options.radiusY : this.options.innerRadius || this.options.innerRadiusY;

    var toRad = function (number) {
      return number * L.LatLng.DEG_TO_RAD;
    };

    while (angle < degrees) {

      angleRadians = toRad(angle);

      // Calculate the point the radius pixels away from the center point at the
      // given angle;
      newPoint = this._getPoint(angleRadians, radiusX, radiusY);

      // Add the point to the latlngs array
      points.push(newPoint);

      // Increment the angle
      angle += angleSize;
    }

    return points;
  },

  _getPoint: function (angle, radiusX, radiusY) {
    var startPoint = this.options.position ? this._point.add(new L.Point(this.options.position.x, this.options.position.y)) : this._point;
    var point = new L.Point(startPoint.x + radiusX * Math.cos(angle), startPoint.y + radiusY * Math.sin(angle));

    point.rotate(this.options.rotation, startPoint);

    return point;
  },

  _getDefaultDiameter: function (radius) {
    var angle = Math.PI/this.options.numberOfSides;
    var minLength = radius * Math.cos(angle);

    return 1.75 * minLength;
  },

  _applyCustomStyles: function () {
    // Added for image circle
    if (this.options.shapeImage || this.options.imageCircleUrl) {
      this._renderer._createShapeImage(this);
    }
  },

  toGeoJSON: function () {
    var geoJSON = L.Marker.prototype.toGeoJSON.call(this);

    geoJSON.properties = this.options;

    return geoJSON;
  }
});

L.regularPolygonMarker = function (centerLatLng, options) {
  return new L.RegularPolygonMarker(centerLatLng, options);
};

// Displays a star on the map
L.StarMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfPoints: 5,
    rotation: -15.0,
    maxDegrees: 360,
    gradient: true,
    dropShadow: true
  },

  setNumberOfPoints: function (numberOfPoints) {
    this.options.numberOfPoints = numberOfPoints;
    return this.redraw();
  },

  _getPoints: function (inner) {
    var maxDegrees = this.options.maxDegrees || 360;
    var angleSize = maxDegrees / this.options.numberOfPoints;
    var degrees = maxDegrees; // + this.options.rotation;
    var angle = 0; //this.options.rotation;
    var points = [];
    var newPoint, newPointInner;
    var angleRadians;
    var radiusX = !inner ? this.options.radius || this.options.radiusX : this.options.innerRadius || this.options.innerRadiusX;
    var radiusY = !inner ? this.options.radius || this.options.radiusY : this.options.innerRadius || this.options.innerRadiusY;

    var toRad = function (number) {
      return number * L.LatLng.DEG_TO_RAD;
    };

    while (angle < degrees) {

      angleRadians = toRad(angle);

      // Calculate the point the radius meters away from the center point at the
      // given angle;
      newPoint = this._getPoint(angleRadians, radiusX, radiusY);
      newPointInner = this._getPoint(angleRadians + toRad(angleSize) / 2, radiusX / 2, radiusY / 2);

      // Add the point to the latlngs array
      points.push(newPoint);
      points.push(newPointInner);

      // Increment the angle
      angle += angleSize;
    }

    return points;
  }
});

L.starMarker = function (centerLatLng, options) {
  return new L.StarMarker(centerLatLng, options);
};

L.TriangleMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfSides: 3,
    rotation: 30.0,
    radius: 5
  }
});

L.triangleMarker = function (centerLatLng, options) {
  return new L.TriangleMarker(centerLatLng, options);
};

L.DiamondMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfSides: 4,
    radiusX: 5,
    radiusY: 10
  }
});

L.diamondMarker = function (centerLatLng, options) {
  return new L.DiamondMarker(centerLatLng, options);
};

L.SquareMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfSides: 4,
    rotation: 45.0,
    radius: 5
  }
});

L.squareMarker = function (centerLatLng, options) {
  return new L.SquareMarker(centerLatLng, options);
};

L.PentagonMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfSides: 5,
    rotation: -18.0,
    radius: 5
  }
});

L.pentagonMarker = function (centerLatLng, options) {
  return new L.PentagonMarker(centerLatLng, options);
};

L.HexagonMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfSides: 6,
    rotation: 30.0,
    radius: 5
  }
});

L.hexagonMarker = function (centerLatLng, options) {
  return new L.HexagonMarker(centerLatLng, options);
};

L.OctagonMarker = L.RegularPolygonMarker.extend({
  options: {
    numberOfSides: 8,
    rotation: 22.5,
    radius: 5
  }
});

L.octagonMarker = function (centerLatLng, options) {
  return new L.OctagonMarker(centerLatLng, options);
};

/*
 * Class for putting custom SVG on the map.  This is experimental and a little bit of a hack
 */
L.SVGMarker = L.Path.extend({

  initialize: function (latlng, options) {
    L.setOptions(this, options);

    this._svg = options.svg || '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
    if (this._svg.indexOf("<") === 0) {
      this._data = (new DOMParser()).parseFromString(this._svg, 'text/xml');
    }

    this._latlng = latlng;
  },

  projectLatLngs: function () {
    this._point = this._map.latLngToLayerPoint(this._latlng);
  },

  _project: function () {
    this.projectLatLngs();
    this._updateBounds();
  },

  _updateBounds: function () {
    var map = this._map,
    radiusX = 5,
    radiusY = 5,
    deltaX = radiusX * Math.cos(Math.PI / 4),
    deltaY = radiusY * Math.sin(Math.PI / 4),
    point = map.project(this._latlng),
    swPoint = new L.Point(point.x - deltaX, point.y + deltaY),
    nePoint = new L.Point(point.x + deltaX, point.y - deltaY);
    this._pxBounds = new L.Bounds(swPoint, nePoint);
  },

  _update: function () {
    if (this._map) {
      this._renderer._setPath(this, this.getPathString());
      //this._renderer._updatePath(this);
    }
  },

  setLatLng: function (latlng) {
    this._latlng = latlng;
    this.redraw();
  },

  getLatLng: function () {
    return this._latlng;
  },

  getPathString: function () {
    var me = this;

    var addSVG = function () {
      if (me._g) {
        L.DomUtil.remove(me._g);
      }
      var g = L.SVG.create('g');
      me._renderer._container.appendChild(g);
      me._g = g;

      /*
      while (g.nodeName.toLowerCase() !== 'g') {
        g = g.parentNode;
      }
      */

      if (me.options.clickable) {
        g.setAttribute('class','leaflet-clickable');
      }

      var data = me._data;
      var svg = data.nodeName.toLowerCase() === 'svg' ? data.cloneNode(true) : data.querySelector('svg').cloneNode(true);

      if (me.options.setStyle) {
        me.options.setStyle.call(me, svg);
      }

      var elementWidth = svg.getAttribute('width');
      var elementHeight = svg.getAttribute('height');

      var width = elementWidth ? elementWidth.replace('px','') : '100%';
      var height = elementHeight ? elementHeight.replace('px','') : '100%';

      // If the width is 100% (meaning that no width is provided), then set the width and height to the size specified in the options
      if (width === '100%') {
        width = me.options.size.x;
        height = me.options.size.y;

        svg.setAttribute('width', width + (String(width).indexOf('%') !== -1 ? '' : 'px'));
        svg.setAttribute('height', height + (String(height).indexOf('%') !== -1 ? '' : 'px'));
      }

      var size = me.options.size || new L.Point(width, height);

      var scaleSize = new L.Point(size.x/width, size.y/height);

      var old = g.getElementsByTagName('svg');
      if (old.length > 0) {
        old[0].parentNode.removeChild(old[0]);
      }
      g.appendChild(svg);

      var transforms = [];
      var anchor = me.options.anchor || new L.Point(-size.x/2, -size.y/2);
      var x = me._point.x + anchor.x;
      var y = me._point.y + anchor.y;

      transforms.push('translate(' + x + ' ' + y + ')');
      transforms.push('scale(' + scaleSize.x + ' ' + scaleSize.y + ')');

      if (me.options.rotation) {
        transforms.push('rotate(' + me.options.rotation + ' ' + (width/2) + ' ' + (height/2) + ')'); //' ' + -1 * anchor.x + ' ' + -1 * anchor.y + ')');
      }

      g.setAttribute('transform', transforms.join(' '));
    };

    if (!this._data) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange  = function() {
        if (this.readyState == 4 && this.status == 200) {
          me._data = this.responseXML;
          addSVG();
        }
      };
      xhr.open('GET', this._svg, true);
      xhr.send(null);
    }
    else {
      addSVG();
    }

    return 'M0 0';
  },

  toGeoJSON: function () {
    var geoJSON = L.Marker.prototype.toGeoJSON.call(this);

    geoJSON.properties = this.options;

    return geoJSON;
  }

});

/*
 * A FeatureGroup with setLatLng and getLatLng methods
 */
L.MarkerGroup = L.FeatureGroup.extend({
  initialize: function (latlng, markers) {
    L.FeatureGroup.prototype.initialize.call(this, markers);

    this.setLatLng(latlng);
  },

  setStyle: function (style) {
    return this;
  },

  setLatLng: function (latlng) {
    this._latlng = latlng;
    this.eachLayer(function (layer) {
      if (layer.setLatLng) {
        layer.setLatLng(latlng);
      }
    });

    return this;
  },

  getLatLng: function (latlng) {
    return this._latlng;
  },

  toGeoJSON: function () {
    var featureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    var eachLayerFunction = function (featureCollection) {
      return function (layer) {
        featureCollection.features.push(L.Util.pointToGeoJSON.call(layer));
      };
    };

    this.eachLayer(eachLayerFunction(featureCollection));

    return featureCollection;
  }
});
