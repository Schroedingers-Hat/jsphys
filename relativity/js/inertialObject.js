// Timelike is component 3, c ready

"use strict";

/**
 * Creates a new inertialObject with the given X coordinate, momentum, and mass.
 *
 * Public member variable reference:
 * - X0 is the current 4-vector position of the object in the current reference
 *   frame.
 * - XView is the current visible position of the object -- that is, from the
 *   current reference frame, what light would be reaching us now, and where
 *   would the object appear to be?
 * - tau is the proper time of this object.
 * - V is the velocity (dX/dt?)
 * - radialVPast is the radial XView velocity past the origin, used for Doppler
 *   shifting.
 */
function inertialObject(X, P, m, endPt)
{
    this.X0 = X;
	this.initialPt = quat4.create(X);
    this.rPast = 1;
	this.initialTau = 0;
    this.rFut = 1;
    // TODO: Allow given velocity to be ignored if an endPt is supplied.
    if (endPt) this.endPt = endPt;
    this.XView = quat4.create();
    this.XFut = quat4.create();
    this.V = quat4.scale(P, 1 / m); 
    // Relativistic velocity, or momentum/mass.
    genEnergy(this.V, c, m);
    this.displace = quat4.create([0, 0, 0, 0]);
    this.tau = 0;
    this.tauPast = 0;
    this.tauFut = 0;
    this.uDisplacement = quat4.create();
    this.viewTime = 0;
    this.futTime = 0;
    this.radialVPast = 0;
    this.radialVFut = 0;
}

inertialObject.prototype.updateX0 = function(timeStep)
{
    quat4.scale(this.V, timeStep / this.V[3], this.displace);
    //Increase proper time.
    this.tau += timeStep / this.V[3] * c;
    //Bring it to now.
    quat4.add(this.X0, this.displace);
    this.X0[3] = this.X0[3] - timeStep;
    if (this.initialPt) this.initialPt[3] -= timeStep;
    if (this.endPt) this.endPt[3] -= timeStep;
};

inertialObject.prototype.changeFrame = function(translation1, rotation, translation2)
{
    // Translate.
    quat4.subtract(this.X0, translation1);
    quat4.subtract(this.initialPt, translation1);

    if (this.endPt) {
        quat4.subtract(this.endPt, translation1);
        mat4.multiplyVec4(rotation, this.endPt);
    } 
    //Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.V);
    if (this.initialPt) mat4.multiplyVec4(rotation, this.initialPt);

    //Point is now at wrong time
    
    //Find displacement to current time.
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);
    
    //Bring to current time.
    quat4.add(this.X0, this.uDisplacement);
    this.tau += this.uDisplacement[3] / this.V[3] * c;
    if (translation2) {
        quat4.subtract(this.X0, translation2);
        //Wrong time again.
        //Find displacement to current time.
        quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);
    
        //Bring to current time.
        quat4.add(this.X0, this.uDisplacement);
        this.tau += this.uDisplacement[3] / this.V[3] * c;

        if (this.initialPt) quat4.subtract(this.initialPt, translation2);
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
        this.viewTime = 0
        quat4.set(nullQuat4,this.XView);
        this.tauPast = this.tau;
        this.futTime = 0;
        this.tauFut = this.tau;
        quat4.set(nullQuat4,this.XFut);
        return;
    }

    timeSqrt = Math.sqrt(Math.pow(vDotx,2) + a * xDotx) ;

    this.viewTime = -(vDotx - timeSqrt) / a * c ;
    quat4.scale(this.V, this.viewTime / this.V[3], this.uDisplacement);
    quat4.subtract(this.X0, this.uDisplacement, this.XView);
    
    this.rPast = Math.sqrt(Math.max(quat4.spaceDot(this.XView, this.XView), 1e-10)); 
    this.radialVPast = (quat4.spaceDot(this.XView, this.V) / 
                        Math.max(this.rPast,1e-10) / this.V[3] * c);
    this.tauPast = this.tau - this.uDisplacement[3]/this.V[3] * c;

    this.futTime = -(vDotx + timeSqrt ) / a * c;
    
    quat4.scale(this.V, this.futTime / this.V[3], this.uDisplacement);
    quat4.subtract(this.X0, this.uDisplacement, this.XFut);
    
    this.tauFut = this.tau - this.uDisplacement[3]/this.V[3] * c;
};


