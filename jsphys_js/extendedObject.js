// Time is component 3
//lNB: Shape is four dimensional, 
// if you draw it moving and not with the front/back in the right time as well as place, it won't be the correct shape.

function extendedObject(X, P, label, options, shape, timeStep)
{
    this.options = options;
    this.isInteresting = true;
    this.shapePoints = [];
    this.pastPoints = [];
    this.pastRadialV = [];
    this.pastR = [];
    if (options.temperature) {
        this.temp = options.temperature;
    } else {
        this.temp = 5600;
    }

    this.label = label;
    this.stillColor = tempToColor(this.temp);
    
    if (options.interestingPts) {
        this.interestingPts = options.interestingPts;
    }

    this.COM = new inertialObject(X, P, 1, timeStep);
    this.uDisplacement = quat4.create([0,0,0,0]);
    this.pointPos = [];
    
    // Make a rectangular prism which, when placed at the position or view pos
    // of COM, must always contain part of the object.
    this.boundingBox = [0, 0, 0, 0, 0, 0];
    this.boundingBoxP = [0, 0, 0, 0, 0, 0];
    this.boundingIdx = [0, 0, 0, 0, 0, 0];
    this.initialBoost = cBoostMat([-this.COM.V[0],
                                   -this.COM.V[1],
                                   -this.COM.V[2],
                                    this.COM.V[3]], c);

    for (var i = 0; i < (shape.length - 1); i++)
    {

        this.shapePoints[i] = quat4.create(mat4.multiplyVec4(this.initialBoost, shape[i], tempQuat4));
        for(var j = 0; j < 3; j++)
        {
            if (this.shapePoints[i][j] < this.shapePoints[this.boundingIdx[2 * j + 1]][j]){
                this.boundingIdx[2 * j + 1] = i;   
            }
            if (this.shapePoints[i][j] > this.shapePoints[this.boundingIdx[2 * j]][j]){
                this.boundingIdx[2 *j] = i;   
            }
        }
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
    this.findBB(this.pointPos, this.boundingBox);
    this.findBB(this.pastPoints, this.boundingBoxP);
};


extendedObject.prototype.findBB = function(pointsArr, BB)
{
    BB[0] = Math.min(pointsArr[this.boundingIdx[0]][0],pointsArr[this.boundingIdx[1]][0]);
    BB[1] = Math.max(pointsArr[this.boundingIdx[0]][0],pointsArr[this.boundingIdx[1]][0]);
    BB[2] = Math.min(pointsArr[this.boundingIdx[0]][1],pointsArr[this.boundingIdx[1]][1]);
    BB[3] = Math.max(pointsArr[this.boundingIdx[0]][1],pointsArr[this.boundingIdx[1]][1]);
    BB[4] = Math.min(pointsArr[this.boundingIdx[0]][2],pointsArr[this.boundingIdx[1]][2]);
    BB[5] = Math.max(pointsArr[this.boundingIdx[0]][2],pointsArr[this.boundingIdx[1]][2]);

    for (var i = 2; i < 5; i++){
        BB[0] = Math.min(BB[0],pointsArr[this.boundingIdx[i]][0]);
        BB[1] = Math.max(BB[1],pointsArr[this.boundingIdx[i]][0]);
        BB[2] = Math.min(BB[2],pointsArr[this.boundingIdx[i]][1]);
        BB[3] = Math.max(BB[3],pointsArr[this.boundingIdx[i]][1]);
        BB[4] = Math.min(BB[4],pointsArr[this.boundingIdx[i]][2]);
        BB[5] = Math.max(BB[5],pointsArr[this.boundingIdx[i]][2]);

    }    
};


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
        scene.g.fillStyle = "#0f0";
        scene.g.beginPath();
        scene.g.moveTo(this.pointPos[0][0] / scene.zoom + scene.origin[0],
                       -this.pointPos[0][1] / scene.zoom + scene.origin[1]);
        for (var i = 0; i < (this.shapePoints.length); i++)
        {
            scene.g.lineTo(this.pointPos[i][0] / scene.zoom + scene.origin[0],
                           -this.pointPos[i][1] / scene.zoom + scene.origin[1]);
        }
       
        scene.g.stroke();

        if (this.options.showVelocity) {
            scene.g.fillText("v = " + (Math.round(1000 * Math.sqrt(1-Math.min(1/Math.pow(this.COM.V[3] / c, 2), 1)))/1000) + "c", 
                             (this.boundingBox[0] + this.boundingBox[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBox[3] / scene.zoom + scene.origin[1] - 20);
        }
        if (this.options.showGamma) {
            scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[3] / c)) / 1000,
                             (this.boundingBox[0] + this.boundingBox[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBox[3] / scene.zoom + scene.origin[1] - 30);
        }
        if (this.label !== "") {
            scene.g.fillText(this.label, 
                             (this.boundingBox[0] + this.boundingBox[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBox[3] / scene.zoom + scene.origin[1] - 40);
        }
        if (this.options.showTime || scene.options.showTime) {
            scene.g.fillText("tau = " + (Math.round((this.COM.tau / c)) / 1000), 
                             (this.boundingBox[0] + this.boundingBox[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBox[3] / scene.zoom + scene.origin[1] - 50);
        }
    }
}

/**
 * Note these methods assume no acceleration
 */
extendedObject.prototype.calcPastPoints = function()
{
    var gamma = this.COM.V[3] / c;
    var vDotv = quat4.spaceDot(this.COM.V, this.COM.V) / Math.pow(gamma, 2);
    var xDotx;
    var vDotx;
    var a;
    var viewTime;
    //Dangerous, might accidentally use tempQuat4 and I /think/ this is a reference.
    var v = quat4.scale(this.COM.V, 1/ gamma, tempQuat4);  
    for (var i = 0; i < (this.shapePoints.length); i++)
    {
        xDotx = quat4.spaceDot(this.pointPos[i], this.pointPos[i]);
        vDotx = quat4.spaceDot(this.pointPos[i], v);
        a = c*c - vDotv;
        
        viewTime = -(vDotx - Math.sqrt(Math.pow(vDotx, 2) + a * xDotx)) / a * c;
        quat4.scale(v, viewTime / c, this.uDisplacement);
        quat4.subtract(this.pointPos[i], this.uDisplacement, this.pastPoints[i]);

        this.pastRadialV[i] = quat4.spaceDot(this.pastPoints[i], v) / 
                                Math.max(Math.sqrt(Math.abs(quat4.spaceDot(
                                this.pastPoints[i], this.pastPoints[i]))), 1e-16);
    }
}

extendedObject.prototype.drawPast = function(scene)
{                                                                                   
    if (this.isInteresting || true)                                                 
    {   
        var doDoppler = (scene.options.alwaysDoppler || 
                         (!scene.options.neverDoppler && this.options.showDoppler));
        if(doDoppler) {
            scene.g.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                this.pastRadialV[0],
                                                                this.COM.V[3] / c));
        } else {
            scene.g.strokeStyle = this.stillColor;
            scene.g.beginPath();
            scene.g.moveTo(this.pastPoints[0][0] / scene.zoom + scene.origin[0], 
                           -this.pastPoints[0][1] / scene.zoom + scene.origin[1]);
        }
        for (var i = 1; i < (this.pastPoints.length); i++)
        {
            if(doDoppler) {
                scene.g.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                    this.pastRadialV[i],
                                                                    this.COM.V[3] / c));

                scene.g.beginPath();
                scene.g.moveTo(this.pastPoints[i-1][0] / scene.zoom + scene.origin[0],
                               -this.pastPoints[i-1][1] / scene.zoom + scene.origin[1]);

            }
            scene.g.lineTo(this.pastPoints[i][0] / scene.zoom + scene.origin[0], 
                           -this.pastPoints[i][1] / scene.zoom + scene.origin[1]);
            if(doDoppler) {
                scene.g.stroke();
            }
        }
        if(!doDoppler) {
            scene.g.stroke();
        }
    
        if (window.console && window.console.firebug) {
            scene.g.beginPath();
            scene.g.arc(this.COM.XView[0] / scene.zoom + scene.origin[0],
                        -this.COM.XView[1]  / scene.zoom + scene.origin[1] ,
                        3,0,twopi,true);
            scene.g.fill();
        }
        scene.g.fillStyle = "#0F0";
        if (this.options.showVelocity) {
            scene.g.fillText("v = " + (Math.round(1000 * Math.sqrt(1-Math.min(1/Math.pow(this.COM.V[3] / c, 2), 1)))/1000) + "c", 
                             (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBoxP[3] / scene.zoom + scene.origin[1] - 20);
        }
        if (this.options.showGamma) {
            scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[3] / c)) / 1000,
                             (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBoxP[3] / scene.zoom + scene.origin[1] - 30);
        }
        if (this.label !== "") {
            scene.g.fillText(this.label, 
                             (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBoxP[3] / scene.zoom + scene.origin[1] - 40);
        }
        if (this.options.showTime || scene.options.showTime) {
            scene.g.fillText("t = " + (-Math.round((this.COM.viewTime / c)*1000) / 1000), 
                             (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBoxP[3] / scene.zoom + scene.origin[1] - 50);
        }
        if (this.options.showTime || scene.options.showTime) {
            scene.g.fillText("tau = " + (Math.round((this.COM.tauPast / c)*1000) / 1000), 
                             (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                              -this.boundingBoxP[3] / scene.zoom + scene.origin[1] - 60);
        }
         if (this.options.showPos || scene.options.showPos) {                                                              
             scene.g.fillText("XYZ: " + Math.round(this.XView[0]) + ", " + Math.round(this.XView[1]) + ", " + Math.round(this.XView[2]), 
                              (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10,
                               -this.boundingBoxP[3] / scene.zoom + scene.origin[1] - 70);
         }                                                                                                               }
}

extendedObject.prototype.drawPast3D = function(scene)
{                                                                                   
    if (this.isInteresting || true)                                                 
    {   
        var doDoppler = (scene.options.alwaysDoppler || 
                         (!scene.options.neverDoppler && this.options.showDoppler));
        if(doDoppler) {
            scene.TDC.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                this.pastRadialV[0],
                                                                this.COM.V[3] / c));
        } else {
            scene.TDC.strokeStyle = this.stillColor;
            scene.TDC.beginPath();
            scene.TDC.moveTo((this.pastPoints[0][0] / scene.zoom / (this.pastPoints[0][1] + scene.camBack) * 40) + scene.origin[0],
                              - this.pastPoints[0][2] / scene.zoom / (this.pastPoints[0][1] + scene.camBack) * 40 + scene.origin[1]);


        }
        for (var i = 1; i < (this.pastPoints.length); i++)
        {
            if(doDoppler) {
                scene.TDC.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                    this.pastRadialV[i],
                                                                    this.COM.V[3] / c));

                scene.TDC.beginPath();
                scene.TDC.moveTo( (this.pastPoints[i-1][0] / scene.zoom /(this.pastPoints[i - 1][1] + scene.camBack) * 40) + scene.origin[0],
                                 -this.pastPoints[i-1][2] / scene.zoom / (this.pastPoints[i - 1][1] + scene.camBack) * 40 + scene.origin[1]);
            }
            if (this.pastPoints[i-1][1] > -scene.camBack && this.pastPoints[i][1] > -scene.camBack){
            scene.TDC.lineTo( (this.pastPoints[i][0] / scene.zoom /   (this.pastPoints[i][1] + scene.camBack) * 40)  + scene.origin[0], 
                              -this.pastPoints[i][2] / scene.zoom /   (this.pastPoints[i][1] + scene.camBack) * 40 + scene.origin[1]);
            }
            if(doDoppler) {
                scene.TDC.stroke();
            }
        }
        if(!doDoppler) {
            scene.TDC.stroke();
        }
    }
}

