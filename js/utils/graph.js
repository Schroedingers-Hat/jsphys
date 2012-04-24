/*
##Graph
TODO: Update behavior to match documented/intended syntax.
yping a long comment to explain some stuff about Graph.
Some stuff
Takes functions defining lines or parametric equations
$$[x,y] = f(u)$$
There are other variables provided to the function for advanced features
$$[x,y] = f(\u,t,m_x,m_y,c_x,c_y,...)$$


Usage:

    var myGraph = new Graph('myGraph',
      {height: 350, width: 350, zoom: 100}));

It will place a canvas in the element with the id matching the provided
name string and then proceed to draw in it.
Calls to addFunc, addLine etc may be chained together as they
all return the original graph object. This allows it to be called
anonymously, ie.

    (new Graph('myGraph',{height: 50, width: 50, zoom: 1})).addFunc(
      function(p){ return { x: p.u, y: Math.pow(p.u,2) };},{}).addLine(
      function(p){ return { x: 0, y: 0};},
      function(p){ return { x: p.mx, y: p.my };},{});

The graph will be re-drawn on a mousemove over the canvas, or at regular
intervals while it is on screen.
Primary use case is functional, but state and access to other apis may be
provided with a closure:

    function StateHolder() {
      var myState = 1;
      var aJQueryThing = $('#thing')
      function lookAtOtherStuff(t) {
        return anotherApi(t) + aJQueryThing.value;
      }
      this.publicFunction = function(p, dest) {
        myState++;
        desr.x = Math.sin(myState) * p.u;
        dest.y = plookAtOtherStuff(p.u);
        return dest;
      };
    }
    myHolder = new StateHolder();
    myGraph.addFunc(myHolder.publicFunction, {});

If speed is a concern, provided functions can accept a dest object and alter it
rather than creating a new one for each part of each frame.
*/

