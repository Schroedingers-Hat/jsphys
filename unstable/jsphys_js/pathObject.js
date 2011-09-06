/* Path object. Object that will follow a time-like world line.
 * Some assumptions I'll be using here mean that things will act a bit odd
 * if these are moved in a space-like manner for any reason.
*/ 

function pathObject(X, P, m, maxDistance, savePrecision)
{
    this.init = function()
    {
        this.X0 = X;
        this.rPast = 1;
	    this.XView = quat4.create();
        this.worldLine = new Array(); // TODO: Save shovelling data around and extend glMatrix to include this.
        this.pastVel = new Array();
        this.V = quat4.scale(P, 1 / m); 
        // Relativistic velocity, or momentum/mass.
        genEnergy(this.V, c, m);
        this.displace = quat4.create();
        quat4.scale(this.V, timeStep / this.V[0], this.displace);
        this.tau = 0;
        this.timeSinceFrameChange = 0;
        this.uDisplacement = quat4.create();
        this.worldLine.push( this.X0 );
        this.pastVel.push( this.V);
        this.currentlyExists = true;
        this.playHistory = false;
    }

    
    this.getX0 = function()
    {
        return this.X0;
    }

    this.findIdxEventPreceeding = function(time)
    {
        var findTime = time;
        i = this.worldLine.length - 1;
        if  (i == 0 ) return 0;
        while ((this.worldLine[i][0] - this.timeSinceFrameChange) > findTime )
        {
            i--;
            if (i < 0) return -1;
        }
        return i;
    }

    this.update = function()
    { 
        // Check if we're up to this object's present.
        var mostRecentIndex = this.findIdxEventPreceeding(0);

        // If we went past index 0.
        if (mostRecentIndex == -1)
        {
            // Return false, object doesn't exist yet.
            this.currentlyExists == false;
            return false;
        }
        else if (this.worldLine.length <= (mostRecentIndex) ) this.playHistory = false;
        // If it exists, but we don't have an event after now, we need to generate new events.
 
        // TODO: Generalise this to other motion/rules.
        quat4.scale(this.V, timeStep / this.V[0], this.displace);
        //Increase proper time.
        this.tau += timeStep / this.V[0];
   	    //Bring it to now.
        quat4.add(this.X0, this.displace);
        this.X0[0] = this.X0[0] - timeStep;
        // Save the current position if necessary.
        this.timeSinceFrameChange += timeStep;
        if ( (this.timeSinceFrameChange - this.worldLine[mostRecentIndex][0]) > (savePrecision / c) ) 
        {
            this.worldLine.push(quat4.create([this.timeSinceFrameChange, this.X0[1], this.X0[2], this.X0[3]]));
            this.pastVel.push(quat4.create(this.V) );
        }
    }
    
    //Note that translation can include time, and rotation can include boost.
    this.changeFrame = function(translation, rotation)
    {
        // Move the recorded positions back in time so that they are correctly displaced from you
        //  then rotate them. Rotate the velocities.
        for (i=0; i < this.worldLine.length ; i++)
        {
            this.worldLine[i][0] -= this.timeSinceFrameChange;
            mat4.multiplyVec4(rotation, this.worldLine[i]);
            mat4.multiplyVec4(rotation, this.pastVel[i]);
        }
        mat4.multiplyVec4(rotation, this.X0);
        mat4.multiplyVec4(rotation, this.V);
       
        this.timeSinceFrameChange = 0;
        this.update();
        //Boost both velocity and position vectors using the boost matrix.

        //Point is now at wrong time
        

        //Find displacement to current time.
//        quat4.scale(this.V, -this.X0[0] / this.V[0], this.uDisplacement);
        
        //Bring to current time.
//        quat4.add(this.X0, this.uDisplacement);
//        this.tau += this.uDisplacement[0] / this.V[0];
        
        // Translate.
//        quat4.subtract(this.X0, translation);
        this.calcPast();
    }
   
    //This function is a bit esoteric. It works because we can calculate r(t).
    //The dot product projects the velocity in the current frame onto the position.
    //Divide by radius and gamma because we were working with four-velocity, 
    //this gives radial velocity.
    //write r(t)=r0+v_r*t=a point on the light cone=ct
    //rearrange for t to find the time.
    //Then we project the particle back into its past and draw it there.
    // The 0.00000001s are kludge to stop divide by 0.
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
    

    // MeasureDisplacementFrame. Measures the displacement between two events.
    // In the frame of this object. 
    // Note: a.measureDisplacementInFrame(b.COM.X0,c.COM.X0) will not measure the
    // Distance between two objects as seen by a
    //  as those events are not synchronous in the frame of a.
    this.measureDisplacementInFrame = function(event1, event2)
    {
        // Store working.
        var temp1 = quat4.create();
        var temp2 = quat4.create();
        // Find velocity for boost matrix.
        boostBetween = cBoostMat(quat4.scale(this.V, 1 / this.V[0], tempQuat4));

        // Find events in frame of this inertialObject.
        quat4.multiply(boostBetween, event1, temp1);
        quat4.multiply(boostBetween, event2, temp2);
 
        //Find the displacement between them in frame of this inertialObject.
        quat4.subtract(temp2,temp1);
        return temp2;
    } 

}


//Generates an approximation of a main sequence star. 
//Luminosity is in units 10^Lum*1 solar luminosity=Luminosity in watts.
function testStar(X, P, Lum)
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
        if( (showVisualPos || showFramePos) &&
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
            if (displayTime) g.fillText(Math.floor(this.COM.tau / timeScale / 1000) + ", " + Math.floor(this.COM.X0[0] / timeScale /1000),
                       this.COM.X0[1] / zoom + HWIDTH + 10,
                       this.COM.X0[2] / zoom + HHEIGHT);

        }
 
    }
      this.COM = new pathObject(X, P, 1, 1, 100);
}


