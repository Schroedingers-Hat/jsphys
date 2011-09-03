// Time is component 3
//lNB: Shape is four dimensional, 
// if you draw it moving and not with the front/back in the right time as well as place, it won't be the correct shape.

"use strict";

function extendedObject(X, P, label, options, shape)
{
    this.options = options;
    this.shapePoints = [];
    this.pastPoints = [];
    this.pastRadialV = [];
    this.pastR = [];
	this.iI3d = true;
	this.wI3d = true;
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

    this.COM = new inertialObject(X, P, 1);
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

extendedObject.prototype = {
    /**
     * Update the COM and the surrounding points.
     * This is the most braindead way of doing it, huge amounts of redundant
     * data/calculations, but it saves duplicating code.
     */
    update: function(timeStep, scene) {
        this.COM.updateX0(timeStep);
        this.COM.calcPast();
		this.wI3d = this.wasInteresting3D(scene);
		this.iI3d = this.isInteresting3D(scene);
		this.wI2d = this.wasInteresting2D(scene);
		this.iI2d = this.isInteresting2D(scene);
        if (this.iI3d || this.iI2d || this.wI2d || this.wI3d) {
        for (var i = 0; i < (this.shapePoints.length); i++) {
            quat4.add(this.COM.X0, this.shapePoints[i], this.pointPos[i]);
            quat4.scale(this.COM.V, -this.pointPos[i][3] / this.COM.V[3], tempQuat4);
            quat4.add(this.pointPos[i], tempQuat4, this.pointPos[i]);
        }
        } else {
        for (var j = 0; j < (this.boundingIdx.length); j++) {
            var i = this.boundingIdx[j];
            quat4.add(this.COM.X0, this.shapePoints[i], this.pointPos[i]);
            quat4.scale(this.COM.V, -this.pointPos[i][3] / this.COM.V[3], tempQuat4);
            quat4.add(this.pointPos[i], tempQuat4, this.pointPos[i]);
        }
        }
        if (scene.options.alwaysShowVisualPos || 
            (!scene.options.neverShowVisualPos && this.options.showVisualPos)) {
            this.calcPastPoints();
            this.findBB(this.pastPoints, this.boundingBoxP);
        }
        this.findBB(this.pointPos, this.boundingBox);
    },

    findBB: function(pointsArr, BB) {
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
    },

    changeFrame: function(translation1, rotation, translation2) {
        if (translation2){
            this.COM.changeFrame(translation1, rotation, translation2);
        } else this.COM.changeFrame(translation1, rotation);

        for (var i = 0; i < this.shapePoints.length; i++)
        {
            this.shapePoints[i] = mat4.multiplyVec4(rotation, this.shapePoints[i]);
        }
    },

    drawNow: function(scene) {
        if (this.iI2d)
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
            var textX =  (this.boundingBox[0] + this.boundingBox[1]) / (2 * scene.zoom) + scene.origin[0] - 10;
            var textY = -this.boundingBox[3] / scene.zoom + scene.origin[1];
            if (this.options.showVelocity) {
                scene.g.fillText("v = " + (Math.round(1000 * Math.sqrt(1-Math.min(1/Math.pow(this.COM.V[3] / c, 2), 1)))/1000) + "c", 
                                 textX, textY - 10);
            }
            if (this.options.showGamma) {
                scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[3] / c)) / 1000, textX, textY - 20);
            }
            if (this.label !== "") {
                scene.g.fillText(this.label, textX, textY - 30);
            }
            if (this.options.showTime || scene.options.showTime) {
                scene.g.fillText("tau = " + (Math.round((this.COM.tau / c))), textX, textY - 40); 
            }
        }
    },

    /**
     * Note these methods assume no acceleration
     */
    calcPastPoints: function() {
        var gamma = this.COM.V[3] / c;
        var vDotv = quat4.spaceDot(this.COM.V, this.COM.V) / Math.pow(gamma, 2);
        var xDotx;
        var vDotx;
        var a;
        var viewTime;
        //Dangerous, might accidentally use tempQuat4 and I /think/ this is a reference.
        var v = quat4.scale(this.COM.V, 1/ gamma, tempQuat4);  
        if (this.wI3d || this.wI2d) {
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
        } else {
        for (var j = 0; j < (this.boundingIdx.length); j++)
        {
            var i = this.boundingIdx[j];
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
    },

    drawPast: function(scene) {                                                                                   
        if (this.wI2d)     
        {   
            var doDoppler = (scene.options.alwaysDoppler || 
                             (!scene.options.neverDoppler && this.options.showDoppler));
            var currentColor;
            var prevColor;
            scene.g.beginPath();
            if(doDoppler) {
                    scene.g.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                        this.pastRadialV[0],
                                                                        this.COM.V[3] / c));
            } else {
                scene.g.strokeStyle = this.stillColor;
            }
            for (var i = 1; i < (this.pastPoints.length); i++)
            {
                if(doDoppler) {
                    prevColor = currentColor;
                    currentColor = tempToColor(dopplerShiftColor(this.temp, 
                                                             this.pastRadialV[i],
                                                             this.COM.V[3] / c));
                    if((currentColor != prevColor)) {
                        scene.g.strokeStyle = currentColor;
                    }
                }
                scene.g.moveTo(this.pastPoints[i-1][0] / scene.zoom + scene.origin[0],
                               -this.pastPoints[i-1][1] / scene.zoom + scene.origin[1]);
                scene.g.lineTo(this.pastPoints[i][0] / scene.zoom + scene.origin[0], 
                               -this.pastPoints[i][1] / scene.zoom + scene.origin[1]);
                if((currentColor != prevColor)) {
                    scene.g.stroke();
                    if (i < (this.pastPoints.length - 1)) scene.g.beginPath();
                }
            }
            if(currentColor == prevColor) scene.g.stroke();
        
            if (window.console && window.console.firebug) {
                scene.g.beginPath();
                scene.g.arc(this.COM.XView[0] / scene.zoom + scene.origin[0],
                            -this.COM.XView[1]  / scene.zoom + scene.origin[1] ,
                            3,0,twopi,true);
                scene.g.fill();
            }
            scene.g.fillStyle = "#0F0";
            var textX =  (this.boundingBoxP[0] + this.boundingBoxP[1]) / (2 * scene.zoom) + scene.origin[0] - 10;
            var textY = -this.boundingBoxP[3] / scene.zoom + scene.origin[1];
            var i = 1;
            if (this.options.showVelocity) {
                scene.g.fillText("v = " + (Math.round(1000 * Math.sqrt(1-Math.min(1/Math.pow(this.COM.V[3] / c, 2), 1)))/1000) + "c", 
                                 textX, textY - 10 * i);
                i++;
            }   
            if (this.options.showGamma) {
                scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[3] / c)) / 1000, textX, textY - 10 * i);
                i++;
            }
            if (this.label !== "") {
                scene.g.fillText(this.label, textX, textY - 10 * i);
                i++;
            }
            if (this.options.showTime || scene.options.showTime) {
                scene.g.fillText("t = " + (-Math.round((this.COM.viewTime / c)*10) / 10), textX, textY - 10 * i);
                i++;
            }
            if (this.options.showTime || scene.options.showTime) {
                scene.g.fillText("tau = " + (Math.round((this.COM.tauPast / c)*10) / 10), textX, textY - 10 * i);
                i++;
            }
             if (this.options.showPos || scene.options.showPos) {                                                              
                 scene.g.fillText("XYZ: " + Math.round(this.XView[0]) + ", " + Math.round(this.XView[1]) + ", " + Math.round(this.XView[2]), 
                                  textX, textY - 10 * i);
                 i++;
            }
        }
    },

    drawPast3D: function(scene) {                                                                                   
        if (this.wI3d)
        {   
            var doDoppler = (scene.options.alwaysDoppler || 
                             (!scene.options.neverDoppler && this.options.showDoppler));
            var currentColor;
            var prevColor;
            var zCoeff1;
            var zCoeff2;
            scene.TDC.beginPath();
            if(doDoppler) {
                scene.TDC.strokeStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                                    this.pastRadialV[0],
                                                                    this.COM.V[3] / c));
            } else {
                scene.TDC.strokeStyle = this.stillColor;
            }
            for (var i = 1; i < (this.pastPoints.length); i++)
            {
                zCoeff1 = 40 / (scene.zoom * (this.pastPoints[i - 1][1] + scene.camBack));
                zCoeff2 = 40 / (scene.zoom * (this.pastPoints[i][1]     + scene.camBack));
                if (this.pastPoints[i-1][1] > -scene.camBack && this.pastPoints[i][1] > -scene.camBack){
                    if(doDoppler) {
                        prevColor = currentColor;
                        currentColor = tempToColor(dopplerShiftColor(this.temp, 
                                                                     this.pastRadialV[i],
                                                                     this.COM.V[3] / c));
                        if (prevColor != currentColor) scene.TDC.strokeStyle = currentColor;
                    } 
                    scene.TDC.moveTo(this.pastPoints[i - 1][0] * zCoeff1 + scene.origin[0],
                                    -this.pastPoints[i - 1][2] * zCoeff1 + scene.origin[1]);
                    scene.TDC.lineTo(this.pastPoints[i][0] * zCoeff2 + scene.origin[0], 
                                    -this.pastPoints[i][2] * zCoeff2 + scene.origin[1]);
                    if (prevColor != currentColor){
                        scene.TDC.stroke();
                        if (i < this.pastPoints.length - 1) scene.TDC.beginPath();
                    }
                }
            }
            scene.TDC.stroke();
        } else {
			var coeff = 40 / (scene.zoom * (this.COM.XView[1] + scene.camBack));
			var xview = this.XView[0] * coeff + scene.origin[0];
			var yview = this.XView[2] * coeff + scene.origin[1];
			var viewSize = Math.max(this.boundingBoxP[1] - this.boundingBoxP[0],
								this.boundingBoxP[5] - this.boundingBoxP[4]) * coeff / 2;
			if (xview > 0 && xview < scene.tWidth &&
				yview > 0 && yview < scene.tHeight &&
				coeff > -scene.camBack) {
				scene.TDC.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
																	  this.pastRadialV[0],
																	  this.COM.V[3] / c));

				scene.TDC.beginPath();
				scene.TDC.arc(xview, yview, viewSize, 0, twopi, true);
				scene.TDC.closePath();
				scene.TDC.fill();
			}
		}
    },

    drawNow3D: function(scene) {
        var coeff = 40/(scene.zoom * (this.pointPos[0][1] + scene.camBack));
		var startedDrawing = false;
		var xview;
		var yview
        if (this.iI3d)
        {   
            scene.TDC.strokeStyle = "#0f0";

            scene.TDC.beginPath();
			xview = this.pointPos[0][0] * coeff + scene.origin[0];
			yview = -this.pointPos[0][2] * coeff + scene.origin[1];
			if (this.pointPos[0][1] > -scene.camBack && 
				xview < scene.tWidth &&
				xview > 0 &&
				yview < scene.tHeight &&
				yview > 0) {
				scene.TDC.moveTo(xview, yview);
				startedDrawing = true;
			}
            for (var i = 1; i < (this.pointPos.length); i++)
            {
                coeff = 1/(scene.zoom * (this.pointPos[i][1] + scene.camBack) / 40);
				xview = this.pointPos[i][0] * coeff + scene.origin[0];
				yview = -this.pointPos[i][2] * coeff + scene.origin[1];
                if (this.pointPos[i-1][1] > -scene.camBack && 
					this.pointPos[i][1] > -scene.camBack &&
					xview < scene.tWidth &&
					xview > 0 &&
					yview < scene.tHeight &&
					yview > 0 ) {
					if (startedDrawing){
						scene.TDC.lineTo(xview, yview);
					} else {
						scene.TDC.moveTo(xview, yview);
						startedDrawing = true;
						}
                } else startedDrawing = false;
                
            }
            scene.TDC.stroke();
        } else {
			var coeff = 40 / (scene.zoom * (this.COM.X0[1] + scene.camBack));
			var xview = this.X0[0] * coeff + scene.origin[0];
			var yview = this.X0[2] * coeff + scene.origin[1];
			var viewSize = Math.max(this.boundingBox[1] - this.boundingBox[0],
								this.boundingBox[5] - this.boundingBox[4]) * coeff / 2;
			if (xview > 0 && xview < scene.tWidth &&
				yview > 0 && yview < scene.tHeight &&
				coeff > -scene.camBack) {
				scene.TDC.fillStyle = "#0f0";
				scene.TDC.beginPath();
				scene.TDC.arc(xview, yview, viewSize, 0, twopi, true);
				scene.TDC.closePath();
				scene.TDC.fill();
			}
		}
		
    },

    draw: function(scene) {
        if (scene.options.alwaysShowVisualPos || 
            (this.options.showVisualPos && !scene.options.neverShowVisualPos)) {
            this.drawPast(scene);
            if (this.options.show3D || scene.curOptions.show3D) {
                this.drawPast3D(scene);
            }
        }
        if (scene.options.alwaysShowFramePos || 
            (!scene.options.neverShowFramePos && this.options.showFramePos)) {
            this.drawNow(scene);
            if (this.options.show3D || scene.curOptions.show3D) {
                this.drawNow3D(scene);
            }
        }
    },

    drawXT: function(scene) {
        var xvis  = this.COM.X0[0] / scene.zoom;
        var xvisP = this.COM.XView[0] / scene.zoom;
        var xyScale = scene.width / scene.height;
        var tvisP = this.COM.XView[3] / scene.zoom;
        var dxdtVis = this.COM.V[0] / this.COM.V[3] * c;

        // Points in space time that represent the beginning and end of visible worldlines.
        // Some redundant calculations, but much easier to think about.
        var tOfLinet = scene.origin[2];
        var tOfLinex = tOfLinet * dxdtVis + this.COM.X0[0] / scene.zoom;
        var bOfLinet = -(scene.height + scene.origin[2]);
        var bOfLinex = bOfLinet * dxdtVis + this.COM.X0[0] / scene.zoom;

        scene.h.strokeStyle = "#333";
        scene.h.fillStyle = "#0a0";

        // A world Line.
        scene.h.beginPath()
        scene.h.moveTo(tOfLinex + scene.origin[0],
                      -tOfLinet + scene.origin[2]);
        scene.h.lineTo(bOfLinex + scene.origin[0],
                      -bOfLinet + scene.origin[2]);
        scene.h.closePath();
        scene.h.stroke();
        // A dot at t=0.
        scene.h.beginPath();
        scene.h.arc(xvis + scene.origin[0],scene.origin[2],5,0,twopi,true);
        scene.h.closePath();
        scene.h.fill();
        // A dot at the light cone.
        scene.h.fillStyle = tempToColor(dopplerShiftColor(this.temp,
                                                          this.COM.radialVPast,
                                                          this.COM.V[3] / c));
        scene.h.beginPath();
        scene.h.arc(xvisP + scene.origin[0],
                    - tvisP / c + scene.origin[2],
                    5,0,twopi,true);
        scene.h.fill();
        if (this.label !== "") {
            scene.h.beginPath();
            scene.h.fillStyle = "#444";
            scene.h.fillText(this.label + " present position", 
                              xvis + scene.origin[0] + 5,
                              -5 + scene.origin[2]);                         

            scene.h.fillText(this.label + " visual position", 
                              xvisP + scene.origin[0] + 5,
                              -tvisP / c + scene.origin[2]);                         
            scene.h.fill();
        }
        // Find a vector that points from intialPt to somewhere near now.
            scene.h.fillStyle = "#333";

        var dotScale = 15 * Math.pow(2, Math.round(Math.log(scene.zoom) / Math.log(2)));
        var dotScaleR= 10 * Math.sqrt(scene.zoom / dotScale);
        var hNumDots = Math.ceil(scene.mHeight / dotScale / 2 * scene.zoom / this.COM.V[3] * c);
        var dotR;
        var roundedTauParam;
        var tDotPos;
        var xDotPos;
        for (var i = -hNumDots; i < hNumDots; i++) {
            roundedTauParam = Math.round(this.COM.tau / dotScale / c) * dotScale;
            quat4.scale(this.COM.V, roundedTauParam, tempQuat4);
            quat4.add(tempQuat4, this.COM.initialPt, tempQuat42);
            quat4.scale(this.COM.V, i * dotScale, tempQuat4);
            quat4.add(tempQuat4, tempQuat42, tempQuat42);
            xDotPos = tempQuat42[0] / scene.zoom + scene.origin[0];
            tDotPos = -tempQuat42[3] / c / scene.zoom + scene.origin[2]; 
            if ((i + roundedTauParam / dotScale)%10 == 0) dotR = 2 * dotScaleR;
            else if ((i + roundedTauParam / dotScale)%5 == 0) dotR = 1.41 * dotScaleR;
            else dotR = dotScaleR;
            scene.h.moveTo(tempQuat42[0] / scene.zoom + scene.origin[0],
                           tempQuat42[3] / c / scene.zoom + scene.origin[2]);
            scene.h.arc(tempQuat42[0] / scene.zoom + scene.origin[0],
                        -tempQuat42[3]/c / scene.zoom + scene.origin[2],dotR,0,twopi,true);
            if ((i + roundedTauParam / dotScale)%10 == 0) { 
                scene.h.fill();
                scene.h.beginPath();
                scene.h.fillStyle = "#0f0";

                if (this.options.showTime || scene.options.showTime) {
                    scene.h.fillText("Tau: " + Math.round((roundedTauParam + i * dotScale) * c), xDotPos + 3, tDotPos + 3);
                }
                if (scene.options.showPos || this.options.showPos){
                    scene.h.fillText("[x, t]: [" + Math.round((xDotPos - scene.origin[0]) * scene.zoom) + ", " + 
                                                   -Math.round((tDotPos - scene.origin[2]) * scene.zoom) + "]", 
                                    xDotPos + 3, tDotPos + 13);
                }
                scene.h.fill();
                scene.h.fillStyle = "#333";
                scene.h.beginPath();
            }
        }
        scene.h.fill();
        if (window.console && window.console.firebug) {
            scene.h.beginPath();
            scene.h.arc(this.COM.initialPt[0] / scene.zoom + scene.origin[0],
                        -this.COM.initialPt[3] / c / scene.zoom + scene.origin[2],6,0,twopi,true);
            scene.h.fill();
        }
    },

    get V() {
        return this.COM.V;
    },

    get X0() {
        return this.COM.X0;
    },

    get XView() {
        return this.COM.XView;
    },
	
	isInteresting3D : function(scene) {
		var coeff = 40 / (scene.zoom * (this.COM.XView[1] + scene.camBack));
		if ((this.COM.X0[0] * coeff + scene.origin[0]) > 0 &&
			(this.COM.X0[0] * coeff + scene.origin[0]) < scene.tWidth &&
			(this.COM.X0[2] * coeff + scene.origin[1]) > 0 &&
			(this.COM.X0[2] * coeff + scene.origin[1]) < scene.tHeight && 
		    (this.COM.X0[1] + this.boundingBox[3] > 0) &&
			(this.boundingBox[1] - this.boundingBox[0]) * coeff > 5 &&
			(this.boundingBox[3] - this.boundingBox[2]) * coeff > 5 &&
			(this.boundingBox[5] - this.boundingBox[4]) * coeff > 5
			) return true;
		else return false;
	},
	wasInteresting3D : function(scene) {
		var coeff = 40 / (scene.zoom * (this.COM.XView[1] + scene.camBack));
		if ((this.COM.XView[0] * coeff + scene.origin[0]) > 0 &&
			(this.COM.XView[0] * coeff + scene.origin[0]) < scene.tWidth &&
			(this.COM.XView[2] * coeff + scene.origin[1]) > 0 &&
			(this.COM.XView[2] * coeff + scene.origin[1]) < scene.tHeight && 
		    (this.COM.XView[1] + this.boundingBoxP[3] > 0) &&
			(this.boundingBoxP[1] - this.boundingBoxP[0]) * coeff > 5 &&
			(this.boundingBoxP[3] - this.boundingBoxP[2]) * coeff > 5 &&
			(this.boundingBoxP[5] - this.boundingBoxP[4]) * coeff > 5
			) return true;
		else return false;
	},
	isInteresting2D : function(scene) {
		if ((this.boundingBox[0]) / scene.zoom + scene.origin[0] > 0 &&
			(this.boundingBox[1]) / scene.zoom + scene.origin[0] < scene.width &&
			(this.boundingBox[2]) / scene.zoom + scene.origin[1] > 0 &&
			(this.boundingBox[3]) / scene.zoom + scene.origin[1] < scene.height
			) return true;
		else return false;
	},
	wasInteresting2D : function(scene) {
		if ((this.boundingBoxP[0]) / scene.zoom + scene.origin[0] > 0 &&
			(this.boundingBoxP[1]) / scene.zoom + scene.origin[0] < scene.width &&
			(this.boundingBoxP[2]) / scene.zoom + scene.origin[1] > 0 &&
			(this.boundingBoxP[3]) / scene.zoom + scene.origin[1] < scene.height
			) return true;
		else return false;
	}
}
