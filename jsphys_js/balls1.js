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
var carray = new Array();
var c = 1; //Do not change, not fully implemented
var twopi = Math.PI*2;
var tempVec3 = vec3.create();
var oldTime = new Date().getTime();
var newTime = new Date().getTime();
var showDoppler = true;
var showFramePos = false;
var showVisualPos = true;
var keySinceLastFrame = false;
zoom = 1;
//TODO: Decide if we're using increments of ct or t.
var timestep=1; //Not wholly implemented yet, need some scale calls. Do not change from 1.
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
    var numstars = 500;
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
    inputInit();
    carray[numstars]=new mainSequenceStar(vec3.create([0,0,0]),vec3.create([0,0,0]),20);
    carray[numstars].COM.init();
    return setInterval(draw, 20);
}



// Draw Function
function draw()
{
//    console.profile();
    keySinceLastFrame = false;
    oldTime=newTime;
    newTime=new Date().getTime();
    clear();
    var i;
    for (i=0; i<carray.length; i++)
    {
        carray[i].COM.updateX0();
        carray[i].draw();
    }

    t+=timestep;
    g.fillStyle = "#f0f";
    g.fillText(Math.floor(1000/(newTime-oldTime)),250,250); 
//    console.profileEnd();


    	if (leftDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostLeft);
    		}
    	}
    	if (upDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostUp);
    		}
    	}
    	if (downDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostDown);
    		}
    	}
        if (rotLeftDown == true)
        {
            for (i = 0; i < carray.length; i++)
            {
                carray[i].COM.changeFrame(vec3.create([0,0,0]), rotRight);
            }
    	}
        if (rotRightDown == true)
        {
            for (i = 0; i < carray.length; i++)
            {
                carray[i].COM.changeFrame(vec3.create([0,0,0]), rotLeft);
            }
    	}
    	if (rightDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostRight);
    		}
    	}
 

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
