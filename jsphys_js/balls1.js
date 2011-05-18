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
var twopi = Math.PI*2;
var tempVec3 = vec3.create();
var initialTime = new Date().getTime();
var oldTime = new Date().getTime();
var newTime = new Date().getTime();
var showDoppler = true;
var showFramePos = false;
var showVisualPos = true;
var keySinceLastFrame = false;
var boostRight  = cBoostMat(vec3.create([0, 0.05, 0]), c);
var boostLeft   = cBoostMat(vec3.create([0, -0.05, 0]), c);
var boostUp     = cBoostMat(vec3.create([0, 0, -0.05]), c);
var boostDown   = cBoostMat(vec3.create([0, 0, 0.05]), c);
var timeScale   = 0.02;
var rotLeft  = mat3.create([1, 0, 0,
                        0, Math.cos(0.1), Math.sin(0.1),
                        0, Math.sin(-0.1), Math.cos(0.1)]);
var rotRight = mat3.create([1, 0, 0,
                        0, Math.cos(0.1), Math.sin(-0.1),
                        0, Math.sin(0.1), Math.cos(0.1)]);

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
    HWIDTH=WIDTH/2;
    HHEIGHT=HEIGHT/2;
    var numstars = 1000;
    var angle;
    for (i=0; i<numstars; i++)
    {
        angle=Math.random()*2*Math.PI;
        rad=Math.pow(Math.random()*100000000,0.5);
        xjit=Math.random()*0.2*c;
        yjit=Math.random()*0.2*c;
        lum=Math.pow(1000,Math.random())/100;
        carray[i] = new mainSequenceStar(vec3.create([0,Math.cos(angle) * rad, Math.sin(angle) * rad]),
                                         vec3.create([0,c*0.1 * Math.cos(angle) + xjit,c*0.1 * Math.sin(angle) + yjit]),
                                         lum);
        carray[i].COM.init();
    
    }
    carray[numstars]=new mainSequenceStar(vec3.create([0,0,0]),vec3.create([0,0,0]),20);
    carray[numstars].COM.init();
    return setInterval(draw, 20);
}

function changeArrayFrame(translation,boost,objectArray)
{
    for (i = 0; i < objectArray.length; i++)
    {
        objectArray[i].COM.changeFrame(translation,boost);
    }
}

// Draw Function
function draw()
{
//    console.profile();
    oldTime=newTime;
    newTime=new Date().getTime();
    timeStep=(newTime - oldTime)*timeScale;
    keySinceLastFrame = false;
    clear();
    var i;
    for (i=0; i<carray.length; i++)
    {
        carray[i].COM.updateX0();
        carray[i].draw();
    }

    g.fillStyle = "#f0f";
    g.fillText("FPS: " + Math.floor(1000/(newTime-oldTime)),250,250); 
    g.fillText("Home System Gamma: " +  Math.floor(carray[carray.length-1].COM.V[0]),250,280); 
    g.fillText("Game Clock: " + Math.floor(t/timeScale/1000),250,300); 
    g.fillText("Real Time: " + Math.floor((newTime - initialTime)/1000),250,320); 
//    console.profileEnd();

  	if (leftDown == true)    changeArrayFrame(vec3.create([0,0,0]), boostLeft, carray);
  	if (upDown == true)      changeArrayFrame(vec3.create([0,0,0]), boostUp,   carray);
  	if (downDown == true)    changeArrayFrame(vec3.create([0,0,0]), boostDown, carray);
    if (rotLeftDown == true) changeArrayFrame(vec3.create([0,0,0]), rotRight,  carray);
    if (rotRightDown == true)changeArrayFrame(vec3.create([0,0,0]), rotLeft,   carray);
  	if (rightDown == true)   changeArrayFrame(vec3.create([0,0,0]), boostRight,carray);
    t+=timeStep;
}
function clear() 
{
    g.fillStyle = "#000";
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
