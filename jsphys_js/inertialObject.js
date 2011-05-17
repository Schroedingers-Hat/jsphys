
// inertialObject Class    
function inertialObject(X,P,m)
{
    this.init = function()
    {
        this.X0 = X;
	    this.XView = vec3.create();
        this.V = vec3.scale(P,1/m); 
        //Relativistic velocity, or momentum/mass.
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
        // Can't decide what to do with this last line, it /is/ moving forward 1 
        // unit in time, but so is the frame.
        this.calcPast();
    }
    
    //Note that translation can include time, and rotation can include boost.
    this.changeFrame = function(translation,rotation)
    {
        vec3.subtract(this.X0,translation);
        //Boost both velocity and position vectors using the boost matrix.
        mat3.multiplyVec3(rotation, this.X0);
        mat3.multiplyVec3(rotation, this.V);
        //Point is now at wrong time

        //Find displacement to current time.
        vec3.scale(this.V, (-this.X0[0]) / this.V[0], this.uDisplacement);
        
        //Bring to current time.
        vec3.add(this.X0,this.uDisplacement);
        this.tau+=this.uDisplacement[0]/this.V[0];
        
        //Find the new displacement vector.
        vec3.scale(this.V,timestep/this.V[0],this.displace);
    
        this.calcPast();
    }
   
    //This function is a bit esoteric. It works because we can calculate r(t).
    //The dot product projects the velocity in the current frame onto the position.
    //Divide by radius and gamma because we were working with four-velocity, 
    //this gives radial velocity.
    //write r(t)=r0+v_r*t=a point on the light cone=ct
    //rearrange for t to find the time.
    //Then we project the particle back into its past and draw it there.
    this.calcPast = function()
    {
        this.radialDist = vec3.spaceDot(this.X0,this.X0);
        this.radialV = (- vec3.spaceDot(this.V,this.X0) / 
                        this.radialDist / 
                        this.V[0]);
        this.viewTime = this.radialDist / (c - this.radialV);
        
        vec3.scale(this.V, this.viewTime / this.V[0], this.uDisplacement);
        vec3.subtract(this.X0, this.uDisplacement, this.XView);
        
        this.radialVPast = (vec3.spaceDot(this.XView,this.V) /
                            vec3.spaceDot(this.XView,this.XView) / 
                            this.V[0]);
 
   }

}

//Generates an approximation of a main sequence star. 
//Luminosity is in units 10^Lum*1 solar luminosity=Luminosity in watts.
function mainSequenceStar(X,P,Lum)
{
    //Aesthetic reasons only. 
    //If any 3D images are rendered Lum will be more useful
    this.r = Math.sqrt(Lum); 
    
    //Very rough approximation of main sequence lum/temp relation.
    //You can read this off of a HR diagram.
    this.temp = Math.pow(10,(3.45 + Lum / 10)); 
    //TODO: Add the mass and radius relations here.
    this.draw = function()
    {
        if(this.COM.XView[1]/zoom < (HWIDTH + 10) &&
           this.COM.XView[2]/zoom < (HHEIGHT + 10) &&
           this.COM.XView[1]/zoom > (-HWIDTH - 10) &&
           this.COM.XView[2]/zoom > (-HHEIGHT - 10)&&
           this.r / zoom > 0.3)
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
      this.COM = new inertialObject(X,P,1);
}


