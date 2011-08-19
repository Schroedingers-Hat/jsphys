// Object to handle preset paths in common types of motion.

// Takes pts -- an array of events
// params -- an array of invariants that classify the motion between one event and the next.
function pathObject(pts, params) {
    // Anchor points. Events are calculated forward from the nearest.
    // According to whatever function is associated.
    this.motionPts          = new Array();
    // Invariant parameters characterising the motion.
    // Includes type of motion and characteristics of it ie. proper acceleration, evt horizon
    // or position according to some frame.
    this.motionParams       = new Array();

    // Not quite sure what I'm doing here. Attempted to use object literals.
    // Not sure if this whole structure is appropriate use, or whether I should only use it for coeffs.
    this.motionParams[0]    = {
        // Matrix to rotate initial motion, in case object needs to be initially moving
        // independantly of other motionPts or in dir other than x axis.
        rot         : mat4.create([1,0,0,0
                                   0,1,0,0
                                   0,0,1,0
                                   0,0,0,1]),
        // Different types of motion may need type-specific checks.
        alpha : 0.001,
        type        : 0,
        calcCoeffs: function(c,alpha, rot){
            var base = Math.pow(c, 4) / Math.pow(alpha, 2) * 0.5;
            return {
            //Object literals are allegedly faster than arrays. 
            //(mostly GC when they go out of scope?)
            xa : rot[0] * base + rot[12] * base,
            ya : rot[1] * base + rot[13] * base,
            za : rot[2] * base + rot[14] * base,
            ta : rot[3] * base + rot[15] * base,
            xb : rot[0] * base - rot[12] * base,
            yb : rot[1] * base - rot[13] * base,
            zb : rot[2] * base - rot[14] * base,
            tb : rot[3] * base - rot[15] * base,
            // The ones come from centering around a pt where obj is stationary.
            xc : rot[0] * 2 * base,
            yc : rot[1] * 2 * base,
            zc : rot[2] * 2 * base,
            tc : rot[3] * 2 * base
            };
        //TODO: Put these....somewhere. 
        }:

        // Eventually we want a variety of functions available.
        // TODO: Could also generate tangent to motion, or other vector
        // that defines the facing of the object.
        // This may, in fact, be needed, as the lorentz group is only closed
        // under boost+rotation.
        motionFn    : function(tau1, tau0,  coeffs, dest){
            // Confusing, but fast calculation of c^4/alpha^2 * sinh and cosh (rho).
            // For calculation of hyperbolic path in rest frame where acceleration is on the
            // X axis (and object is at rest at 0,0,0,0).
            // sinh and cosh are broken down into (e^tau*alpha) etc and multiplied 
            // by three pre-calculated vectors which correspond to boosts/rotations
            var e1 = exp((tau1 - tau0)*alpha);
            var e2 = 1 / t1;
            //Multiply relevant coefficient components w/ exp(rho) and exp(-rho).
            des[0]  = e1 * coeffs.xa + e2 * coeffs.xb + coeffs.xc;
            des[1]  = e1 * coeffs.ya + e2 * coeffs.yb + coeffs.yc;
            des[2]  = e1 * coeffs.za + e2 * coeffs.zb + coeffs.zc;
            des[3]  = e1 * coeffs.ta + e2 * coeffs.tb + coeffs.tc;
            return dest;
        };
    };
    // Matrices to take invariant parameters and map them to the current frame.
    this.motionMats     = mat4.create();
    // Vector for similar use.
    this.motionCoeffs      = new Array();
    // Hold current position.
    this.pos            = quat4.create([0,0,0,0]);
    this.V              = quat4.create([0,0,0,0]);
    // Past position
    this.pastPos        = quat4.create([0,0,0,0]);
    this.pastV          = quat4.create([0,0,0,0]);
};


// Given a time, find an event.
// Finds proper time, then the anchor event preceeding that proper time.
// Calculates displacement from anchor point, then finally returns the event.
pathObject.prototype.findEvt = function(time, pos){
    var idx = this.findIdx(time);
    var tau = this.findTau(time,idx);
    // Adds reference point to 
    return quat4.add(
        this.motionPts[idx], 
        this.motionParams[idx].motionFn(tau, this.motionMats[idx], this.motionPts[idx]),
        pos);
};

pathObject.prototype.findTau = function(time,idx){
    var t1 = time;
    var idx = 0;
    //Need various cases for motion types defined here.
    if (this.motionParams[idx].type == 0){
    // Invert X[3](tau). This is one of many things that will break if I have the wrong hyperbola
    // Or allow space-like intervals.
    return Math.log( 
            (Math.sqrt(t*t - 4*this.coeffs[idx].ta*this.coeffs[idx].tb) + t) / 
            (2 * this.coeffs[idx].ta)) / 
        this.motionParams[idx].alpha;
    };
};

pathObject.prototype.findIdx = function(time){
    //Do a binary search over the anchor points
    // We only have one so far, so not needed yet.
    return 0;
};

pathObject.prototype.findLightCone = function(){
    //Similar solution to findTau works here, too.
    //Then we can develop some tricks for V etc.
};

pathObject.prototype.findV = function(tau){

};

