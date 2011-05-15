var WIDTH;
var HEIGHT;
var g;
var rightDown = false;
var leftDown = false;
var carray = new Array();
var c = 1;

//TODO: Decide if we're using increments of ct or t.
var timestep=1; //Not wholly implemented yet, need some scale calls. Do not change from 1.
var t = 0;
// Main Function To Start
function start()
{
	g = $('#canvas')[0].getContext("2d");
	WIDTH = $("#canvas").width();
	HEIGHT = $("#canvas").height();
	carray[0] = new inertialObject(150,150,5,0.707,0.707);
	carray[1] = new inertialObject(150,150,5,0.5,-0.5);
	carray[2] = new inertialObject(150,150,5,0.3,0.707);
	carray[3] = new inertialObject(150,150,5,-0.707,-0.707);
	boostVel=vec3.create([0,0.05,0]);	
	boost=cBoostMat(boostVel,c);
	return setInterval(draw, 10);
}




// Draw Function
function draw()
{
	clear();
	var i;
	for (i=0; i<carray.length; i++)
	{
		carray[i].updateX0();
		carray[i].draw();
	}
	t+=timestep;
}

function clear() 
{
	g.fillStyle = "#fff";
	g.fillRect(0, 0, WIDTH, HEIGHT);
}

// Use JQuery to wait for document load
$(document).ready(function()
{
	start();
});

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);
