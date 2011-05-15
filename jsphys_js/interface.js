// Get Key Input
function onKeyDown(evt) 
{

	if(evt.keyCode == 39) rightDown = true;
	else if(evt.keyCode == 37) leftDown = true;
	for (i=0; i<carray.length; i++)
	{
		carray[i].changeFrame(0,boost);
		carray[i].draw();
	}

}

function onKeyUp(evt) 
{
	if (evt.keyCode == 39) rightDown = false;
	else if (evt.keyCode == 37) leftDown = false;
}
