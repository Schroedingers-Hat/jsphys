// Time is component 3
//lNB: Shape is four dimensional, 
// if you draw it moving and not with the front/back in the right time as well as place, it won't be the correct shape.

function extendedObject(X, P, m, options, shape, timeStep)
{
    this.options = options;
    this.isInteresting = true;
    this.shapePoints = [];
    this.pastPoints = [];
    this.pastRadialV = [];

    this.temp = 5000;
    this.stillColor = tempToColor(this.temp);
    if ( options.interestingPts ){
    this.interestingPts = options.interestingPts;
    };
    this.COM = new inertialObject(X, P, 1);
    this.COM.init(timeStep);
    this.uDisplacement = quat4.create([0,0,0,0]);
    this.pointPos = [];
    // Make a rectangular prism which, when placed at the position or view pos
    // of COM, must always contain part of the object.
    this.boundingBox = [0, 0, 0, 0, 0, 0];
    this.initialBoost = cBoostMat([-this.COM.V[0],
                                   -this.COM.V[1],
                                   -this.COM.V[2],
                                   this.COM.V[3]]
                                ,c);
    for (var i = 0; i < (shape.length - 1); i++)
    {
        for(var j = 0; j < 3; j++)
        {
            this.boundingBox[2 * j]     = Math.min(shape[i][j], shape[i+1][1]);
            this.boundingBox[2 * j + 1] = Math.max(shape[i][j], shape[i+1][j]);
        }
        this.shapePoints[i] = quat4.create(mat4.multiplyVec4(this.initialBoost, shape[i], tempQuat4));
        this.pastPoints[i] = quat4.create([0,0,0,0]);
        this.pointPos[i] = quat4.create([0,0,0,0]);
    }

    this.shapePoints[shape.length - 1] = quat4.create(
        mat4.multiplyVec4(this.initialBoost, shape[shape.length - 1], tempQuat4));
    this.pointPos[shape.length - 1] = quat4.create([0,0,0,0]);
    this.pastPoints[shape.length - 1] = quat4.create([0,0,0,0]);
}

/**
 * Update the COM and the surrounding points.
 * This is the most braindead way of doing it, huge amounts of redundant
 * data/calculations, but it saves duplicating code.
 */
extendedObject.prototype.update = function(timeStep)
{
    this.COM.updateX0(timeStep);
    this.COM.calcPast();
    for (var i = 0; i < (this.shapePoints.length); i++) {
        quat4.add(this.COM.X0, this.shapePoints[i], this.pointPos[i]);
        quat4.scale(this.COM.V, -this.pointPos[i][3] / this.COM.V[3], tempQuat4);
        quat4.add(this.pointPos[i], tempQuat4, this.pointPos[i]);
    }
    this.calcPastPoints();
}


