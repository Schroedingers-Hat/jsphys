"use strict";

/**
 * Creates a new inertialObject with the given X coordinate, momentum, and mass.
 */
function inertialObject(X, P, m, endPt) {
    // The 4-vector position of the object in the current reference frame
    this.X0 = quat4.create(X);
    
    // The current visible position of the object -- that is, if I'm at the 
    // origin of the current reference frame, where do objects appear to be?
    this.XView = quat4.create();
    
    // Velocity (dX/dt?)
    this.V = quat4.scale(quat4.create(P), 1 / m); 
    
    // The initial (t=0) 4-position of the object in the current reference frame
    this.initialPt = quat4.create(X);

    // 4-position of the object's ending point, used when drawing its worldline.
    // initialPt is stored for all objects, but endPt is optional.
    // TODO: Allow given velocity to be ignored if an endPt is supplied.
    if (endPt) this.endPt = endPt;
    
    // Position and time of the intersection of the future light cone and this 
    // object's worldline.
    this.XFut = quat4.create();
    this.tauFut = 0;
    this.futTime = 0;
    
    // Time of the intersection of the past light cone and this object's worldline
    this.tauPast = 0;
    this.viewTime = 0;

    // Relativistic velocity, or momentum/mass.
    genEnergy(this.V, c, m);
    
    // A temporary variable used for computing the displacement of the object
    // for each timeStep, or in a new reference frame
    this.displace = quat4.create();
    
    // Proper time of this object.
    this.initialTau = 0;
    this.tau = 0;
    
    // The radial XView velocity past the origin, used for Doppler shifting
    this.radialVPast = 0;
    this.radialVFut = 0;
}

inertialObject.prototype.updateX0 = function(timeStep) {
    // Compute the distance we must move the object to bring it to "now".
    // V[3] is essentially gamma, so we dilate the timeStep by gamma and
    // multiply V by the result, giving us the total distance to travel.
    quat4.scale(this.V, timeStep / this.V[3], this.displace);
    
    // Increase our proper time.
    this.tau += timeStep / this.V[3] * c;
    
    // Bring it to now.
    quat4.add(this.X0, this.displace);
    
    // Shift our time coordinate ahead by timeStep.
    this.X0[3] -= timeStep;
    this.initialPt[3] -= timeStep;
    if (this.endPt) this.endPt[3] -= timeStep;
};

// Shift the reference frame by translation1, boost by rotation, then shift again
// with translation2
inertialObject.prototype.changeFrame = function(translation1, rotation, translation2) {
    // Translate.
    quat4.subtract(this.X0, translation1);
    
    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.V);
    
    // Handle the same translation and boost with initial and ending locations.
    quat4.subtract(this.initialPt, translation1);
    mat4.multiplyVec4(rotation, this.initialPt);

    if (this.endPt) {
        quat4.subtract(this.endPt, translation1);
        mat4.multiplyVec4(rotation, this.endPt);
    } 

    // Point is now at wrong time.
    // Find displacement to current time.
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.displace);
    
    // Bring to current time.
    quat4.add(this.X0, this.displace);
    this.tau += this.displace[3] / this.V[3] * c;
    if (translation2) {
        quat4.subtract(this.X0, translation2);
        // Wrong time again.
        // Find displacement to current time.
        quat4.scale(this.V, -this.X0[3] / this.V[3], this.displace);
    
        // Bring to current time.
        quat4.add(this.X0, this.displace);
        this.tau += this.displace[3] / this.V[3] * c;

        // Translate initial and ending locations by the same amount.
        quat4.subtract(this.initialPt, translation2);
        if (this.endPt) quat4.subtract(this.endPt, translation2);
    }
};

// Solve for intersection of world line with light cone.
// Does future cone too for now. May be a good idea to rename it at some point.
inertialObject.prototype.calcPast = function() {
    var vDotv = quat4.spaceDot(this.V, this.V) / Math.pow(this.V[3] / c, 2);
    var xDotx = quat4.spaceDot(this.X0, this.X0);
    var vDotx = quat4.spaceDot(this.X0, this.V) / this.V[3] * c;
    var a = (c*c - vDotv);
    var timeSqrt;
    if (xDotx === 0) {
        this.radialVPast = 0;
        this.viewTime = 0;
        quat4.set(nullQuat4,this.XView);
        this.tauPast = this.tau;
        this.futTime = 0;
        this.tauFut = this.tau;
        quat4.set(nullQuat4,this.XFut);
        return;
    }

    timeSqrt = Math.sqrt(Math.pow(vDotx,2) + a * xDotx) ;

    this.viewTime = -(vDotx - timeSqrt) / a * c ;
    quat4.scale(this.V, this.viewTime / this.V[3], this.displace);
    quat4.subtract(this.X0, this.displace, this.XView);
    
    var rPast = Math.sqrt(Math.max(quat4.spaceDot(this.XView, this.XView), 1e-10)); 
    this.radialVPast = (quat4.spaceDot(this.XView, this.V) / 
                        Math.max(rPast, 1e-10) / this.V[3] * c);
    this.tauPast = this.tau - this.displace[3]/this.V[3] * c;

    this.futTime = -(vDotx + timeSqrt) / a * c;
    
    quat4.scale(this.V, this.futTime / this.V[3], this.displace);
    quat4.subtract(this.X0, this.displace, this.XFut);
    
    this.tauFut = this.tau - this.displace[3] / this.V[3] * c;
};
