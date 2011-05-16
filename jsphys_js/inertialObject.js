
// inertialObject Class	
function inertialObject(x,y,r,px,py)
{
    // Start off with a neutral color temperature
    this.colorTemp = 7000;
    
	this.X0=vec3.create([0,x,y]);
	this.r = r;
	this.V=vec3.create([0,px,py]); //Relativistic velocity, or momentum/mass.
	genEnergy(this.V);
	this.displace=vec3.create();
	vec3.scale(this.V,timestep/this.V[0],this.displace);
	this.tau=0;
	this.draw = function()
	{
		if(this.X0[1]<(HWIDTH+10) & this.X0[2]<(HHEIGHT+10) & this.X0[1]>(-HWIDTH-10) & this.X0[2]>(-HHEIGHT-10)){
//		if(0){
//		g.fillStyle = "#000";
		g.beginPath();
		g.arc(this.X0[1]+HWIDTH, this.X0[2]+HHEIGHT, this.r, 0, Math.PI*2, true);
		g.closePath();
		g.fill();
		g.fillText(Math.round(this.tau), (this.X0[1]+10+HWIDTH),(this.X0[2]+HHEIGHT));
		};
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
		this.X0[0]=this.X0[0]-1; 				//hack

	}
	
	//Note that translation can include time, and rotation can include boost.
	this.changeFrame = function(translation,rotation)
	{
		//Boost both velocity and position vectors.
		mat3.multiplyVec3(rotation,this.X0);
		mat3.multiplyVec3(rotation,this.V);
		//Point is now at wrong time

		//Find displacement to current time.
		var uDisplacement=vec3.create();
		vec3.scale(this.V,(-this.X0[0])/this.V[0],uDisplacement);
		vec3.add(this.X0,uDisplacement);
		this.tau+=uDisplacement[0]/this.V[0];
		vec3.scale(this.V,timestep/this.V[0],this.displace);


//		return 0;
	
	}
}


