"use strict";

/**
 * Create a new photon. Takes an initial position X and a 3-velocity V,
 * which will be rescaled to have a magnitude of c.
 */
function photon(X, V, label, options) {
    this.options = options;
    this.X0 = X;
    this.rPast = 1;
    if (this.options.fired) this.fired = this.options.fired;
    else this.fired = false
    this.XView = quat4.create();
    this.V = V;
    this.nonTimeLike = true;
    this.initialPt = quat4.create(X);
    if (this.options.endPt){
        this.endPt = quat4.create(this.options.endPt);
        this.endPt[3] = Math.sqrt(quat4.spaceDot(quat4.subtract(this.endPt, this.initialPt, tempQuat4), tempQuat4)) + this.initialPt[3];
        quat4.subtract(this.endPt, this.initialPt, this.V);
    }
    /**
     * Normalize V such that V[3] = c and V[3]^2-V[2]^2-V[1]^2-V[0]^2 = 0
     * (i.e. |V| (including the metric) is 0)
     * Note that this means V represents dX/dt not dX/dtau in this case, as each
     * Component of dX/dtau would be infinite.
     */
    this.V[3] = c;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));
    this.displace = quat4.create();

    this.tau = 0;

    this.uDisplacement = quat4.create();
    this.displace = quat4.create();
    this.viewTime = 0;
    this.radialVPast = 0;
    quat4.scale(this.V, -this.X0[3]/c, this.displace);

    // Bring it to now.
    quat4.add(this.X0, this.displace);

}

photon.prototype.update = function(timeStep) {
    // Bring it to now.
    quat4.scale(this.V, timeStep/c, this.displace);
    quat4.add(this.X0, this.displace);
    // Move it back in time one timeStep (so we go forward in time.
    this.X0[3] = this.X0[3] - timeStep * this.V[3]/c;
    this.initialPt[3] = this.initialPt[3] - timeStep * this.V[3]/c;
    // If there's an end point, move that back in time, too.
    if(this.endPt) this.endPt[3] = this.endPt[3] - timeStep * this.V[3]/c;
};

photon.prototype.changeFrame = function(translation1, rotation, translation2) {
    // Translate.
    quat4.subtract(this.X0, translation1);
    quat4.subtract(this.initialPt, translation1);
    if(this.endPt)  quat4.subtract(this.endPt, translation1);

    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.initialPt);
    if (this.endPt) mat4.multiplyVec4(rotation, this.endPt);
    mat4.multiplyVec4(rotation, this.V);

    // Renormalize this.V.
    // The photon traces a null path, so the four-magnitude of its velocity should be zero.
    this.V[3] = c;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));

    // Point is now at wrong time. Find displacement to current time.
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);

    // Bring to current time.
    quat4.add(this.X0, this.uDisplacement);
    if ( translation2) {
        quat4.subtract(this.X0, translation2);
        // Point is now at wrong time. Find displacement to current time.
        quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);

        // Bring to current time.
        quat4.add(this.X0, this.uDisplacement);
        // Wrong time again;
        quat4.subtract(this.initialPt, translation2);
        if(this.endPt) quat4.subtract(this.endPt, translation2);
    }
};

photon.prototype.draw = function(scene) {
    // Only makes sense to display if we're showing the current position.
    if (scene.options.alwaysShowFramePos || 
        (this.options.showFramePos && !scene.options.neverShowFramePos)) {
        if (this.endPt){
            if ( (this.initialPt[3] < 0) && (this.endPt[3] > 0)){
                this.drawNow(scene);
                if (this.options.showCircle) this.drawCircle(scene);
            }
        } else {
            if (this.initialPt[3] < 0){
                this.drawNow(scene);
                if (this.options.showCircle) this.drawCircle(scene);
            }
        }
    }
    this.drawXT(scene);
    if(scene.options.alwaysShowVisualPos) this.drawPast(scene);
};

photon.prototype.drawXT = function(scene) {
    var xvis  = this.initialPt[0] / scene.zoom;
    var tvis  = this.initialPt[3] / scene.zoom / c;
    if(this.endPt){
        var xvisE  = this.endPt[0] / scene.zoom;
        var tvisE  = this.endPt[3] / scene.zoom / c;
    }

    var xyScale = scene.mWidth / scene.mHeight;
    var dxdtVis = this.V[0] / this.V[3] * c;
    var tOfLinet = scene.origin[2];
    var tOfLinex = tOfLinet * dxdtVis + this.X0[0] / scene.zoom;
    var bOfLinet = -(scene.height + scene.origin[2]);
    var bOfLinex = bOfLinet * dxdtVis + this.X0[0] / scene.zoom;

    scene.h.strokeStyle = "#fff";
    scene.h.fillStyle = "#fff";

    // A world Line.
    if ( -tvis + scene.origin[2] > 0) {
        if ( (-tvis + scene.origin[2]) < scene.mHeight) {
            // A dot at its creation.
            scene.h.beginPath();
            scene.h.arc(xvis + scene.origin[0],
                       -tvis + scene.origin[2],
                        3,0,twopi,true);
            scene.h.fill();
            scene.h.beginPath();
            scene.h.moveTo(xvis + scene.origin[0],
                          -tvis + scene.origin[2]);

        } else {
            scene.h.beginPath();
            scene.h.moveTo(bOfLinex + scene.origin[0],
                          -bOfLinet + scene.origin[2]);
        }
        if ( (-tvisE + scene.origin[2]) >0){
            // A dot at its destruction.
            scene.h.lineTo(xvisE + scene.origin[0],
                          -tvisE + scene.origin[2]);
            scene.h.stroke();
            scene.h.beginPath();
            scene.h.arc(xvisE + scene.origin[0],
                       -tvisE + scene.origin[2],
                        3,0,twopi,true);
            scene.h.fill();
        } else  {
            scene.h.lineTo(tOfLinex + scene.origin[0],
                          -tOfLinet + scene.origin[2]);
            scene.h.stroke();
        }
    }
};

photon.prototype.drawNow = function(scene) {
    if (this.initialPt[3] < 0){
        scene.g.fillStyle = "#fff";
        scene.g.beginPath();
        scene.g.arc(this.X0[0] / scene.zoom + scene.origin[0],
                    -this.X0[1] / scene.zoom + scene.origin[1],
                    2, 0, twopi,true);
        scene.g.fill();
    }
};

/**
 * For now just draw a little line the way the photon is going.
 * Solving for lightcone intersection may produce NaNs and infinities, so I'd
 * Need to account for that.
 */
photon.prototype.drawPast = function(scene) {
    if ((Math.sqrt(Math.abs(quat4.spaceTimeDot(this.X0, this.X0))) < 20) &&
        this.fired) {
        scene.g.strokeStyle = "#fff";
        scene.g.moveTo(scene.origin[0],scene.origin[1]);
        scene.g.lineTo(this.X0[0] / scene.zoom + scene.origin[0],
                       -this.X0[1] / scene.zoom + scene.origin[1]);
        scene.g.stroke();
    }
}

photon.prototype.drawCircle = function(scene) {
    scene.g.strokeStyle = "#fff";
    scene.g.beginPath();
    scene.g.arc(this.initialPt[0] / scene.zoom + scene.origin[0],
               -this.initialPt[1] / scene.zoom + scene.origin[1],
                Math.max(0, -this.initialPt[3])  / scene.zoom, 0, twopi, true);
    scene.g.stroke();
};

photon.prototype.getFut = function() {
    return Infinity;
};