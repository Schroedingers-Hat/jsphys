var WIDTH;
var HEIGHT;
var HWIDTH;
var HHEIGHT;
var g;

var rightDown = false;
var leftDown = false;
var upDown = false;
var downDown = false;
var rotLeftDown = false;
var rotRightDown = false;
var rotUpDown = false;
var rotDownDown = false;
var displayTime = false;

var carray = new Array();
var testObject = new Array();

var timeStep;
var timeScale = 0.1;
var c = 1; //Do not change, not fully implemented
var twopi = Math.PI * 2;
var tempVec3 = quat4.create();

var initialTime = new Date().getTime();
var newTime = new Date().getTime();

var showDoppler = true;
var showFramePos = false;
var showVisualPos = true;
var keySinceLastFrame = false;

var boostRight  = cBoostMat(quat4.create([0, 0.05, 0, 0]), c);
var boostLeft   = cBoostMat(quat4.create([0, -0.05, 0, 0]), c);
var boostUp     = cBoostMat(quat4.create([0, 0, -0.05, 0]), c);
var boostDown   = cBoostMat(quat4.create([0, 0, 0.05, 0]), c);


var rotLeft  = mat4.create([1, 0, 0, 0,
                        0, Math.cos(0.1), Math.sin(-0.1), 0,
                        0, Math.sin( 0.1), Math.cos(0.1), 0,
                        0, 0, 0, 1]);
var rotRight = mat4.create([1, 0, 0, 0,
                        0, Math.cos(0.1), Math.sin( 0.1), 0,
                        0, Math.sin(-0.1), Math.cos(0.1), 0,
                        0, 0, 0, 1]);

var rotUp = mat4.create([1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, Math.cos(0.1), Math.sin(0.1),
                        0, 0, Math.sin( -0.1), Math.cos(0.1)
                        ]);
var rotDown = mat4.create([1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, Math.cos(0.1), Math.sin(-0.1),
                        0, 0, Math.sin(0.1), Math.cos(0.1)
                        ]);




zoom = 0.25;
//TODO: Decide if we're using increments of ct or t.
var t = 0;
// Main Function To Start
function start()
{
    keySinceLastFrame = false;
    g = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    HWIDTH = WIDTH / 2;
    HHEIGHT = HEIGHT / 2;
    var numstars = 5000;
    var angle;
    for (i=0; i < numstars; i++)
    {
        angle = Math.random() * twopi;
        angle2 = Math.random() * twopi;
        rad   = Math.pow(Math.random() * 100000000, 0.5);
        xjit  = Math.random() * 0.001 * c;
        yjit  = Math.random() * 0.001 * c;
        lum   = Math.pow( 1000, Math.random() ) / 100;
        carray[i] = new mainSequenceStar(quat4.create([0, Math.cos(angle) * rad, Math.sin(angle) * rad, 0]),
                                         quat4.create([0, c * 0.01 * Math.cos(angle) + xjit, 
                                                        c * 0.01 * Math.sin(angle) + yjit, 0]),
                                         lum);
    }
    testObject[0] = new extendedObject(quat4.create([0, 0, 0, 0]), quat4.create([0, 0, 0, 0]), 1, 1,
                                    [0,  0,  0, 0, 
                                     0,-120,  0, 0,    
                                     0,-120,120, 0, 
                                     0,  0,120, 0]);
    testObject[0].init();

    tWLW = new basicWorldLineWrapper(quat4.create([0, 0, 0, 0]), quat4.create(0, 0, 0, 0)); 
//    return setInterval(draw, 20);
    return animate();
}

function animate() {
    requestAnimFrame( animate );
    draw();
}

function changeArrayFrame(translation, boost, objectArray)
{
    for (i = 0; i < objectArray.length; i++)
    {
        objectArray[i].COM.changeFrame(translation, boost);
    }
}

// Draw Function
function draw()
{
    newTime  = new Date().getTime();
    timeStep = (newTime - initialTime) * timeScale - (t/c);
    keySinceLastFrame = false;
    clear();
    var i;
    for (i=0; i<carray.length; i++)
    {
        carray[i].COM.updateX0();
        carray[i].draw();
    }
//    tWLW.draw();



 
    t = t + (timeStep*c);
    $("#fps").html(Math.floor(1000 / (timeStep / timeScale)));
    $("#hsg").html( Math.floor(carray[carray.length - 1].COM.V[0]) );
    $("#gameclock").html( Math.floor(t / timeScale / 1000 / c) );
    $("#time").html( Math.floor( (newTime - initialTime) / 1000) );
    

  	if (upDown == true)      changeArrayFrame(quat4.create([0, 0, 0, 0]), boostUp,   carray);
  	if (downDown == true)    changeArrayFrame(quat4.create([0, 0, 0, 0]), boostDown, carray);
  	if (leftDown == true)    changeArrayFrame(quat4.create([0, 0, 0, 0]), boostLeft, carray);
  	if (rightDown == true)   changeArrayFrame(quat4.create([0, 0, 0, 0]), boostRight,carray);

    if (rotLeftDown == true) changeArrayFrame(quat4.create([0, 0, 0, 0]), rotRight,  carray);
    if (rotRightDown == true)changeArrayFrame(quat4.create([0, 0, 0, 0]), rotLeft,   carray);
    //3D stuff, currently unused.
    if (rotUpDown == true)   changeArrayFrame(quat4.create([0, 0, 0, 0]), rotUp,  carray);
    if (rotDownDown == true) changeArrayFrame(quat4.create([0, 0, 0, 0]), rotDown,   carray);
}


function clear() 
{
    g.fillStyle = "#212124";
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle = "#fff";
}

// Use JQuery to wait for document load
$(document).ready(function()
{
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    start();
    $("#canvas").click(clickHandler);
});


// Do not quite comprehend what this does, copypasta from Paul Irish's tutorial
// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);
