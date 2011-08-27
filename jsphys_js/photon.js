/**
 * Create a new photon. Takes an initial position X and a 3-velocity V,
 * which will be rescaled to have a magnitude of c.
 */
function photon(X, V, timeStep) {
    if (X.length == 3) {
        X.push(0);
    }
    this.X0 = quat4.create(X);
    this.rPast = 1;
    this.XView = quat4.create();
    this.V = V;

    // Normalize V such that V[3] = 1 and V[3]^2-V[2]^2-V[1]^2-V[0]^2 = 0
    // (i.e. |V| (including the metric) is 0)
    this.V[3] = 1;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));

    this.displace = quat4.create();
    quat4.scale(this.V, timeStep, this.displace);

    this.tau = 0;

    this.uDisplacement = quat4.create();
    this.viewTime = 0;
    this.radialDist = 0;
    this.radialVPast = 0;
}

photon.prototype.updateX0 = function(timeStep) {
    quat4.scale(this.V, timeStep, this.displace);

    // Bring it to now.
    quat4.add(this.X0, this.displace);

    this.X0[3] = this.X0[3] - timeStep * this.V[3];
};

photon.prototype.changeFrame = function(translation, rotation) {
    // Translate.
    quat4.subtract(this.X0, translation);

    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.V);

    // Renormalize this.V.
    this.V[3] = c;
    vec3.scale(this.V, this.V[3] / Math.sqrt(quat4.spaceDot(this.V, this.V)));

    // Point is now at wrong time. Find displacement to current time.
    quat4.scale(this.V, -this.X0[3] / this.V[3], this.uDisplacement);
    
    // Bring to current time.
    quat4.add(this.X0, this.uDisplacement);
};

photon.prototype.calcPast = function() {
    var vDotv = quat4.spaceDot(this.V, this.V) / Math.pow(this.V[3] / c, 2);
    var xDotx = quat4.spaceDot(this.X0, this.X0);
    var vDotx = quat4.spaceDot(this.X0, this.V) / this.V[3] * c;
    var a = c*c - vDotv;
    if (xDotx == 0 || vDotv == 0) {
        this.XView = quat4.add(this.X0, [0,0,0,0], this.XView); //Kludge 'cos I can't think of a way to do it faster w/o passing by reference.
        this.radialVPast = 0;
        this.radialDist = Math.sqrt(xDotx);
        this.rPast = Math.sqrt(xDotx);
        thisViewTime = this.rPast / c;
        return;
    }

    this.viewTime = -(vDotx - Math.sqrt(Math.pow(vDotx,2) + a * xDotx) ) / a;
    
    quat4.scale(this.V, this.viewTime / this.V[3] * c, this.uDisplacement);
    quat4.subtract(this.X0, this.uDisplacement, this.XView);
    
    this.rPast = Math.sqrt(Math.max(quat4.spaceDot(this.XView, this.XView), 1e-10)); 
    this.radialVPast = (quat4.spaceDot(this.XView, this.V) / 
                        Math.max(this.rPast,1e-10) / this.V[3] * c);
};

photon.prototype.draw = function() {
    this.drawNow();
}

photon.prototype.update = function(timeStep) {
    this.updateX0(timeStep);
    this.calcPast();
}

photon.prototype.drawXT = function() {};

photon.prototype.drawNow = function() {
    scene.g.fillStyle = "#fff";
    scene.g.beginPath();
    scene.g.arc(this.X0[0] / scene.zoom + scene.origin[0], 
                this.X0[1] / scene.zoom + scene.origin[1],
                2, 0, twopi);
    scene.g.fill();
}
