
// inertialObject Class	
function inertialObject(x,y,r,px,py)
{
	this.X0=vec3.create([0,x,y]);
	this.r = r;
	this.V=vec3.create([0,px,py]); //Actually relativistic velocity over gamma.
	genEnergy(this.V);
	this.displace=vec3.create();
	vec3.scale(this.V,timestep/this.V[0],this.displace);
	this.tau=0;
	this.draw = function()
	{
		g.beginPath();
		g.fillStyle = "#000";
		g.arc(this.X0[1], this.X0[2], this.r, 0, Math.PI*2, true);
		g.closePath();
		g.fill();
		g.fillStyle = "Black";
		g.font = "10px Times New Roman";
		g.fillText(Math.round(this.tau), this.X0[1]+10,this.X0[2]);
		g.fillText(Math.round(this.X0[0]-t), this.X0[1]+10,this.X0[2]+20);
	}
	
	this.getX0 = function()
	{
		return this.X0;
	}
	//TODO: Make it handle timestep.
	//TODO: Make sure all the Cs are in the right place.
	//Find out if the modulo command is as/more efficient.

	this.updateX0 = function()
	{	
		this.tau += c*timestep/this.V[0];
		vec3.add(this.X0,this.displace);
		this.X0[0]=0; 				//hack
		if(this.X0[1] > WIDTH)
		{
			this.X0[1] = 0;
		}
		if(this.X0[1] < 0)
		{
			this.X0[1] = WIDTH;
		}

		if(this.X0[2] > HEIGHT)
		{
			this.X0[2] = 0;
		}
		if(this.X0[2] < 0)
		{
			this.X0[2] = HEIGHT;
		}

	}
	
	//Note that translation can include time, and rotation can include boost.
	this.changeFrame = function(translation,rotation)
	{
		mat3.multiplyVec3(rotation,this.X0);
		mat3.multiplyVec3(rotation,this.V);	
		var uDisplacement=vec3.create();
		vec3.scale(this.V,(-this.X0[0])/this.V[0],uDisplacement);
		vec3.add(this.X0,uDisplacement);
		this.tau+=uDisplacement[0]/this.V[0];
		this.gamma=vToGamma(this.V[0]);
		vec3.scale(this.V,timestep/this.V[0],this.displace);
//		return 0;
	
	}
}



