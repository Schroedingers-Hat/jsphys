/** *
@fileoverview  
Contains graphing utilities for use in jsphys educational physics
  package.  
@author  
Matthew Watson, Copyright 2012
** */

/** *
@module jsphys/utils/Graph
** */
/** *
Constructs a new Graph object.

@class  
Graph class for putting a HTML canvas graph on a page.
[Example](/test/utils/graph-test.html)  
Features include animation, reaction to mouse movement, reaction to clicking,
two-parameter equations with output of x, y, color, thickness.

@param  
{String} name Name for the graph. Must match the id for some element in
the html for which jQuery can access the html. 

@param  
{{height: number, width: number, zoom: number, mouse: boolean,
animate: boolean}} options Options governing the overall graph.

@returns  
{Graph} The graph object, and all public functions return the graph
  object. This allows calls to be chained together.

@example

    (new Graph('ham')).add(fun1(p){}).add(fun2(p){});
@requires jsphys/lib/UI
** */
var Graph = function(name, optIn){
  var defOps = {
    frameRate: 24,
    zoom: optIn ? (optIn.height || 250)/2 : 250,
    height: 500, width: 1000,
    mouseClick: false, mouseMove: false,
    animate: false, needFocus: false
  };
  var options = $.extend(defOps, optIn),
      cv, ctx,                            // canvas and context.
      hcw = options.width / 2,
      hch = options.height / 2,           // Halfwidth and halfheight.
      ts = new Date().getTime(),          // Initial time for animations.
      to = ts,
      tn = ts,
      elements = [],
      strokeStyle,
      lineWidth,
      gotFocus,
      maxScore = 0,
      winner, winV, winU, cwin,
      /** *
      @description Parameter list. Passed to any functions.
      The elements `win`, `wv` and `wu` were intended to be used for mouse control, one
      example would be to set res.s to -distance of mouse from a point you are 
      plotting (`res.s = -Math.pow(myX - p.mx,2) - Math.pow(myY - p.my,2)`)
      the next frame you could set `res.color = win ? 'blue': 'green'`.

      Other elements as listed.

          ct: number Milliseconds since graph initialisation.
          dt: number Milliseconds since last frame.
          mx, my: number Mouse position
          cx, cy: number Mouse click positions (down and release).
          mdx, mdy: number Mouse down position (down).
          tmdx,tmdy: number Net displacement for all draging on the graph.
          cmdx,cmdy: number Displacement for present dragging operation.
          u,v: Parameters iterated over for parametric equations.
          win: Set to true for a fn if res.s was largest last frame.
          wv,wu: Set to the values v and u had when out.s was highest.
      ** */
      p = {
        'ct': 0,            
        'dt': 0,            
        'mx': 0, 'my': 0,   
        'cx': 0, 'cy': 0,   
        'mdx': 0, 'mdy': 0, 
        'tmdx': 0, 'tmdy': 0,
        'cmdx': 0, 'cmdy': 0,
        'md': false,        
        'mdStart': false,   
        'mdStop' : false,   
        'u': 0,
        'v': 0,
        'win': false,
        'wv': 0,
        'wu': 0
      };
  var results = []; // Somewhere to store results so not every function call has to create an object.
  var scale = hcw / options.zoom;
  var plotOptionDefs = {
    'def': {uP: {min: -1, max: 1, step: 0.05},
            vP: {min: 0, max: 0, step: 1}, 
            color: 'blue', size: 2, dType: 'path'},
    'yOfx' : {uP: {min: -scale, max:  scale, step: scale / 200}},
    'contours' : {uP: {min: -scale, max:  scale, step: scale / 50},
                  vP: {min: 0, max: scale, step: scale / 5}},
    'xyOfuv' : {vP: {min: -1, max: 1, step: 0.05}},
    'points' : {uP: {min: 0, max: 100, step: 1}, size: 2, dType: 'points'},
    'crosses' : {uP: {min: 0, max: 100, step: 1}, size: 5, dType: 'crosses'}
  };
  // Insert canvas element.
  var cvname = name + ts.toString(16);
  var holder = $('#' + name);
  holder = holder[0] ? holder : $('body');
  holder.append(
    '<canvas id="' + cvname + '" height="' + options.height + '" width="' + 
    options.width +'"></canvas>'); 

  cv = $('#' + cvname);
  // Only animate/redraw on mousemove if requested.
  // TODO: Double check we can't wind up with multiple frame queues.
  cv.mouseenter(function(e) {
    gotFocus = true;
    if(options.needFocus && options.animate) {requestAnimFrame(draw);}
  });
  cv.mouseleave(function(e) {
    gotFocus = false;
    p.tmdx += p.cmdx;
    p.tmdy += p.cmdy;
    p.cmdx = 0;
    p.cmdy = 0;
    p.mdStop = true;
    p.md = false;
  });
  if (options.mouseMove){
    cv.mousemove(function(e){
      p.mx = ( (e.pageX - UI.xOffset(this)) - hcw) / options.zoom;
      p.my = (-(e.pageY - UI.yOffset(this)) + hch) / options.zoom;
      p.cmdx = p.md ? p.mdx - p.mx : 0;
      p.cmdy = p.md ? p.mdy - p.my : 0;
      if(!options.animate) {requestAnimFrame(draw);}
    });
  }
  if (options.mouseClick) {
    cv.mousedown(function(e){
      p.mdx = ( (e.pageX - UI.xOffset(this)) - hcw) / options.zoom;
      p.mdy = (-(e.pageY - UI.yOffset(this)) + hch) / options.zoom;
      p.md = true;
      p.mdStart = true;
      if(!options.animate) {requestAnimFrame(draw);}
    });
    cv.mouseup(function(e){
      p.md = false;
      p.tmdx += p.cmdx;
      p.tmdy += p.cmdy;
      p.cmdx = 0;
      p.cmdy = 0;
      p.mdStop = true;
      if(!options.animate) {requestAnimFrame(draw);}
    });
    cv.click(function(e){
      p.cx = ( (e.pageX - UI.xOffset(this)) - hcw) / options.zoom;
      p.cy = (-(e.pageY - UI.yOffset(this)) + hch) / options.zoom;
      if(!options.animate) {
        requestAnimFrame(draw);
        // Slightly hacky. Draw two frames, one to get the winner right
        // and one to draw with the correct winner. Can't think of a better
        // way that doesn't involve writing a dummy draw function or storing.
        // lots more stuff than we need to.
        requestAnimFrame(draw);
      }
    });
  }
  /** *
  Array of functions, each of which takes input as the output from one of the
    plotting elements in elements, a context, and a set of options. Each
    element has a sub-element `main` which different values of the function are
    passed toand optionally `init` and `fin` to start and stop the plotting
    process as a special case. They are selected via the dType property in the
    options passed into add().
  @property {Object} path Functions for plotting a continuous path.
  @property {Object} points For plotting series of dots ie. scatterplot.
  @property {Object} crosses As points, but for crosses.
  @property {Object} test Functions for plotting a series of strings.
  ** */
  var dFuns = {
    path: {
      /** @memberOf dFun.path*/
      init: function(out, ctx, plotOpt) {
        strokeStyle = out.color || plotOpt.color || 'black';
        ctx.strokeStyle = strokeStyle;
        lineWidth = (out.size || plotOpt.size || 1) / options.zoom;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(out.pt.x, out.pt.y);
        },
      main: function(out, ctx, plotOpt) {
        var strokeNow = false;
        // Cache and compare local ver of ctx.strokeStyle and ctx.lineWidth.
        if ( out.color !== strokeStyle ) {
          strokeStyle = out.color || plotOpt.color || 'black';
          ctx.strokeStyle = strokeStyle;
          strokeNow = true;
        }
        if ( out.size !== lineWidth ) {
          lineWidth = (out.size || plotOpt.size || 1) / options.zoom;
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
      fin: function (out, ctx, plotOpt) {
        ctx.strokeStyle = out.color || plotOpt.color || 'black';
        lineWidth = (out.size || plotOpt.size || 1) / options.zoom;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(out.pt.x, out.pt.y);
        ctx.stroke();
      }
    },
    points: {
      main: function (out, ctx, plotOpt) {
        ctx.fillStyle = out.color || plotOpt.color || 'blue';
        ctx.beginPath();
        ctx.arc(out.pt.x, out.pt.y, (out.size || plotOpt.size || 1) / options.zoom, 0, Math.PI*2);
        ctx.closePath();
        ctx.fill();
      }
    },
    crosses: {
      main: function (out, ctx, plotOpt) {
        var x = out.pt.x,
            y = out.pt.y,
            w = (out.size || plotOpt.size || 5) / options.zoom;

        ctx.strokeStyle = out.color || plotOpt.color || 'blue';
        ctx.lineWidth = 1 / options.zoom;
        ctx.beginPath();
        ctx.moveTo(x - w, y - w);
        ctx.lineTo(x + w, y + w);
        ctx.moveTo(x - w, y + w);
        ctx.lineTo(x + w, y - w);
        ctx.stroke();
      }
    },
    text: {
      main: function (out, ctx, plotOpt) {
        ctx.restore();
        ctx.strokeStyle = 'black';
        ctx.font =  (Math.round(out.size || plotOpt.size || 12) + "pt Arial");
        ctx.fillText((out.text || 'No text.'), hcw + out.pt.x * options.zoom,
                                               hch - out.pt.y * options.zoom );
        ctx.save();
        ctx.transform(options.zoom,0,0,-options.zoom,hcw,hch);
      }
    }
  };
  /** *
  Initialise, clear and draw axes on the canvas.
  ** */
  function init() {
    ctx = cv[0].getContext("2d");
    ctx.save();
    clear();
  }
  /** *
  Clear canvas and redraw axes.
  TODO: Make the axes a regular plotting entity to cut down on redundancy and
    make it more flexible. 
  ** */
  function clear() {
    // Clear.
    ctx.restore();
    ctx.clearRect(0,0,2*hcw,2*hch);
    ctx.save();
    ctx.transform(options.zoom,0,0,-options.zoom,hcw,hch);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / options.zoom;
    // Axes.
    ctx.beginPath();
    ctx.moveTo(-hcw, 0);
    ctx.lineTo( hcw, 0);
    ctx.moveTo(0, -hcw);
    ctx.lineTo(0,  hcw);
    ctx.stroke();
  }
  /** *
  Most involved internal method.
  Iterates through all the objects in `elements`. Extracts the function type 
  and options from each one.  
  Type is used to choose a function from dFun. This is then fed the result of
  the function called with the parameter list `p` along with the options object
  options are also used to define the number of times the function is called
  and how the parameters `u` and `v` are updated for each call.  
  The function from `elements` will be fed the parameter list `p` along with an
  object in which the results can be stored. This is merely a garbage-reducing
  measure and it is not necessary to modify and return this object providing
  the function returns something with the correct format.
  ** */
  function draw(){
    var i,ii,j,jj,jjj,f,o, res,
        el, element, dFun;
    clear();
    to = tn;
    tn = new Date().getTime();
    p.dt = (tn - to) / 1000;
    p.ct = (tn - ts) / 1000;
    maxScore = 0;
    p.wu = winU; 
    p.wv = winV;
    // Calibrate mouse position to graph coordinates.
    for(element in elements) {
      // TODO: protect anyone who happens to use this from themselves by
      // Copying the parameter list fresh for each element.
      if (elements.hasOwnProperty(element)) {
        // Create a separate results object for each element but no more
        // than one.
        results[element] = results[element] || {pt: {}};
        res = results[element];
        el = elements[element];
        f = el.func;
        o = el.plotOpt;
        dFun = dFuns[o.dType].main;

        // Start changing parameters and calling the relevant drawing functions
        p.win = winner && winner === element;
        for (i = o.vP.min, ii = o.vP.max; i <= ii; i+= o.vP.step) {
          p.v = i;
          p.u = o.uP.min;
          if(dFuns[o.dType].init) {dFuns[o.dType].init(f(p,res), ctx, o);}
          // From just after uP.min to just before uP.max in intervals of uP.step.
          for(j = o.uP.min + o.uP.step, jj = o.uP.max - o.uP.step, jjj = o.uP.step;
              j < jj;
              j+= jjj) {
            p.u = j;
            res = f(p,res);
            dFun(res, ctx, o);
            // If the function returns a score, compare it with the current
            // best. Winner gets told it has mouse control.
            if (res.s && res.s > maxScore) {
              cwin = element;
              winU = p.u;
              winV = p.v;
              maxScore = res.s;
            }
          }
          p.u = o.uP.max;
          if(dFuns[o.dType].fin) {dFuns[o.dType].fin(f(p,res), ctx, o);}
        }
      }
    }
    winner = cwin;
    p.mdStart = false;
    p.mdStop = false;
    if((!options.needFocus || gotFocus) && options.animate) {
      setTimeout(reqFrame, 1000/options.frameRate);
    }
  }
  /** *
  TODO: Document this after pinning down the defaults/functionality.
  ** */
  this.add = function(func, plotOpIn, type) {
    var options;
    if (!plotOpIn || typeof(plotOpIn) === 'string') {
      options = $.extend(true,{}, plotOptionDefs.def, plotOptionDefs[plotOpIn]);
    } else {
      options =  $.extend(true,{}, plotOptionDefs.def, plotOptionDefs[plotOpIn.type], plotOpIn);
    }
    elements[elements.length] = {func: func, plotOpt: options};
    return this;
  };
  this.plot = function(f1, f2) {
    if(f2) {
      if(f1.length === 1 && f2.length === 1) {
      this.add(function(p,res){
          res.pt.x = f1(p.u) - p.tmdx - p.cmdx;
          res.pt.y = f2(p.u) - p.tmdy - p.cmdy;
          return res;
        },'yOfx');
      } else if(f1.length <= 2 && f2.length <= 2) {
        this.add(function(p,res){
          res.pt.x = f1(p.u,p.v) - p.tmdx - p.cmdx;
          res.pt.y = f2(p.u,p.v) - p.tmdy - p.cmdy;
          return res;
        },'xyOfuv');
      }
    } else {
      if(f1.length === 1) {
      this.add(function(p,res){
          res.pt.x = p.u - p.tmdx - p.cmdx;
          res.pt.y = f1(p.u) - p.tmdy - p.cmdy;
          return res;
        }, 'yOfx');
      } else if (f1.length === 2) {
        this.add(function(p,res){
          res.pt.x = p.u - p.tmdx - p.cmdx;
          res.pt.y = f1(p.u,p.v) - p.tmdy - p.cmdy;
          return res;
        }, 'contours');
      }
    }
    draw();
    return this;
  };
  function reqFrame() {requestAnimFrame(draw);}
  init();
  draw();
  this.draw = draw;
  return this;
};

function g() {
  return new Graph();
}
