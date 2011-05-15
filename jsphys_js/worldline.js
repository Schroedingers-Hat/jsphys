
// Circle Class	
function Circle(x,y,r)
{
	this.x = x;
	this.y = y;
	this.r = r;
	this.dx = 4-Math.ceil(Math.random()*8);
	this.dy = 4-Math.ceil(Math.random()*8);
	
	this.draw = function()
	{
		g.beginPath();
		g.fillStyle = "#000";
		g.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
		g.closePath();
		g.fill();
	}
	
	this.getX = function()
	{
		return x;
	}
	
	this.getY = function()
	{
		return this.y;
	}
	
	this.move = function()
	{	
		this.x += this.dx;
		this.y += this.dy;
	
		if(this.x > WIDTH)
		{
			this.x = 0;
		}
		if(this.x < 0)
		{
			this.x = WIDTH;
		}

		
		if(this.y > HEIGHT)
		{
			this.y = 0;
		}
		if(this.y < 0)
		{
			this.y = HEIGHT;
		}

	}
}