extendedObject.prototype.drawNow3D = function(scene)
{                                                                                   
    if (this.isInteresting || true)                                                 
    {   
        scene.TDC.strokeStyle = "#0f0";

        scene.TDC.beginPath();
        scene.TDC.moveTo((this.pointPos[0][0] / scene.zoom / (this.pointPos[0][1] + scene.camBack) * 40) + scene.origin[0],
                         -this.pointPos[0][2] / scene.zoom / (this.pointPos[0][1] + scene.camBack) * 40 + scene.origin[1]);

        for (var i = 1; i < (this.pointPos.length); i++)
        {
            if (this.pointPos[i-1][1] > -scene.camBack && this.pointPos[i][1] > -scene.camBack){
            scene.TDC.lineTo((this.pointPos[i][0] / scene.zoom / (this.pointPos[i][1] + scene.camBack) * 40)  + scene.origin[0], 
                             -this.pointPos[i][2] / scene.zoom / (this.pointPos[i][1] + scene.camBack) * 40 + scene.origin[1]);
            }
        }
        scene.TDC.stroke();
    }
}

extendedObject.prototype.draw = function(scene)
{

    if (this.options.showVisualPos) {
        this.drawPast(scene);
        this.drawPast3D(scene);
    }
    if (scene.options.alwaysShowFramePos || 
        (!scene.options.neverShowFramePos && this.options.showFramePos)) {
        this.drawNow(scene);
        this.drawNow3D(scene);
    }
}

