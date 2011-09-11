// These do not change with time.
// Instead everything is moved to the current time for transformations, then moved back.


// Takes pts -- an array of events
// params -- an array of invariants that classify the motion between one event and the next.
function pathObject(pts, params) {
    // Anchor points. Events are calculated forward from the nearest.
    // According to whatever function is associated.
    this.tau = 0;
    this.motionPts          = [];
    this.motionPts[0]       = quat4.create(pts[0]);
    // Invariant parameters characterising the motion.
    // Includes type of motion and characteristics of it ie. proper acceleration, evt horizon
    // or position according to some frame.
    this.motionParams       = [];
    this.motionParams[0] = {
        refPt   : quat4.create([0,0,0,0]),
        refPt0   : quat4.create([-Math.pow(c, 1) / Math.pow(params[0].alpha, 1),0,0,0]),
        refV    : quat4.create([0,0,0,c]),
        refTau  : 0,
        alpha   : params[0].alpha,
        coeffs  : this.calcHypCoeff(c, params[0].alpha, params[0].rot),
        type    : params[0].type
    };
    this.timeVec = quat4.create([0,0,0,0]);
    this.pos = quat4.create(pts[0]);
    this.boostMat = [];
    this.boostMatInv = [];
    this.V   = quat4.create([0,0,0,c]);
    this.pastPos = quat4.create(pts[0]);
    this.pastV   = quat4.create([0,0,0,c]);
    this.refWorldLine = new inertialObject(quat4.create([  -Math.pow(c, 1) / Math.pow(params[0].alpha, 1)   ,0,0,0]),quat4.create([0,0,0,c]),1);
};
pathObject.prototype = {

    update: function(timeStep) {
       this.refWorldLine.updateX0(timeStep); 
       // TODO: Make this so it's not horrible for GC.
       this.boostMat = cBoostMat(this.refWorldLine.V,c);
       this.boostMatInv = cBoostMatInv(this.refWorldLine.V,c);

       this.pos = this.hypEvt(this.getPathTau(this.motionParams[0],-this.refWorldLine.initialPt[3]),
                              this.motionParams[0].alpha,
                              this.motionParams[0].coeffs,
                              this.pos);
       quat4.add(this.pos,this.refWorldLine.initialPt);
    },
    draw: function(scene) {
        scene.g.beginPath();
//        scene.g.arc(this.refWorldLine.initialPt / scene.zoom + scene.origin[0],
//                    -this.refWorldLine.initialPt / scene.zoom + scene.origin[2],10,0,twopi,true);
         scene.g.arc(this.pos[0] / scene.zoom + scene.origin[0],
                    -this.pos[1] / scene.zoom + scene.origin[2],10,0,twopi,true);
       
        scene.g.closePath();
        scene.g.fill();
        scene.g.fillText(this.pos[0]+' '+ this.pos[1]+' '+this.pos[3],100,110);
        scene.g.fillText(this.timeVec[0]+' '+ this.timeVec[1]+' '+this.timeVec[3],100,130);
    },
    getPathTau: function(Params, t) {
        var a = Params.coeffs[0][3];
        var b = Params.coeffs[1][3];
        return Math.log((t+Math.sqrt(t*t-4*a*b))/(2*a))/Params.alpha;
    },
    changeFrame: function(translation1,rotation,translation2) {
        this.refWorldLine.changeFrame(translation1,rotation,translation2);
        for(var i = 0;i<this.motionParams[0].coeffs.length;i++) {
            mat4.multiplyVec4(rotation,this.motionParams[0].coeffs[i]);
        }
    },
    // hypEvt. Produces an event corresponding to hyperbolic motion.
    // dest represents the vector c^4/alpha^2 [cosh(alpha*tau),0,0,sinh(alpha*tau)]
    // rotated onto the frame defined by coeffs.
    hypEvt: function(tau, alpha, coeffs, dest){
        // Calculate three vectors that define a hyperbolic trajectory.
        // The first to are the coefficients of the +tau and -tau exponential terms.
        // The last is a translation from the event horizon.
        var e1 = Math.exp(tau*alpha);
        var e2 = 1/e1; 
        //Multiply relevant coefficient components w/ exp(rho) and exp(-rho).
        dest[0]  = e1 * coeffs[0][0] + e2 * coeffs[1][0];
        dest[1]  = e1 * coeffs[0][1] + e2 * coeffs[1][1];
        dest[2]  = e1 * coeffs[0][2] + e2 * coeffs[1][2];
        dest[3]  = e1 * coeffs[0][3] + e2 * coeffs[1][3];
        return dest;
    },

    // CalcHypCoeff: takes invariants, and a matrix to produce
    // eigenvectors which map the eigenvalues e^(rho), e^(-rho) and 1
    // to an event.
    calcHypCoeff: function(c,alpha,rot){
        var base = Math.pow(c, 1) / Math.pow(alpha, 1) * 0.5;
        var hypCoeffs = [[rot[0] * base + rot[12] * base, 
                          rot[1] * base + rot[13] * base, 
                          rot[2] * base + rot[14] * base,
                          rot[3] * base + rot[15] * base],
                         [rot[0] * base - rot[12] * base, 
                          rot[1] * base - rot[13] * base, 
                          rot[2] * base - rot[14] * base,
                          rot[3] * base - rot[15] * base]];
               // The ones come from centering around a pt where obj is stationary.
        return hypCoeffs;
    }



};