extendedObject.prototype.wasInView2D = function()
{
    return (this.options.showVisualPos &&
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
    return (this.options.showVisualPos &&
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
    for (var i = 0; i < this.shapePoints.length; i++)
    {
        this.shapePoints[i] = mat4.multiplyVec4(rotation, this.shapePoints[i]);
    }
}


extendedObject.prototype.drawNow = function()
{
    if (this.isInteresting || true)
    {
        scene.g.strokeStyle = "#0f0";
        scene.g.beginPath();
        scene.g.moveTo(this.pointPos[0][0] / scene.zoom + scene.origin[0],
                       this.pointPos[0][1] / scene.zoom + scene.origin[1]);
        for (var i = 0; i < (this.shapePoints.length); i++)
        {
            scene.g.lineTo(this.pointPos[i][0] / scene.zoom + scene.origin[0],
                           this.pointPos[i][1] / scene.zoom + scene.origin[1]);
        }
       
        scene.g.stroke();
    }
}

/**
 * Note these methods assume no acceleration
 */
extendedObject.prototype.calcPastPoints = function()
{
    var radialV;
    var radialDist;
    var viewTime;
    for (var i = 0; i < (this.shapePoints.length); i++)
    {
        var vDotv = quat4.spaceDot(this.COM.V, this.COM.V) / Math.pow(this.COM.V[3], 2);
        var xDotx = quat4.spaceDot(this.pointPos[i], this.pointPos[i]);
        var vDotx = quat4.spaceDot(this.pointPos[i], this.COM.V) / this.COM.V[3];
        var a = c*c - vDotv;

        viewTime = -(vDotx - Math.sqrt(Math.pow(vDotx,2) + a * xDotx) ) / a;
        quat4.scale(this.COM.V, viewTime / this.COM.V[3], this.uDisplacement);
        quat4.subtract(this.pointPos[i], this.uDisplacement, this.pastPoints[i]);

        this.pastRadialV[i] = (quat4.spaceDot(this.pastPoints[i], this.COM.V) / 
                                Math.max(Math.sqrt(Math.abs(quat4.spaceDot(
                                this.pastPoints[i], this.pastPoints[i]) 
                                )),1e-16) / this.COM.V[3] * c);
    }
}

extendedObject.prototype.drawPast = function(scene)
{                                                                                   
    if (this.isInteresting || true)                                                 
    {   
        var doDoppler = (scene.alwaysDoppler || 
                         (!scene.neverDoppler && this.options.showDoppler));
        if(doDoppler) {
            scene.g.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                this.pastRadialV[0],
                                                                this.COM.V[3] / c));
        } else {
            scene.g.strokeStyle = this.stillColor;
        }

        scene.g.beginPath();
        scene.g.moveTo(this.pastPoints[0][0] / scene.zoom + scene.origin[0], 
                       this.pastPoints[0][1] / scene.zoom + scene.origin[1]);
       
        for (var i = 1; i < (this.pastPoints.length); i++)
        {
            if(doDoppler) {
                scene.g.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                    this.pastRadialV[i],
                                                                    this.COM.V[3] / c));
            }
            scene.g.beginPath();
            scene.g.moveTo(this.pastPoints[i-1][0] / scene.zoom + scene.origin[0],
                           this.pastPoints[i-1][1] / scene.zoom + scene.origin[1]);
            scene.g.lineTo(this.pastPoints[i][0] / scene.zoom + scene.origin[0], 
                           this.pastPoints[i][1] / scene.zoom + scene.origin[1]);
            scene.g.stroke();
        }

    }
}

extendedObject.prototype.draw = function(scene)
{
    if (this.options.showVisualPos)
        this.drawPast(scene);
    if (this.options.showFramePos)
        this.drawNow(scene);
}

extendedObject.prototype.drawXT = function(scene)
{
    var xvis = this.COM.X0[0] / scene.zoom;
    var tvis = this.COM.X0[3] / scene.timeScale;
    /* Find dx/dt using chain rule.
       V[0] is dx/dtau, V[3] is dt/dtau
       thus dx/dt is V[0]/V[3].
    */
    var dxdtVis = (this.COM.V[0] ) / 
                  (this.COM.V[3]);
    scene.h.fillStyle = "rgba(0, 256, 0, 0.5)";
    scene.h.strokeStyle = "rgba(0, 0, 0, 0.5)";

    // A blob at t=0 to represent where the object is.
    scene.h.beginPath();
    scene.h.arc(xvis + scene.origin[0],
                scene.origin[2],
                3, 0, twopi, true);
    scene.h.closePath();
    scene.h.fill();

    // A world line.
    scene.h.beginPath();
    scene.h.moveTo(xvis + scene.origin[0] + 
                    scene.origin[2]*dxdtVis, 
                   0);
    scene.h.lineTo(xvis + scene.origin[0] -
                    (scene.height - scene.origin[2]) * dxdtVis,
                   scene.height);
    scene.h.stroke();
    
    // A blob on the light cone.
    xvis = this.COM.XView[0] / scene.zoom;
    tvis = this.COM.XView[3] / scene.zoom;
    scene.h.beginPath();
    scene.h.arc(xvis + scene.origin[0],
                -tvis + scene.origin[2],
                3, 0, twopi, true);
    scene.h.fill();
 


    // Some world lines of interesting parts of the object
    // Such as front or back.
    for ( i in this.interestingPts){
        xvis = this.pointPos[this.interestingPts[i]][0] / scene.zoom;
        scene.h.beginPath();
        scene.h.moveTo(xvis + scene.origin[0] - 
                        scene.origin[2] * dxdtVis, 
                       0);
        scene.h.lineTo(xvis + scene.origin[0] + 
                        (scene.height - scene.origin[2]) * dxdtVis, 
                       scene.height);
        scene.h.stroke();
    };
}
