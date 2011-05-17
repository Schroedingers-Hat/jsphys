
// inertialObject Class    
function inertialObject(x,y,r,px,py)
{
    this.init = function()
    {
        this.X0 = vec3.create([0,x,y]);
	    this.XView = vec3.create([0,x,y]);
        this.V = vec3.create([0,px,py]); //Relativistic velocity, or momentum/mass.
        genEnergy(this.V, c);
        this.displace = vec3.create();
        vec3.scale(this.V,timestep / this.V[0], this.displace);
        this.tau = 0;
        this.uDisplacement = vec3.create();
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
	    //Increase proper time.
        this.tau += c * timestep / this.V[0];
	    //Bring it to now.
        vec3.add(this.X0, this.displace);
        this.X0[0]=this.X0[0]-1;        
        this.radialV=(-this.X0[1] * this.V[1] - this.X0[2] * this.V[2]) /
                     Math.sqrt(Math.pow(this.X0[1],2) + 
                     Math.pow(this.X0[2],2)) / this.V[0];
        
        this.radialDist = Math.sqrt(Math.pow(this.X0[1], 2) + 
                          Math.pow(this.X0[2],2));
        this.viewTime = this.radialDist / (c - this.radialV);
        vec3.scale(this.V, this.viewTime / this.V[0], this.uDisplacement);
        vec3.subtract(this.X0, this.uDisplacement, this.XView);
    
        this.radialVPast=(this.XView[1] * this.V[1] + this.XView[2] * this.V[2]) / 
                         Math.sqrt(Math.pow(this.XView[1], 2) + 
                         Math.pow(this.XView[2],2)) / this.V[0];
        // Can't decide what to do with this last line, it /is/ moving forward 1 
        // unit in time, but so is the frame.
    }
    
    //Note that translation can include time, and rotation can include boost.
    this.changeFrame = function(translation,rotation)
    {
        //Boost both velocity and position vectors.
        mat3.multiplyVec3(rotation, this.X0);
        mat3.multiplyVec3(rotation, this.V);
        //Point is now at wrong time

        //Find displacement to current time.
        vec3.scale(this.V, (-this.X0[0]) / this.V[0], this.uDisplacement);
        
        //Bring to current time.
        vec3.add(this.X0,this.uDisplacement);
        this.tau+=this.uDisplacement[0]/this.V[0];
        
        //Find the new velocity.
        vec3.scale(this.V,timestep/this.V[0],this.displace);
	    
	    //Need to stop duplicating code. Write some methods that both update and changeframe call.

        this.radialV = (-this.X0[1] * this.V[1] - this.X0[2] * this.V[2]) / 
                       Math.sqrt(Math.pow(this.X0[1], 2) + Math.pow(this.X0[2], 2)) /
                       this.V[0];
        this.radialDist = Math.sqrt(Math.pow(this.X0[1], 2) + Math.pow(this.X0[2], 2));
        this.viewTime = this.radialDist / (c - this.radialV);
        
        vec3.scale(this.V, this.viewTime / this.V[0], this.uDisplacement);
        vec3.subtract(this.X0, this.uDisplacement, this.XView);
        
        this.radialVPast = (this.XView[1] * this.V[1] + this.XView[2] * this.V[2]) /
                           Math.sqrt(Math.pow(this.XView[1], 2) + 
                           Math.pow(this.XView[2], 2))/this.V[0];
    }
}


function mainSequenceStar(x,y,Lum,px,py)
{

    this.r = Math.sqrt(Lum); //Aesthetic reasons only.
    
    //Very rough approximation of main sequence lum/temp relation.
    this.temp = Math.pow(10,(3.45 + Lum / 10)); 
    
    this.draw = function()
    {
        if(this.COM.XView[1]/zoom < (HWIDTH + 10) &&
           this.COM.XView[2]/zoom < (HHEIGHT + 10) &&
           this.COM.XView[1]/zoom > (-HWIDTH - 10) &&
           this.COM.XView[2]/zoom > (-HHEIGHT - 10))
        {
            g.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                        this.COM.radialVPast,
                                                        this.COM.V[0]));
            g.beginPath();
            g.arc(this.COM.XView[1] / zoom + HWIDTH, 
                  this.COM.XView[2] / zoom + HHEIGHT, 
                  this.r / zoom, 0, twopi, true);
            g.closePath();
            g.fill();
//            g.fillText(Lum, (this.COM.X0[1]+10+HWIDTH),(this.COM.X0[2]+HHEIGHT));
        }
    }
    this.COM = new inertialObject(x, y, Lum, px, py);
}


