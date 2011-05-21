// inertialObject Class    
function inertialObject(X, P, m)
{
    this.init = function()
    {
        this.X0 = X;
        this.rPast = 1;
	    this.XView = quat4.create();
        this.V = quat4.scale(P, 1 / m); 
        // Relativistic velocity, or momentum/mass.
        genEnergy(this.V, c, m);
        this.displace = quat4.create();
        quat4.scale(this.V, timeStep / this.V[0], this.displace);
        this.tau = 0;
        this.uDisplacement = quat4.create();
    }

    
    this.getX0 = function()
    {
        return this.X0;
    }
    //TODO: Make it handle timeStep.
    //TODO: Make sure all the Cs are in the right place.
    //Find out if the modulo command is as/more efficient.

    this.updateX0 = function()
    {   
        quat4.scale(this.V, timeStep / this.V[0], this.displace);
	    //Increase proper time.
        this.tau += c * timeStep / this.V[0];
	    //Bring it to now.
        quat4.add(this.X0, this.displace);
        this.X0[0] = this.X0[0] - timeStep;
        // Can't decide what to do with this last line, it /is/ moving forward 1 
        // unit in time, but so is the frame. Should I move the -1 into this.displace?
        this.calcPast();
    }
    
    //Note that translation can include time, and rotation can include boost.
    this.changeFrame = function(translation, rotation)
    {

        //Boost both velocity and position vectors using the boost matrix.
        mat4.multiplyVec4(rotation, this.X0);
        mat4.multiplyVec4(rotation, this.V);
        //Point is now at wrong time

        //Find displacement to current time.
        quat4.scale(this.V, (-this.X0[0]) / this.V[0], this.uDisplacement);
        
        //Bring to current time.
        quat4.add(this.X0, this.uDisplacement);
        this.tau += this.uDisplacement[0] / this.V[0];
        
        //Find the new displacement vector.
        quat4.scale(this.V, timeStep / this.V[0], this.displace);
    
        quat4.subtract(this.X0, translation);
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
        this.radialDist = Math.sqrt(quat4.spaceDot(this.X0, this.X0));
        this.radialV = ( -quat4.spaceDot(this.V, this.X0) / 
                        Math.max(this.radialDist,0.000000001) / 
                        this.V[0]);
        this.viewTime = this.radialDist / (c - this.radialV);
        
        this.uDisplacement = quat4.scale(this.V, this.viewTime / this.V[0], this.uDisplacement);
        this.XView = quat4.subtract(this.X0, this.uDisplacement, this.XView);
        this.rPast = Math.sqrt(Math.max(quat4.spaceDot( this.XView, this.XView ),0.00001));        
        this.radialVPast = (quat4.spaceDot(this.XView, this.V) /
                            Math.max(Math.sqrt(Math.abs(quat4.spaceDot(this.XView, this.XView))),0.0000000001) / 
                            this.V[0]);
 
   }
    

    //MeasureDisplacementTo.
    //Also measures the apparent distance to, radial velocities and a number of other things.
    //Reproduces a lot of code from calcPast and updateX0.
    //@Capn, if you can follow what I'm doing maybe you can rework this in a way that
    //Inherits and/or copies things from the other constructs?
//    this.measureDisplacementTo = function(particle)
//    {
//        displacement=quat4.create();
//        measureXIncrement=quat4.create();
//        measureV=quat4.create();
//        boostBetween=cBoostMat(quat4.scale(this.V,1/this.V[0],tempVec3));
//        //Find the displacement between them in current frame.
//        quat4.subtract(particle.X0,this.X0,displacement);
//        //Transform that to the frame of this.
//        mat3.multiply(boostBetween,displacement);
//        //Find out the relative velocity in the frame of this.
//        quat4.subtract(particle.V,this.V,measureV);
//        mat3.multiply(boostBetween,measureV);
//
//        //Lost my train of thought and didn't want to create more spaghetti.
//        //@Capn
//        //What needs to go here to finish the function is to add a constant times
//        //MeasureV (remember this is a 3-velocity) to displacement such that 
//        // the time component: displacement[0]==0
//        //At that point you /should/ have a displacement vector in the frame of
//        //this, which points to particle to do with as you wish 
//        //I'd recommend returning the displacement and possibly this.X0 and/or this.XView
//        //To facilitate drawing things. If you so desire. 
//        //(although I don't know why as it won't really point to anything unless you're in
//        //the frame of this.
//        //also, bear in mind that distance from A to B in A's frame is not the distance from B to A in B's frame (in general).
//   } 

}


//function lineObject(X, P, Materials, Shape)










//Generates an approximation of a main sequence star. 
//Luminosity is in units 10^Lum*1 solar luminosity=Luminosity in watts.
function mainSequenceStar(X, P, Lum)
{
    //Aesthetic reasons only. 
    //If any 3D images are rendered Lum will be more useful
    this.r = Math.sqrt(Lum) * 10; 
    
    //Very rough approximation of main sequence lum/temp relation.
    //You can read this off of a HR diagram.
    this.temp = Math.pow(10, (3.45 + Lum / 10)); 
    //TODO: Add the mass and radius relations here.
    this.draw = function()
    {
        if(showVisualPos &&
           this.COM.XView[1]/zoom < (HWIDTH + 10)  &&
           this.COM.XView[2]/zoom < (HHEIGHT + 10) &&
           this.COM.XView[1]/zoom > (-HWIDTH - 10) &&
           this.COM.XView[2]/zoom > (-HHEIGHT - 10)&&
           this.r / zoom > 0.3)
        {
            if(showDoppler)
            {
                g.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                            this.COM.radialVPast,
                                                            this.COM.V[0]));
            }
            else
            {
                g.fillStyle = tempToColor(this.temp);
            }
            g.beginPath();
            g.arc(this.COM.XView[1] / zoom + HWIDTH, 
                  this.COM.XView[2] / zoom + HHEIGHT, 
                  this.r / zoom, 0, twopi, true);
            g.closePath();
            g.fill();
            
            if (displayTime) g.fillText(Math.floor((this.COM.tau - (this.COM.viewTime)) / timeScale / 1000),
                       this.COM.XView[1] / zoom + HWIDTH + 10,
                       this.COM.XView[2] / zoom + HHEIGHT);
        }
        if(showFramePos &&
           this.COM.X0[1]/zoom < (HWIDTH + 10) &&
           this.COM.X0[2]/zoom < (HHEIGHT + 10) &&
           this.COM.X0[1]/zoom > (-HWIDTH - 10) &&
           this.COM.X0[2]/zoom > (-HHEIGHT - 10)&&
           this.r / zoom > 0.3)
        {
            g.fillStyle = "#0f0"; 
            g.beginPath();
            g.arc(this.COM.X0[1] / zoom + HWIDTH, 
                  this.COM.X0[2] / zoom + HHEIGHT, 
                  this.r / zoom, 0, twopi, true);
            g.closePath();
            g.fill();
            if (displayTime) g.fillText(Math.floor(this.COM.tau / timeScale / 1000),
                       this.COM.X0[1] / zoom + HWIDTH + 10,
                       this.COM.X0[2] / zoom + HHEIGHT);

        }
 
    }
      this.COM = new inertialObject(X, P, 1);
}


