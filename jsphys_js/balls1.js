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
var displayTime = false;
var carray = new Array();
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
var timeScale   = 0.02;
var rotLeft  = mat4.create([1, 0, 0, 0,
                        0, Math.cos(0.1), Math.sin(0.1), 0,
                        0, Math.sin( -0.1), Math.cos(0.1), 0,
                        0, 0, 0, 1]);
//rotLeft = mat4.toMat3(rotLeft);  //Migration to 3D
var rotRight = mat4.create([1, 0, 0, 0,
                        0, Math.cos(0.1), Math.sin( -0.1), 0,
                        0, Math.sin(0.1), Math.cos(0.1), 0,
                        0, 0, 0, 1]);
//rotRight = mat4.toMat3(rotRight); //Migration to 3D

zoom = 1;
//TODO: Decide if we're using increments of ct or t.
var timeStep=5; //Not wholly implemented yet, need some scale calls. Do not change from 1.
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
    var numstars = 1000;
    var angle;
    for (i=0; i < numstars; i++)
    {
        angle = Math.random() * twopi;
        rad   = Math.pow(Math.random() * 100000000, 0.5);
        xjit  = Math.random() * 0.2 * c;
        yjit  = Math.random() * 0.2 * c;
        lum   = Math.pow( 1000, Math.random() ) / 100;
        carray[i] = new mainSequenceStar(quat4.create([0, Math.cos(angle) * rad, Math.sin(angle) * rad, 0], 0),
                                         quat4.create([0, c * 0.1 * Math.cos(angle) + xjit, 
                                                        c * 0.1 * Math.sin(angle) + yjit, 0]),
                                         lum);
        carray[i].COM.init();
    
    }
    carray[numstars]=new mainSequenceStar(quat4.create([0, 0, 0, 0]),quat4.create([0, 0, 0, 0]),20);
    carray[numstars].COM.init();
    return setInterval(draw, 20);
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
//    console.profile();
    newTime  = new Date().getTime();
    timeStep = (newTime - initialTime)*timeScale-t;
    keySinceLastFrame = false;
    clear();
    var i;
    for (i=0; i<carray.length; i++)
    {
        carray[i].COM.updateX0();
        carray[i].draw();
    }
    
    $("#fps").html(Math.floor(1000 / (timeStep / timeScale)));
    $("#hsg").html( Math.floor(carray[carray.length - 1].COM.V[0]) );
    $("#gameclock").html( Math.floor(t / timeScale / 1000) );
    $("#time").html( Math.floor( (newTime - initialTime) / 1000) );
    
//    console.profileEnd();

  	if (leftDown == true)    changeArrayFrame(quat4.create([0, 0, 0, 0]), boostLeft, carray);
  	if (upDown == true)      changeArrayFrame(quat4.create([0, 0, 0, 0]), boostUp,   carray);
  	if (downDown == true)    changeArrayFrame(quat4.create([0, 0, 0, 0]), boostDown, carray);
    if (rotLeftDown == true) changeArrayFrame(quat4.create([0, 0, 0, 0]), rotRight,  carray);
    if (rotRightDown == true)changeArrayFrame(quat4.create([0, 0, 0, 0]), rotLeft,   carray);
  	if (rightDown == true)   changeArrayFrame(quat4.create([0, 0, 0, 0]), boostRight,carray);
    t+=timeStep;
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

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);
