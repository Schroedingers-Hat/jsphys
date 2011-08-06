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
        this.viewTime = 0;
        this.radialDist = 0;
        this.radialV = 0;
        this.radialVPast = 0;
    }
    this.init();
}

inertialObject.prototype.updateX0 = function(timeStep)
{
    quat4.scale(this.V, timeStep / this.V[0], this.displace);
    //Increase proper time.
    this.tau += timeStep / Math.pow(this.V[0], 2);
    //Bring it to now.
    quat4.add(this.X0, this.displace);
    this.X0[0] = this.X0[0] - timeStep;
}

inertialObject.prototype.changeFrame = function(translation, rotation)
{
    // Translate.
    quat4.subtract(this.X0, translation);

    //Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    mat4.multiplyVec4(rotation, this.V);
    //Point is now at wrong time
    
    //Find displacement to current time.
    quat4.scale(this.V, -this.X0[0] / this.V[0], this.uDisplacement);
    
    //Bring to current time.
    quat4.add(this.X0, this.uDisplacement);
    this.tau += this.uDisplacement[0] / this.V[0];
}

inertialObject.prototype.calcPast = function()
{
    this.radialDist = Math.sqrt(quat4.spaceDot(this.X0, this.X0));
    this.radialV = ( -quat4.spaceDot(this.V, this.X0) / 
                    Math.max(this.radialDist,1e-10) / 
                    this.V[0]);
    this.viewTime = this.radialDist / (c - this.radialV);
    
    this.uDisplacement = quat4.scale(this.V, this.viewTime / this.V[0], 
                                     this.uDisplacement);
    this.XView = quat4.subtract(this.X0, this.uDisplacement, this.XView);
    //this.rPast = Math.sqrt(Math.max(quat4.spaceDot( this.XView, this.XView ),1e-10)); 
    this.radialVPast = (quat4.spaceDot(this.XView, this.V) / 
                        Math.max(Math.sqrt(Math.abs(
                        quat4.spaceDot(this.XView, this.XView) )),1e-10) / this.V[0]);
}
