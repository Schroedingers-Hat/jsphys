"use strict";

/**
 * Create a new photon. Takes an initial position X and a 3-velocity V,
 * which will be rescaled to have a magnitude of c.
 */
function photon(X, V, label, options) {
    this.options = options;
    this.X0 = X;
    this.rPast = 1;
    this.XView = quat4.create();
    this.V = V;
    this.initialPt = quat4.create(X);
    // Normalize V such that V[3] = 1 and V[3]^2-V[2]^2-V[1]^2-V[0]^2 = 0
    // (i.e. |V| (including the metric) is 0)
    this.V[3] = c;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));

    this.displace = quat4.create();

    this.tau = 0;

    this.uDisplacement = quat4.create();
    this.viewTime = 0;
    this.radialVPast = 0;
}

photon.prototype.updateX0 = function(timeStep) {
    quat4.scale(this.V, timeStep/c, this.displace);

    // Bring it to now.
    quat4.add(this.X0, this.displace);

    this.X0[3] = this.X0[3] - timeStep * this.V[3]/c;
    this.initialPt[3] = this.initialPt[3] - timeStep * this.V[3]/c;
};

photon.prototype.changeFrame = function(translation1, rotation, translation2) {
    // Translate.
    quat4.subtract(this.X0, translation1);

    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.initialPt);
    mat4.multiplyVec4(rotation, this.V);

    // Renormalize this.V.
    this.V[3] = c;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));

    // Point is now at wrong time. Find displacement to current time.
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);
    
    // Bring to current time.
    quat4.add(this.X0, this.uDisplacement);
    if ( translation2) {
        quat4.subtract(this.X0, translation2);
    }
};

photon.prototype.draw = function() {
    this.drawNow();
    if (this.options.showCircle) this.drawCircle();
};

photon.prototype.update = function(timeStep) {
    this.updateX0(timeStep);
};

photon.prototype.drawXT = function(scene) {
    var xvis  = this.initialPt[0] / scene.zoom;
    var tvis  = this.initialPt[3] / scene.zoom / c;
    var xyScale = scene.mWidth / scene.mHeight;
    var dxdtVis = this.V[0] / this.V[3] * c;

    // Points in space time that represent the beginning and end of visible worldlines.
    // Some redundant calculations, but much easier to think about.
    var tOfLinet = scene.origin[2];
    var tOfLinex = tOfLinet * dxdtVis + this.X0[0] / scene.zoom;
    var bOfLinet = -(scene.height + scene.origin[2]);
    var bOfLinex = bOfLinet * dxdtVis + this.X0[0] / scene.zoom;

    scene.h.strokeStyle = "#fff";
    scene.h.fillStyle = "#fff";

    // A world Line.
    if ( -tvis + scene.origin[2] > 0) {
        if ( (-tvis + scene.origin[2]) < scene.mHeight) {
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
        scene.h.lineTo(tOfLinex + scene.origin[0],
                      -tOfLinet + scene.origin[2]);
        scene.h.stroke();
    }
};

photon.prototype.drawNow = function() {
    scene.g.fillStyle = "#fff";
    scene.g.beginPath();
    scene.g.arc(this.X0[0] / scene.zoom + scene.origin[0], 
                -this.X0[1] / scene.zoom + scene.origin[1],
                2, 0, twopi);
    scene.g.fill();
};

photon.prototype.drawCircle = function() {
    scene.g.strokeStyle = "#fff";
    scene.g.beginPath();
    scene.g.arc(this.initialPt[0] / scene.zoom + scene.origin[0],
               -this.initialPt[1] / scene.zoom + scene.origin[1],
                Math.max(0, -this.initialPt[3])  / scene.zoom, 0, twopi);
    scene.g.stroke();
};
