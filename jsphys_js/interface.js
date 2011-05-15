// Get Key Input
function onKeyDown(evt) 
{
	clear();
	if(evt.keyCode == 39) rightDown = true;
	else if(evt.keyCode == 37) leftDown = true;
	else if(evt.keyCode == 38) upDown = true;
	else if(evt.keyCode == 40) downDown = true;
	if(rightDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].changeFrame(0,boostRight);
			carray[i].draw();
		}
	};
	if(leftDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].changeFrame(0,boostLeft);
			carray[i].draw();
		}
	};
	if(upDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].changeFrame(0,boostUp);
			carray[i].draw();
		}
	};
	if(downDown == true){
		for (i=0; i<carray.length; i++)
		{
			carray[i].changeFrame(0,boostDown);
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
