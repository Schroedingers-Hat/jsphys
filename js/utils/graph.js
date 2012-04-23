/*
##Graph
TODO: Update behavior to match documented/intended syntax.
yping a long comment to explain some stuff about Graph.
Some stuff
Takes functions defining lines or parametric equations
$$[x,y] = f(tau)$$
There are other variables provided to the function for advanced features
$$[x,y] = f(\tau,t,m_x,m_y,c_x,c_y,...)$$


Usage:

    var myGraph = new Graph('myGraph',
      {height: 350, width: 350, zoom: 100}));

It will place a canvas in the element with the id matching the provided
name string and then proceed to draw in it.
Calls to addFunc, addLine etc may be chained together as they
all return the original graph object. This allows it to be called
anonymously, ie.

    (new Graph('myGraph',{height: 50, width: 50, zoom: 1})).addFunc(
      function(p){ return { x: p.tau, y: Math.pow(p.tau,2) };},{}).addLine(
      function(p){ return { x: 0, y: 0};},
      function(p){ return { x: p.mx, y: p.my };},{});

The graph will be re-drawn on a mousemove over the canvas, or at regular
intervals while it is on screen.
Primary use case is functional, but state may be provided with a closure:

    function StateHolder() {
      var myState = 1;
      this.publicFunction = function(p, dest) {
        myState++;
        desr.x = Math.sin(myState) * p.tau;
        dest.y = p.tau;
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

  var height = options.height || 500,     // Set defaults for options not set.
      width = options.width || 500,
      zoom = options.zoom || 2,
      mouse = options.mouse || true,      // Do we have mouse control?
      animate = options.animate || false, // Animate?
      cv, ctx,                            // canvas and context.
      hcw, hch,                           // Halfwidth and halfheight.
      ti = new Date().getTime(),          // Initial time for animations.
      points = [],                        // Array of functions for points.
      functions = [],                     // Array of functions for curves.
      lines = [],                         // Array of functions for lines.
      strokeStyle,
      fillStyle,
      lineWidth;


  // Insert canvas element.
  $('#' + name).html(
    '<canvas id="' + name + 'canvas" height="' + height + '" width="' + 
    width +'"></canvas>'
  );
  // Mousemove TODO: Move this to a global mousemove somewhere else?
  // TODO: Click/lastclick. Allow graphs to access last click location.
  if (mouse){
    $("#"+name).mousemove(function(e,ui){
      var x = (e.pageX - xOffset(this));
      var y = (e.pageY - yOffset(this));
      draw(x,y);
    });  
  }
  cv = $('#' + name + 'canvas')[0];

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
  function line(vec1, vec2, ctx, width, style){
    // Cache and compare local versions of ctx.strokeStyle and ctx.lineWidth
    if ( style !== strokeStyle ) {
      strokeStyle = style || 'black';
      ctx.strokeStyle = strokeStyle;
    }
    if ( width !== lineWidth ) {
      lineWidth = width / zoom || 1 / zoom;
      ctx.lineWidth = width;
    }

    ctx.beginPath();
    ctx.moveTo(vec1.x, vec1.y);
    ctx.lineTo(vec2.x, vec2.y);
    ctx.stroke();
  }

  function init() {
    ctx = cv.getContext("2d");
    hcw = cv.width / 2;
    hch = cv.height / 2;
    ctx.save();
  }


  function draw(mx, my){
    var i,j,jj, f;

    // Clear.
    ctx.restore();
    ctx.clearRect(0,0,2*hcw,2*hch);
    ctx.save();
    ctx.transform(zoom,0,0,-zoom,hcw,hch);

    // Axes.
    line({x: -hcw, y: 0},
         {x: hcw, y: 0}, ctx);
    line({x: 0, y: -hch}, {x: 0, y: hch},ctx);

    // Calibrate mouse position to graph coordinates.
    mx = (mx - hcw) / zoom;
    my = (-my + hch) / zoom;
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
    for(i in functions) {
      if (functions.hasOwnProperty(i)) {
        f = functions[i].func;
        for(j = -hcw / zoom, jj = hcw / zoom; j < jj; j+= 2 / zoom) {
          line(f(j,mx,my), f(j+2/zoom, mx, my), ctx, 0.5, functions[i].color);
        }
      }
    }
    // Iterate over lines and plot.
    for(i in lines) {
      if (lines.hasOwnProperty(i)) {
        var p1 = lines[i].p1,
            p2 = lines[i].p2;
          line(p1(mx,my), p2(mx,my), ctx, 0.5, lines[i].options.color);
      }
    }
    if (animate) {
      setTImeout(draw, 100);
    }
  }

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
          return { x: p.tau, y: Math.pow(p.tau) };
        }, options);

  The function will be passed a number of parameters in the object p.
  These include:

      tau: Parameter ranging from -1 to 1 as the graph is called a number of 
        times. This is the parameter to use for parametric equations.
      t: The time since the graph was initialised in milliseconds.
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
   
   Valid options are taumin, taumax, numsteps, color, width.
   Color and width will be overridden if c and w are provided.
  */
  this.addFunc = function(func, color){
    functions[functions.length] = {func: func, color: color};
    return this;
  };
  /*
  ###Graph.addLine
  Similar to addFunc, except it draws a single line between the points
  specified by a function.
  The function will recieve all the same inputs as those used for addFunc
  except tau.
  Output is expected to be:

      p1: First point for line, format of {x: x, y: y}
      p2: First point for line, format of {x: x, y: y}
      w,c,s: same as addFunc

  TODO: Expand addLine to expect a vector containing an arbitrary number of
  pairs of points.
  */
  this.addLine = function(p1, p2 , options) {
    lines[lines.length] = {p1: p1, p2: p2, options: options};
    return this;
  };
  /*
  ###Graph.addPoints
  Same principle as addLine/addLines but expects a single point for each item
  in the vector and a radius in each point.

  [{x: x, y: y, r: r}, ...]

  TODO: Write this.
  */
  this.addPoints = function(func, options) {
    points[points.length] = {func: func, options: options};
    return this;
  };
  /*
  ###Graph.addText
  Same principle as addPoints, but outputs a string.
  Output expected:

  [{x: x, y: y, str: 'Hamster'},...]

  Text size, color, etc to be specified in options.
  */
  $(document).ready(function(){
    init();
    draw();
  });
};
