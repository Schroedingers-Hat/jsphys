"use strict";

/**
 * Create a new photon. Takes an initial position X and a 3-velocity V,
 * which will be rescaled to have a magnitude of c.
 */
function photon(X, V, label, options) {
    this.options = options;
    this.label = label;
    if (this.options.wavelength) {
        this.wavelength = this.options.wavelength;
    } else {
        this.wavelength = 680;
    }

    this.X0 = quat4.create(X);
    this.rPast = 1;
    if (this.options.fired) {
        this.fired = this.options.fired;
    } else {
        this.fired = false;
    }
    this.XInt = quat4.create();
    this.V = quat4.create(V);
    this.nonTimeLike = true;
    this.initialPt = quat4.create(X);
    if (this.options.endPt) {
        this.endPt = quat4.create(this.options.endPt);
        this.endPt[3] = Math.sqrt(quat4.spaceDot(quat4.subtract(this.endPt, this.initialPt, tempQuat4), tempQuat4)) + this.initialPt[3];
        quat4.subtract(this.endPt, this.initialPt, this.V);
    }
    /**
     * Normalize V so it represents something akin to momentum
     * Is proportional to momentum with units of per metre for now.
     */
    this.V[3] = 1/this.wavelength;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));
    this.displace = quat4.create();

    this.uDisplacement = quat4.create();
    this.displace = quat4.create();
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.displace);

    // Bring it to now.
    quat4.add(this.X0, this.displace);
}

photon.prototype.update = function(timeStep) {
    // Bring it to now.
    quat4.scale(this.V, timeStep/this.V[3], this.displace);
    // No c needed here, the speed of light dependance comes from timeStep being in metres.
    quat4.add(this.X0, this.displace);
    // Move it back in time one timeStep (so we go forward in time and wind up at now)
    this.X0[3] = this.X0[3] - timeStep;
    this.initialPt[3] = this.initialPt[3] - timeStep;
    // If there's an end point, move that back in time, too.
    if(this.endPt) {
        this.endPt[3] = this.endPt[3] - timeStep;
    }
    this.calcLightCone();
};

/** 
 * Photons will at some point cross your light cone if vDotx != 0.
 * It's hard to classify what this means exactly, but one of the uses
 * is when and where you would see the reflection of a light beam.
 */
photon.prototype.calcLightCone = function() {
    var xDotx = quat4.spaceDot(this.X0, this.X0);
    var vDotx = quat4.spaceDot(this.X0, this.V) / c;
    
    if (vDotx === 0) {
        // I guess NaN would be the appropriate concept here, but ensuring it's 
        // positive Infinity will do for now.
        // Just so I can have a single case (XInt[3] > 0) for refusing to draw anything.
        this.XInt[0] = Infinity;
        this.XInt[1] = Infinity;
        this.XInt[2] = Infinity;
        this.XInt[3] = Infinity;
    }
   


    var intTime = -xDotx / (2 * vDotx); 
    
    // Assuming V is dX/dt
    quat4.add(this.X0, quat4.scale(this.V, intTime / c, tempQuat4), this.XInt);
};

photon.prototype.changeFrame = function(translation1, rotation, translation2) {
    // Translate.
    quat4.subtract(this.X0, translation1);
    quat4.subtract(this.initialPt, translation1);
    if(this.endPt) {
        quat4.subtract(this.endPt, translation1);
    }

    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.initialPt);
    if (this.endPt) {
        mat4.multiplyVec4(rotation, this.endPt);
    }
    mat4.multiplyVec4(rotation, this.V);

    // Renormalize this.V.
    // The photon traces a null path, so the four-magnitude of its velocity 
    // should be zero.
//    this.V[3] = c;
//    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));

    // Point is now at wrong time. Find displacement to current time.
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);

    // Bring to current time.
    quat4.add(this.X0, this.uDisplacement);
    if (translation2) {
        quat4.subtract(this.X0, translation2);
        // Point is now at wrong time. Find displacement to current time.
        quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);

        // Bring to current time.
        quat4.add(this.X0, this.uDisplacement);
        // Wrong time again;
        quat4.subtract(this.initialPt, translation2);
        if(this.endPt) {
            quat4.subtract(this.endPt, translation2);
        }
    }
};

photon.prototype.draw = function(scene) {
    // Only makes sense to display if we're showing the current position.
    if (scene.options.alwaysShowFramePos || 
        (this.options.showFramePos && !scene.options.neverShowFramePos)) {
        if (this.endPt) {
            if ((this.initialPt[3] < 0) && (this.endPt[3] > 0)) {
                this.drawNow(scene);
                if (this.options.showCircle) {
                    this.drawCircle(scene);
                }
            }
        } else {
            if (this.initialPt[3] < 0) {
                this.drawNow(scene);
                if (this.options.showCircle) {
                    this.drawCircle(scene);
                }
            }
        }
    }
    this.drawXT(scene);
    if(scene.options.alwaysShowVisualPos && this.XInt[3] < Infinity &&
       this.initialPt[3] < this.XInt[3] &&
       (!this.endPt || this.endPt[3] > this.XInt[3])) {
        this.drawPast(scene);
    }
};