extendedObject.prototype.drawXT = function(scene){
    var xvis  = this.COM.X0[0] / scene.zoom;
    var xvisP = this.COM.XView[0] / scene.zoom;
    var xyScale = scene.width / scene.height;
    var tvisP = this.COM.XView[3] / scene.zoom;
    var dxdtVis = this.COM.V[0] / this.COM.V[3] * c;

    // Points in space time that represent the beginning and end of visible worldlines.
    // Some redundant calculations, but much easier to think about.
    var tOfLinet = scene.origin[2] * scene.zoom;
    var tOfLinex = tOfLinet * dxdtVis + this.COM.X0[0];
    var bOfLinet = -(scene.height + scene.origin[2]) * scene.zoom;
    var bOfLinex = bOfLinet * dxdtVis + this.COM.X0[0];

    scene.h.strokeStyle = "#333";
    scene.h.fillStyle = "#0a0";

    // A world Line.
    scene.h.beginPath()
    scene.h.moveTo(tOfLinex / scene.zoom + scene.origin[0],
                   -tOfLinet / scene.zoom + scene.origin[2]);
    scene.h.lineTo(bOfLinex / scene.zoom + scene.origin[0],
                   -bOfLinet / scene.zoom + scene.origin[2]);
    scene.h.stroke();
    // A dot at t=0.
    scene.h.beginPath();
    scene.h.arc(xvis + scene.origin[0],scene.origin[2],3,0,twopi,true);
    scene.h.fill();
    // A dot at the light cone.
    scene.h.fillStyle = tempToColor(dopplerShiftColor(this.temp,
                                                      this.COM.radialVPast,
                                                      this.COM.V[3] / c));
    scene.h.beginPath();
    scene.h.arc(xvisP + scene.origin[0],
                - tvisP / c + scene.origin[2],
                3,0,twopi,true);
    scene.h.fill();
    if (this.label !== "") {
        scene.h.fillStyle = "#444";
        scene.h.fillText(this.label + " present position", 
                          xvis + scene.origin[0] + 5,
                          -5 + scene.origin[2]);                         

        scene.h.fillText(this.label + " visual position", 
                          xvisP + scene.origin[0] + 5,
                          -tvisP / c + scene.origin[2]);                         
    }
    // Find a vector that points from intialPt to somewhere near now.
        scene.h.fillStyle = "#333";
    for (var i = -13 * scene.zoom; i < 13 * scene.zoom; i++) {
        quat4.scale(this.COM.V, i*20-Math.round(1/this.COM.V[3] * c * this.COM.initialPt[3] /20) * 20, tempQuat4);
        quat4.add(tempQuat4, this.COM.initialPt, tempQuat42);
        scene.h.beginPath();
        scene.h.arc(tempQuat42[0] / scene.zoom + scene.origin[0],
                    -tempQuat42[3]/c / scene.zoom + scene.origin[2],2,0,twopi,true);
        scene.h.fill();
    }
};


Object.defineProperty(extendedObject.prototype, "V", {get: function() { return this.COM.V; }});
Object.defineProperty(extendedObject.prototype, "X0", {get: function() { return this.COM.X0; }});
Object.defineProperty(extendedObject.prototype, "XView", {get: function() { return this.COM.XView; }});
