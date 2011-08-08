//lNB: Shape is four dimensional, 
// if you draw it moving and not with the front/back in the right time as well as place, it won't be the correct shape.

function extendedObject(X, P, m, shape, materials, options,timeStep)
{
    this.isInteresting = true;
    this.shapePoints = new Array();
    this.pastPoints = new Array();
    this.pastRadialV = new Array();
    this.COM = new inertialObject(X, P, m);
    this.COM.init(timeStep); 
    this.uDisplacement = quat4.create([0,0,0,0]);
    this.pointPos = quat4.create([0,0,0,0]);
    // Make a rectangular prism which, when placed at the position or view pos
    // of COM, must always contain part of the object.
    this.boundingBox = [0, 0, 0, 0, 0, 0];
    for (i = 0; i < (shape.length - 1); i++)
    {
        for(j = 1; j < 4; j++)
        {
            this.boundingBox[2 * j]     = Math.min(shape[i][j], shape[i+1][1]);
            this.boundingBox[2 * j + 1] = Math.max(shape[i][j], shape[i+1][j]);
        }
    this.shapePoints[i] = quat4.create(shape[i]);
    this.pastPoints[i] = quat4.create([0,0,0,0]);
    }
}

    // Update the COM and the surrounding points.
    // This is the most braindead way of doing it, huge amounts of redundant
    // data/calculations, but it saves duplicating code.
extendedObject.prototype.update = function(timeStep)
{
    this.COM.updateX0(timeStep);
}


extendedObject.prototype.wasInView2D = function()
{
    return (showVisualPos &&
            ((this.COM.XView[1] - this.boundingBox[0]) / scene.zoom < (scene.width - scene.origin[0] + 10) &&
             (this.COM.XView[1] - this.boundingBox[1]) / scene.zoom < (- scene.origin[1] - 10) &&
            (this.COM.XView[2] - this.boundingBox[3]) / scene.zoom < (scene.height - scene.origin[0] + 10) &&
             (this.COM.XView[1] - this.boundingBox[1]) / scene.zoom < (- scene.origin[1] - 10)) &&
             (Math.abs(this.boundingBox[0] - this.boundingBox[1]) / zoom > 1    ||
            Math.abs(this.boundingBox[2] - this.boundingBox[3]) / zoom > 1)
            );
}

extendedObject.prototype.isInView2D = function()
{
    return (showVisualPos &&
            ((this.COM.X0[1] - this.boundingBox[0]) / scene.zoom < (scene.width - scene.origin[0] + 10) &&
             (this.COM.X0[1] - this.boundingBox[1]) / scene.zoom < (- scene.origin[1] - 10) &&
             (this.COM.X0[2] - this.boundingBox[3]) / scene.zoom < (scene.height - scene.origin[0] + 10) &&
             (this.COM.X0[1] - this.boundingBox[1]) / scene.zoom < (- scene.origin[1] - 10)) &&
             (Math.abs(this.boundingBox[0] - this.boundingBox[1]) / zoom > 1    ||
            Math.abs(this.boundingBox[2] - this.boundingBox[3]) / zoom > 1)
            );
}


extendedObject.prototype.changeFrame = function(translation, rotation)
{
    this.COM.changeFrame(translation, rotation);
    for (i = 0; i < this.shapePoints.length; i++)
    {
        mat4.multiplyVec4(rotation, this.shapePoints[i]);
    }
}


extendedObject.prototype.drawNow = function()
{
    if (this.isInteresting || true)
    {
        scene.g.fillStyle = "#0f0";
        scene.g.beginPath();
        scene.g.moveTo( (this.COM.X0[1] + this.shapePoints[0][1] - this.COM.V[1] / 
                            this.COM.V[0]* this.shapePoints[0][0]) / scene.zoom + scene.origin[0],
                        (this.COM.X0[2] + this.shapePoints[0][2]  - this.COM.V[2] / 
                            this.COM.V[0]* this.shapePoints[0][0]) / scene.zoom + scene.origin[1]);
        for (i=0; i < (this.shapePoints.length); i++)
        {
            scene.g.lineTo( (this.COM.X0[1] + this.shapePoints[i][1] - this.COM.V[1] / 
                                this.COM.V[0]* this.shapePoints[i][0]) / scene.zoom + scene.origin[0],
                            (this.COM.X0[2] + this.shapePoints[i][2]  - this.COM.V[2] / 
                                this.COM.V[0] * this.shapePoints[i][0]) / scene.zoom + scene.origin[1]);
        }
        scene.g.fill();
    }
}

//Note these methods assume no acceleration
extendedObject.prototype.calcPastPoints = function()
{
    var radialV;
    var radialDist;
    var viewTime;
    for (i=0; i < (this.shapePoints.length); i++)
    {
        quat4.add(this.COM.X0,this.shapePoints[i],this.pointPos);
        radialDist = Math.sqrt(quat4.spaceDot(this.pointPos, this.pointPos));
        radialV = ( -quat4.spaceDot(this.COM.V, this.pointPos) / 
                         Math.max(radialDist, 1e-16) /
                         this.COM.V[0]);
        viewTime = radialDist / (c - radialV);
        quat4.scale(this.COM.V, viewTime / this.COM.V[0], this.uDisplacement);
       quat4.subtract(this.pointPos, this.uDisplacement, this.pastPoints[i]);

        this.pastRadialV[i] = (quat4.spaceDot(this.pastPoints[i], this.COM.V) / 
                                Math.max(Math.sqrt(Math.abs(quat4.spaceDot(
                                this.pastPoints[i], this.pastPoints[i]) 
                                )),1e-16) / this.COM.V[0]);
    }
}

extendedObject.prototype.drawPast = function(scene)
{                                                                                   
    if (this.isInteresting || true)                                                 
    {                                                                               
        scene.g.fillStyle = "#0ff";                                                 
        scene.g.beginPath();                                                        
        scene.g.moveTo( this.pastPoints[0][1] / scene.zoom + scene.origin[0], 
                        this.pastPoints[0][2] / scene.zoom + scene.origin[1]);
        for (i=0; i < (this.shapePoints.length); i++)
        {
            scene.g.lineTo( this.pastPoints[i][1] / scene.zoom + scene.origin[0], 
                        this.pastPoints[i][2] / scene.zoom + scene.origin[1]);
        }
        scene.g.fill();
    }
}   
