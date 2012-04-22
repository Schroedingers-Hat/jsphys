var Graph = function(name, options){
  // Protected variables.

  var height  = options.height || 500;
  var width = options.width || 500;
  var yscale = options.yscale || 1;
  var zoom = options.zoom || 2;
  var ctx, hcw, hch, points = [], 
      functions = [];
  functions.length = 1;
  // Nobody likes you jslint. The person calling this function is the one
  // writing the html file.
  document.write(
      '<canvas id="' + name + '" height="' + height + '" width="' + 
      width +'"></canvas>'
      );
  var cv = document.getElementById(name);


  // Private methods.

  function line(vec1, vec2, ctx, width, style){
    ctx.strokeStyle = style || 'black';
    ctx.lineWidth = width / zoom || 1 / zoom;
    ctx.beginPath();
    ctx.moveTo(vec1.x, vec1.y);
    ctx.lineTo(vec2.x, vec2.y);
    ctx.stroke();
  }
  // Public methods.

  function init() {
    ctx = cv.getContext("2d");
    hcw = cv.width / 2;
    hch = cv.height / 2;

    ctx.transform(zoom,0,0,-zoom * yscale,hcw,hch);
    line({x: -hcw, y: 0},
         {x: hcw, y: 0}, ctx);
    line({x: 0, y: -hch}, {x: 0, y: hch},ctx);
  }

  this.addfunc = function(func, color){
    functions[functions.length] = {func: func, color: color};
    return this;
  };
  function draw(){
    var i,j,jj;
    for(i in functions) {
      if (functions.hasOwnProperty(i)) {
        for(j = -hcw / zoom, jj = hcw / zoom; j < jj; j+= 2 / zoom) {
          line({x: j, y: functions[i].func(j)}, {x: j+10/zoom, y: functions[i].func(j+10/zoom)}, ctx, 0.1, functions[i].color);
        }
      }
    }
  }
  $(document).ready(function(){
    init();
    draw();
  });
};
