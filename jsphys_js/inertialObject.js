// inertialObject Class    
function inertialObject(X, P, m)
{
    this.init = function(timeStep, label)
    {
        this.label = label
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

    this.updateX0 = function(timeStep)
    {   
        quat4.scale(this.V, timeStep / this.V[0], this.displace);
	    //Increase proper time.
        this.tau += timeStep / this.V[0];
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
        quat4.scale(this.V, -this.X0[0] / this.V[0], this.uDisplacement);
        
        //Bring to current time.
        quat4.add(this.X0, this.uDisplacement);
        this.tau += this.uDisplacement[0] / this.V[0];
        
        // Translate.
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
        boostBetween = cBoostMat(quat4.scale(this.V, 1 / this.V[0], tempVec3));

        // Find events in frame of this inertialObject.
        quat4.multiply(boostBetween, event1, temp1);
        quat4.multiply(boostBetween, event2, temp2);
 
        //Find the displacement between them in frame of this inertialObject.
        quat4.subtract(temp2,temp1);
        return temp2;
    } 

    // findPosition: finds the current position of an object in the frame of this one.
    this.findPosition = function(object)
    {
         var tempVel = quat4.create();
         var tempPos = quat4.create();
         thisBoost = cBoostMat(quat4.scale(this.V, 1 / this.V[0], tempVec3));
         quat4.multiply(thisBoost, object.X0, tempPos);
         quat4.multiply(thisBoost, object.V, tempVel);
         quat4.add(tempPos, quat4.scale(tempVel, -1 / tempVel[0] * tempPos[0]));
         return tempPos;
    }
    

    // TODO: findViewedPosition, where this thinks another object is.
    // May be worth doing a full frame change if we need this.
}


//Generates an approximation of a main sequence star. 
//Luminosity is in units 10^Lum*1 solar luminosity=Luminosity in watts.
function mainSequenceStar(X, P, label, options)
{
    if (typeof options.lum == "number") {
        var Lum = options.lum;
    } else {
        var Lum = 1;
    }

    this.label = label;

    //Aesthetic reasons only. 
    //If any 3D images are rendered Lum will be more useful
    this.r = Math.sqrt(Lum) * 10; 
    
    //Very rough approximation of main sequence lum/temp relation.
    //You can read this off of a HR diagram.
    this.temp = Math.pow(10, (3.45 + Lum / 10)); 
    //TODO: Add the mass and radius relations here.
    this.draw = function(scene)
    {
        if(scene.showVisualPos &&
           this.COM.XView[1] / scene.zoom < (scene.hwidth + 10)   &&
           this.COM.XView[2] / scene.zoom < (scene.hheight + 10)  &&
           this.COM.XView[1] / scene.zoom > (-scene.hwidth - 10)  &&
           this.COM.XView[2] / scene.zoom > (-scene.hheight - 10) &&
           this.r / scene.zoom > 0.3)
        {
            if(scene.showDoppler)
            {
                scene.g.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                            this.COM.radialVPast,
                                                            this.COM.V[0]));
            }
            else
            {
                scene.g.fillStyle = tempToColor(this.temp);
            }
            scene.g.beginPath();
            scene.g.arc(this.COM.XView[1] / scene.zoom + scene.hwidth, 
                  this.COM.XView[2] / scene.zoom + scene.hheight, 
                  this.r / scene.zoom, 0, twopi, true);
            scene.g.closePath();
            scene.g.fill();
            
            if (scene.displayTime) {
                scene.g.fillText(Math.floor((this.COM.tau - (this.COM.viewTime)) / timeScale / 1000),
                                 this.COM.XView[1] / scene.zoom + scene.hwidth + 10,
                                 this.COM.XView[2] / scene.zoom + scene.hheight);
            }
            if (this.label != "") {
                scene.g.fillText(this.label, this.COM.XView[1] / scene.zoom + scene.hwidth + (this.r / scene.zoom)  + 10,
                                 this.COM.XView[2] / scene.zoom + scene.hheight);
            }
        }

        if(scene.showFramePos &&
           this.COM.X0[1] / scene.zoom < (scene.hwidth + 10)   &&
           this.COM.X0[2] / scene.zoom < (scene.hheight + 10)  &&
           this.COM.X0[1] / scene.zoom > (-scene.hwidth - 10)  &&
           this.COM.X0[2] / scene.zoom > (-scene.hheight - 10) &&
           this.r / scene.zoom > 0.3)
        {
            scene.g.fillStyle = "#0f0"; 
            scene.g.beginPath();
            scene.g.arc(this.COM.X0[1] / scene.zoom + scene.hwidth, 
                  this.COM.X0[2] / scene.zoom + scene.hheight, 
                  this.r / scene.zoom, 0, twopi, true);
            scene.g.closePath();
            scene.g.fill();
            if (scene.displayTime) {
                scene.g.fillText(Math.floor(this.COM.tau / timeScale / 1000) + ", " + Math.floor(this.COM.X0[0] / timeScale /1000),
                       this.COM.X0[1] / scene.zoom + scene.hwidth + 10,
                       this.COM.X0[2] / scene.zoom + scene.hheight);
            }
        }
 
    }
    
    this.COM = new inertialObject(X, P, 1);
}