//
var Graph = function(name, options){
  // ####Protected variables.
  options = options || {};
  options.height = options.height || 500;     // Set defaults for options not set.
  options.width = options.width || 500;
  var zoom = options.zoom || 2;
  options.mouse = options.mouse || true;      // Do we have mouse control?
  options.animate = options.animate || true; // Animate?
  var cv, ctx,                            // canvas and context.
      hcw, hch,                           // Halfwidth and halfheight.
      ts = new Date().getTime(),          // Initial time for animations.
      to = ts,
      tn = ts,
      elements = [],
      strokeStyle,
      lineWidth,
      maxScore = 0,
      winner, 
      p = {
        'mx': 0, 'my': 0,
        'ct': 0, 'dt': 0,
        'cx': 0, 'cy': 0,
        'md': false,
        'u': 0,
        'v': 0,
        'win': false
      };


  // Insert canvas element.
  $('#' + name).html(
    '<canvas id="' + name + 'canvas" height="' + options.height + '" width="' + 
    options.width +'"></canvas>'
  ); 
  cv = $('#' + name + 'canvas');

  if (options.mouse){
    cv.mousemove(function(e){
      p.mx = ( (e.pageX - xOffset(this)) - hcw) / zoom;
      p.my = (-(e.pageY - yOffset(this)) + hch) / zoom;
      if(options.mouse && !options.animate) {requestAnimFrame(draw);}
    });
    cv.click(function(e){
      p.cx = ( (e.pageX - xOffset(this)) - hcw) / zoom;
      p.cy = (-(e.pageY - yOffset(this)) + hch) / zoom;
      if(options.mouse && !options.animate) {requestAnimFrame(draw);}
    });
  }

  dFuns = {
    'pbeg': function(out, ctx, options) {
      strokeStyle = out.c || 'black';
      ctx.strokeStyle = strokeStyle;
      lineWidth = out.w / zoom || 1 / zoom;
      ctx.lineWidth = lineWidth;
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(out.pt.x, out.pt.y);
    },
    'path': function(out, ctx, options) {
      var strokeNow = false;
      // Cache and compare local versions of ctx.strokeStyle and ctx.lineWidth
      if ( out.c !== strokeStyle ) {
        strokeStyle = out.c || 'black';
        ctx.strokeStyle = out.c;
        strokeNow = true;
      }
      if ( out.w !== lineWidth ) {
        lineWidth = out.w / zoom || 1 / zoom;
        ctx.lineWidth = lineWidth;
        strokeNow = true;
      }
      ctx.lineTo(out.pt.x, out.pt.y);
      if (strokeNow) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(out.pt.x, out.pt.y);
      }
    },
    'pend': function (out, ctx, options) {
      ctx.strokeStyle = out.c || 'black';
      ctx.lineWidth = out.w / zoom || 1 / zoom;
      ctx.lineTo(out.pt.x, out.pt.y);
      ctx.stroke();
    },
    'text': function (out, ctx, options) {
    }
  };
  function ensureDraw() {
    draw();
  }
  function init() {
    ctx = cv[0].getContext("2d");
    hcw = cv[0].width / 2;
    hch = cv[0].height / 2;
    ctx.save();
    clear();
  }
  function clear() {
    // Clear.
    ctx.restore();
    ctx.clearRect(0,0,2*hcw,2*hch);
    ctx.save();
    ctx.transform(zoom,0,0,-zoom,hcw,hch);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / zoom;
    // Axes.
    ctx.beginPath();
    ctx.moveTo(-hcw, 0);
    ctx.lineTo( hcw, 0);
    ctx.moveTo(0, -hcw);
    ctx.lineTo(0,  hcw);
    ctx.stroke();
  }
  function draw(mx, my){
    var i,ii,j,jj,jjj,f,o,
        el, element, dFun;
        res = {pt: {}}; // Somewhere to store results so not every function call has to create an object.
    clear();
    to = tn;
    tn = new Date().getTime();
    p.dt = (tn - to) / 1000;
    p.ct = (tn - ts) / 1000;
    // Calibrate mouse position to graph coordinates.
    for(element in elements) {
      if (elements.hasOwnProperty(element)) {
        el = elements[element];
        f = el.func;
        o = el.options;
        dFun = dFuns[el.type];
        maxScore = 0;
        p.win = winner === element;
        for (i = o.vMin, ii = o.vMax; i <= ii; i+= o.vStep){
          p.v = i;
          p.u = o.uMin;
          if (el.type === 'path') {dFuns.pbeg(f(p,res), ctx, o);}
          for(j = o.uMin, jjj = o.uStep, jj = o.uMax - jjj; j < jj; j+= jjj) {
            p.u = j;
            res = f(p,res);
            dFun(res, ctx, o);
            if (res.s > maxScore) {
              winner = element;
              maxScore = res.s;
            }
          }
          p.u = o.uMax;
          if (el.type === 'path') {dFuns.pend(f(p,res), ctx, o);}
        }
      }
    }
    if(options.animate) {requestAnimFrame(draw);}
  }

  this.add = function(func, options, type) {

    options = options || {};
    type = type || 'path';
    var defaults = {
      uMin: -1,
      uStep: 0.1,
      uMax: 1,
      vMin: 0,
      vStep: 1,
      vMax: 1
    };
    var opin = {};
    $.extend(opin, defaults, options);
    elements[elements.length] = {func: func, options: opin, type: type};
  };

  $(document).ready(function(){
    init();
    draw();
  });
};

  /*
  ###graph.addFunc
  Adds a parametric function to be plotted.
  TODO: Update code to match intended/documented use case. At present the
  function is called with func(t, mx, my), expected to return {x: x, y: y}
  and color is handled separately (provided to addFunc rather than by the
  added function).
    
  Usage:

      myGraph.addFunc(
        function(p, dest) { 
          return { x: p.u, y: Math.pow(p.u) };
        }, options);

  The function will be passed a number of parameters in the object p.
  These include:

      u: Parameter ranging from -1 to 1 as the graph is called a number of 
        times. This is the parameter to use for parametric equations.
      t: The time since the graph was initialised in milliseconds.
      dt: How much time has elapsed between beginning of last frame
        and beginning of this one?
      mx: x position of the mouse cursor in graph coordinates relative to the 
      origin
      my: as mx but for y.
      cx: x position of last click
      cy: y position of last click
      md: boolean, is the mouse down
      win: Did this function have the highest score when the mouse was clicked?
        The function is expected to return an object which may contain:
      x: x coordinate to be plotted
      y: y coordinate to be plotted
      w: width of the line at that point
      c: color of the line at that point as hex in string format '#rrggbbaa'
      s: score. All functions, lines, points, and texts will have their s 
        values from the last mousemove event compared. The one with the highest
        value will be called with the win flag true (the others will have it
        false) until the mouse button is clicked again.
   
   Valid options are umin, umax, numsteps, color, width.
   Color and width will be overridden if c and w are provided.
  */
  /*
  ###Graph.addLine
  Similar to addFunc, except it draws a single line between the points
  specified by a function.
  The function will recieve all the same inputs as those used for addFunc
  except u.
  Output is expected to be:

      p1: First point for line, format of {x: x, y: y}
      p2: First point for line, format of {x: x, y: y}
      w,c,s: same as addFunc

  TODO: Expand addLine to expect a vector containing an arbitrary number of
  pairs of points.
  */
  /*

  [{x: x, y: y, r: r}, ...]

  TODO: Write this.
  [{x: x, y: y, str: 'Hamster'},...]

  Text size, color, etc to be specified in options.
  */

  // ##Private methods.
  /*
  ###line
  Private method for drawing a single line segment.
  Input:

      vec1: point, {x: x, y: y}
      vec2: point, format {x: x, y: y}
      ctx: canvas context
      options: object format {c: 'green', w: 1} containing optionally:
        c: color '#rrbbggaa' or pre-set color names as strings.
        w: lineWidth in screen coordinates
  */
    /*
    Iterate over functions and plot.
    TODO: Provide options for:
      Max/min parameter, color, width.
    The idiom used here:

        for(i in functions) {
          if (functions.hasOwnProperty(i)) {
          }
        }
    Is equivalent to forEach but is not an ECMAsctipt 5 feature
    and so is more consistently supported.
    The if statement is a guard against adding things to the prototype
    and encountering strange behavior.
    See Crockford's Javascript, The Good Parts.
    */
