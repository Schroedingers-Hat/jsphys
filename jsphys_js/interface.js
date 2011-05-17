
function inputInit()
{
    boostVel=vec3.create([0,0.05,0]);    
    boostRight=cBoostMat(boostVel,c);
    boostVel=vec3.create([0,-0.05,0]);    
    boostLeft=cBoostMat(boostVel,c);
    boostVel=vec3.create([0,0,-0.05]);    
    boostUp=cBoostMat(boostVel,c);
    boostVel=vec3.create([0,0,0.05]);    
    boostDown=cBoostMat(boostVel,c);
    rotLeft=mat3.create([1,0,0,
                         0,Math.cos(0.1),Math.sin(0.1),
                         0,Math.sin(-0.1),Math.cos(0.1) ]);
    rotRight=mat3.create([1,0,0,
                         0,Math.cos(0.1),Math.sin(-0.1),
                         0,Math.sin(0.1),Math.cos(0.1) ]);

}

// Get Key Input
function onKeyDown(evt) 
{
	clear();
	if(evt.keyCode == 39) rightDown = true;
	else if(evt.keyCode == 65)
	{
            for (i=0; i<carray.length; i++)
            {
                carray[i].COM.changeFrame(0,rotLeft);
                carray[i].draw();
            }
	}
	else if(evt.keyCode == 66)
	{
            for (i=0; i<carray.length; i++)
            {
                carray[i].COM.changeFrame(0,rotRight);
                carray[i].draw();
            }
	}
	else if(evt.keyCode == 37) leftDown = true;
	else if(evt.keyCode == 38) upDown = true;
	else if(evt.keyCode == 40) downDown = true;
	else if(evt.keyCode == 109) 
	{
	    boostVel=vec3.create([0,0.05/zoom,0]);    
            boostRight=cBoostMat(boostVel,c);
            boostVel=vec3.create([0,-0.05/zoom,0]);    
            boostLeft=cBoostMat(boostVel,c);
            boostVel=vec3.create([0,0,-0.05/zoom]);    
            boostUp=cBoostMat(boostVel,c);
            boostVel=vec3.create([0,0,0.05/zoom]);    
            boostDown=cBoostMat(boostVel,c);
	    zoom=zoom/2;

	}

	else if(evt.keyCode == 61) 
	{
	    boostVel=vec3.create([0,0.05*zoom,0]);    
            boostRight=cBoostMat(boostVel,c);
            boostVel=vec3.create([0,-0.05*zoom,0]);    
            boostLeft=cBoostMat(boostVel,c);
            boostVel=vec3.create([0,0,-0.05*zoom]);    
            boostUp=cBoostMat(boostVel,c);
            boostVel=vec3.create([0,0,0.05*zoom]);    
            boostDown=cBoostMat(boostVel,c);
	    zoom=zoom*2;
	}
	if(rightDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].COM.changeFrame(0,boostRight);
			carray[i].draw();
		}
	};
	if(leftDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].COM.changeFrame(0,boostLeft);
			carray[i].draw();
		}
	};
	if(upDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].COM.changeFrame(0,boostUp);
			carray[i].draw();
		}
	};
	if(downDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].COM.changeFrame(0,boostDown);
			carray[i].draw();
		}
	};



}

function onKeyUp(evt) 
{
	if (evt.keyCode == 39) rightDown = false;
	else if (evt.keyCode == 37) leftDown = false;
	else if(evt.keyCode == 38) upDown = false;
	else if(evt.keyCode == 40) downDown = false;
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
        alert(minDist);
        // shiftToFrameOfObject(carray[minElement])
    }
}

// Take two points [x,y] and return the distance between them.
function getDistance(pt1, pt2)
{
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}