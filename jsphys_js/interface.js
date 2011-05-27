/**
 * User interface event handling -- mouse and keyboard input
 */


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
    
    var i = 0;
    var minDist = WIDTH;
    var minElement = -1;

    for (i = 0; i < carray.length; i++)
    {
        var dist = getDistance([x,y], [carray[i].COM.XView[1] / zoom + HWIDTH, 
                                       carray[i].COM.XView[2] / zoom + HHEIGHT]);
        if (dist < minDist)
        {
            minDist = dist;
            minElement = i;
        }
    }
    
    if (minDist < 30)
    {
        //Should probably take this out of here.
        newFrameBoost=cBoostMat(quat4.scale(carray[minElement].COM.V,
                                           1 / carray[minElement].COM.V[0], tempVec3), c);
        carray[minElement].COM.changeFrame([0, 0, 0, 0], newFrameBoost);
        XShift=carray[minElement].COM.X0;
        carray[minElement].COM.X0=quat4.create([0, 0, 0, 0]);
        for (i = 0; i < carray.length; i++)
        {
            if (i != minElement)
            {
                carray[i].COM.changeFrame(XShift, newFrameBoost);
                carray[i].draw();
            }
        }

        // shiftToFrameOfObject(carray[minElement])
    }
}

// Take two points [x,y] and return the distance between them.
function getDistance(pt1, pt2)
{
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}
