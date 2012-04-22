// Pair of functions to recursively accumulate offsets.
// Because the builtin functions are eminently retarded.
// TODO: Put them somewhere sensible.
function xOffset(item) {
  // If we have a parent, run again on parent and add. Else report offset.
  return item.offsetParent ? xOffset(item.offsetParent) + item.offsetLeft :
                             item.offsetLeft;
}
function yOffset(item) {
  // If we have a parent, run again on parent and add. Else report offset.
  return item.offsetParent ? yOffset(item.offsetParent) + item.offsetTop :
                             item.offsetTop;
}


var Graph = function(name, options){
  // Protected variables.

  var height = options.height || 500, // Set defaults for options if not set.
      width = options.width || 500,
      zoom = options.zoom || 2,
      mouse = options.mouse || true,  // Do we have mouse control?
      animate = options.animate || false, // Animate?
      cv, ctx,                        // canvas and context.
      hcw, hch,                       // Halfwidth and halfheight.
      ti = new Date().getTime(),      // Initial time for animations.
      points = [],                    // Array of functions specifying points.
      functions = [],                 // Array of functions specifying curves.
      lines = [];                     // Array of functions specifying lines.

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

  // Private methods.

  function line(vec1, vec2, ctx, width, style){
    // TODO: These are expensive, store a temp ver. and compare.
    ctx.strokeStyle = style || 'black';
    ctx.lineWidth = width / zoom || 1 / zoom;

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

    // Iterate over functions and plot.
    // TODO: Provide options for:
    //   Max/min parameter, color, width.
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

  // Public methods.
  this.addfunc = function(func, color){
    functions[functions.length] = {func: func, color: color};
    return this;
  };
  this.addLine = function(p1, p2 , options) {
    lines[lines.length] = {p1: p1, p2: p2, options: options};
    return this;
  };
  $(document).ready(function(){
    init();
    draw();
  });
};


