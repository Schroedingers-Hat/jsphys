/**
 * User interface event handling -- mouse and keyboard input
 */

var rightDown = false;
var leftDown = false;
var upDown = false;
var downDown = false;
var rotLeftDown = false;
var rotRightDown = false;
var rotUpDown = false;
var rotDownDown = false;
var scene;

//TODO: Pull all the keycodes out of here and put them in an array or something.
//Will allow changing the controls to boot.

// Get Key Input
function onKeyDown(evt) 
{
    	if (evt.keyCode == 81) rotLeftDown = true;
    	else if (evt.keyCode == 69) rotRightDown = true;
        else if (evt.keyCode == 68) rightDown = true;
    	else if (evt.keyCode == 65) leftDown = true;
    	else if (evt.keyCode == 87) upDown = true;
    	else if (evt.keyCode == 83) downDown = true;
//    	else if (evt.keyCode == 49) rotUpDown = true; //Not needed for 2D 
//    	else if (evt.keyCode == 50) rotDownDown = true;  //Not needed for 2D

        else if (evt.keyCode == 84) displayTime = !displayTime;
        else if (evt.keyCode == 90)
        {
            showDoppler = !showDoppler;
        }
        else if (evt.keyCode == 88)
        {
            showFramePos = !showFramePos;
        }
        else if (evt.keyCode == 67)
        {
            showVisualPos = !showVisualPos;
        }
    	else if (evt.keyCode == 61) 
    	{
    	    zoom = zoom / 2;
            if (zoom < 0.06 ) zoom = 0.6;
            boostRight  = cBoostMat(quat4.create([0, 0.02 / zoom, 0, 0]), c);
            boostLeft   = cBoostMat(quat4.create([0, -0.02 / zoom, 0, 0]), c);
            boostUp     = cBoostMat(quat4.create([0, 0, -0.02 / zoom, 0]), c);
            boostDown   = cBoostMat(quat4.create([0, 0, 0.02 / zoom, 0]), c);
    	}
    	else if (evt.keyCode == 109) 
    	{
    	    zoom = zoom * 2;
            if (zoom > 40) zoom = 40;
            boostRight  = cBoostMat(quat4.create([0, 0.02 * zoom,0, 0]), c);
            boostLeft   = cBoostMat(quat4.create([0, -0.02 * zoom,0, 0]), c);
            boostUp     = cBoostMat(quat4.create([0, 0, -0.02 * zoom, 0]), c);
            boostDown   = cBoostMat(quat4.create([0, 0, 0.02 * zoom, 0]), c);
    	}
}

function onKeyUp(evt) 
{
	if (evt.keyCode == 68) rightDown = false;
	else if (evt.keyCode == 65) leftDown = false;
	else if(evt.keyCode == 87) upDown = false;
	else if(evt.keyCode == 83) downDown = false;
	else if (evt.keyCode == 69) rotRightDown = false;
	else if (evt.keyCode == 81) rotLeftDown = false; 
//	else if (evt.keyCode == 49) rotUpDown = false;  
//	else if (evt.keyCode == 50) rotDownDown = false;  
}

function clickHandler(e)
{
    var offset = $('#canvas').offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;

    var minElement = scene.findClosestObject(x, y, 30);

    if (minElement != false) {
        scene.shiftToFrameOfObject(minElement);
    }
}

// Use JQuery to wait for document load
$(document).ready(function()
{
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    scene = new Scene();
    scene.load(threeObjects, 0);
    scene.startAnimation();
    //var interval = setInterval(drawScene, 20);
    $("#canvas").click(clickHandler);
});

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);
