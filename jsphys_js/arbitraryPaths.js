// Object to handle preset paths in common types of motion.

// Takes pts -- an array of events
// params -- an array of invariants that classify the motion between one event and the next.
function pathObject(pts, params) {
    // Anchor points. Events are calculated forward from the nearest.
    // According to whatever function is associated.
    this.motionPts          = [];
    this.motionPts[0]       = quat4.create(pts[0]);
    // Invariant parameters characterising the motion.
    // Includes type of motion and characteristics of it ie. proper acceleration, evt horizon
    // or position according to some frame.
    this.motionParams       = [];
    this.motionParams[0] = {
        alpha   : params[0].alpha,
        coeffs  : new calcHypCoeff(c, params[0].alpha, params[0].rot),
        type    : params[0].type
    };
    this.pos = quat4.create(pts[0]);
    this.V   = quat4.create([0,0,0,c]);
    this.pastPos = quat4.create(pts[0]);
    this.pastV   = quat4.create([0,0,0,c]);

};

pathObject.prototype.draw = function(time, scene){
    this.pos = this.findEvt(time, this.pos);
    var xvis = this.pos[0] / scene.zoom;
    var yvis = this.pos[1] / scene.zoom;
       scene.g.fillStyle = "rgba(0, 256, 0, 0.5)"; 
        scene.g.beginPath();
        scene.g.arc(xvis + scene.origin[0], 
              yvis + scene.origin[1], 
              5 / scene.zoom, 0, twopi, true);
        scene.g.closePath();
        scene.g.fill();

}

// Given a time, find an event.
// Finds proper time, then the anchor event preceeding that proper time.
// Calculates displacement from anchor point, then finally returns the event.
pathObject.prototype.findEvt = function(time, pos){
    var idx = this.findIdx(time);
    var tau = this.findTau(time,idx);
    // Adds reference point to 
    return quat4.add(
        this.motionPts[idx], 
        hypEvt(tau, this.motionParams[idx].alpha, this.motionParams[idx].coeffs, pos),
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
            (Math.sqrt(t1*t1 - 4 * this.motionParams[0].coeffs.a[3] * 
                            this.motionParams[0].coeffs.b[3]) + t1) / 
            (2 * this.motionParams[0].coeffs.a[3])) / 
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



// hypEvt. Produces an event corresponding to hyperbolic motion.
// dest represents the vector c^4/alpha^2 [cosh(alpha*tau),0,0,sinh(alpha*tau)]
// rotated onto the frame defined by coeffs.
function hypEvt(tau, alpha, coeffs, dest){
    var e1 = Math.exp(tau*alpha);
    var e2 = 1/e1; 
    //Multiply relevant coefficient components w/ exp(rho) and exp(-rho).
    dest[0]  = e1 * coeffs.a[0] + e2 * coeffs.b[0] + coeffs.c[0];
    dest[1]  = e1 * coeffs.a[1] + e2 * coeffs.b[1] + coeffs.c[1];
    dest[2]  = e1 * coeffs.a[2] + e2 * coeffs.b[2] + coeffs.c[2];
    dest[3]  = e1 * coeffs.a[3] + e2 * coeffs.b[3] + coeffs.c[3];
    return dest;
};

// CalcHypCoeff: takes invariants, and a matrix to produce
// eigenvectors which map the eigenvalues e^(rho), e^(-rho) and 1
// to an event.
function calcHypCoeff(c,alpha,rot){
    var base = Math.pow(c, 4) / Math.pow(alpha, 2) * 0.5;
    return {
    //Object literals are allegedly faster than arrays. 
    //(mostly GC when they go out of scope?)
    a : [rot[0] * base + rot[12] * base, 
         rot[1] * base + rot[13] * base, 
         rot[2] * base + rot[14] * base,
         rot[3] * base + rot[15] * base],
    b : [rot[0] * base - rot[12] * base, 
         rot[1] * base - rot[13] * base, 
         rot[2] * base - rot[14] * base,
         rot[3] * base - rot[15] * base],
   // The ones come from centering around a pt where obj is stationary.
    c : [-rot[0] * 2 * base,
         -rot[1] * 2 * base,
         -rot[2] * 2 * base,
         -rot[3] * 2 * base]
    };
};