photon.prototype.drawXT = function(scene) {
    var tvisE;
    var xvisE;
    var xvis  = this.initialPt[0] / scene.zoom;
    var tvis  = this.initialPt[3] / scene.timeZoom / c;
    if (this.endPt) {
        xvisE  = this.endPt[0] / scene.zoom;
        tvisE  = this.endPt[3] / scene.timeZoom / c;
    }

    var xyScale = scene.mWidth / scene.mHeight;
    var dxdtVis = this.V[0] / this.V[3] * c * scene.timeZoom / scene.zoom;
    var tOfLinet = scene.origin[2];
    var tOfLinex = tOfLinet * dxdtVis + this.X0[0] / scene.zoom;
    var bOfLinet = -(scene.height + scene.origin[2]);
    var bOfLinex = bOfLinet * dxdtVis + this.X0[0] / scene.zoom;

    scene.h.strokeStyle = "#fff";
    if (scene.debug) {
        scene.h.beginPath();
        scene.h.fillStyle = "#ff0";
        scene.h.arc(this.XInt[0] / scene.zoom + scene.origin[0],
                    -this.XInt[3] / c / scene.timeZoom + scene.origin[2],
                    2, 0, twopi, true);
        scene.h.arc(this.X0[0] / scene.zoom + scene.origin[0],
                    -this.X0[3] / c / scene.timeZoom + scene.origin[2],
                    2, 0, twopi, true);
        
        scene.h.fill();
    }
    scene.h.fillStyle = "#fff";
    
    // A world Line.
    if (-tvis + scene.origin[2] > 0) {
        if ((-tvis + scene.origin[2]) < scene.mHeight) {
            // A dot at its creation.
            scene.h.beginPath();
            scene.h.arc(xvis + scene.origin[0],
                       -tvis + scene.origin[2],
                        3, 0, twopi, true);
            scene.h.fill();
            scene.h.beginPath();
            scene.h.moveTo(xvis + scene.origin[0],
                          -tvis + scene.origin[2]);
        } else {
            scene.h.beginPath();
            scene.h.moveTo(bOfLinex + scene.origin[0],
                          -bOfLinet + scene.origin[2]);
        }
        if ((-tvisE + scene.origin[2]) > 0) {
            // A dot at its destruction.
            scene.h.lineTo(xvisE + scene.origin[0],
                          -tvisE + scene.origin[2]);
            scene.h.stroke();
            scene.h.beginPath();
            scene.h.fillStyle = "#f00";
            scene.h.arc(xvisE + scene.origin[0],
                       -tvisE + scene.origin[2],
                        3, 0, twopi, true);
            scene.h.fill();
        } else  {
            scene.h.lineTo(tOfLinex + scene.origin[0],
                          -tOfLinet + scene.origin[2]);
            scene.h.stroke();
        }
    }
};

photon.prototype.drawNow = function(scene) {
    if (this.initialPt[3] < 0) {
        // As you can't see or reflect light off of a photon, doppler shift in this context represents something a bit different.
        // In the unphysical view the photon is shown with the wavelength corresponding to its momentum in the current frame.
        // V is proportional to momentum in units of per meter for now.
        scene.g.fillStyle = wavelengthToColor(1/this.V[3]);
        scene.g.beginPath();
        scene.g.arc(this.X0[0] / scene.zoom + scene.origin[0],
                    -this.X0[1] / scene.zoom + scene.origin[1],
                    2, 0, twopi, true);
        scene.g.fill();
        if (this.label !== "") {
            scene.g.fillText(this.label, this.X0[0] / scene.zoom + scene.origin[0], 
                                        -this.X0[1] / scene.zoom + scene.origin[1] + 10);
        }
    }
};

photon.prototype.drawPast = function(scene) {
    if (this.XInt[3] < 0) {
        scene.g.beginPath();
        scene.g.fillStyle = "#00f";
        scene.g.arc(this.XInt[0] / scene.zoom + scene.origin[0],
                    -this.XInt[1] / scene.zoom + scene.origin[1], 
                    2, 0, twopi, true);
        scene.g.fill();
    }
};

photon.prototype.drawCircle = function(scene) {
    scene.g.strokeStyle = "#fff";
    scene.g.beginPath();
    scene.g.arc(this.initialPt[0] / scene.zoom + scene.origin[0],
               -this.initialPt[1] / scene.zoom + scene.origin[1],
                Math.max(0, -this.initialPt[3])  / scene.zoom, 0, 
                twopi, true);
    scene.g.stroke();
};

photon.prototype.getFut = function() {
    return Infinity;
};
