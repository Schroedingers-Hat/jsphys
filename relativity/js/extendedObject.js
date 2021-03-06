// Time is component 3
//lNB: Shape is four dimensional,

"use strict";

function extendedObject(X, P, label, options, shape) {
    this.COM = new inertialObject(X, P, 1);
    this.options = options;
    
    // shapePoints stores the locations of the vertices of this object, relative
    // to the position of the COM.
    this.shapePoints = [];
    
    // pointPos stores the absolute locations of the vertices of this object.
    this.pointPos = [];
    
    // pastPoints and futPoints similarly store absolute locations of vertices,
    // but at the times they intersect the past and future light cones of this
    // frame.
    this.pastPoints = [];
    this.futPoints = [];
    
    // When showing visual positions of objects, we need to Doppler-shift them,
    // so we store the radial velocity of each vertex past the origin.
    this.pastRadialV = [];
    
    // If `created` is true, we treat the object as not having existed before
    // its initialPt; otherwise, we treat it as having existed forever. If we 
    // create an object distant from the origin and try to determine its visual
    // position, we determine that the light must have been emitted some time in 
    // the past -- before the object was created in the demo. Hence the need for
    // certain objects to be "eternal", unless we intentionally wish them to
    // appear magically in the middle of the simulation.
    if (typeof this.options.created != "undefined") {
        this.created = this.options.created;
    } else {
        this.created = false;
    }

    this.temp = (options.temperature) ? options.temperature : 5600;
    this.stillColor = tempToColor(this.temp);

    this.label = label;

    if (options.interestingPts) {
        this.interestingPts = options.interestingPts;
    }

    if (options.endPt) this.COM.endPt = quat4.create(options.endPt);
    if (options.initialPt) this.COM.initialPt = options.initialPt;
    if (options.initialTau) {
        this.COM.tau = options.initialTau;
        this.COM.initialTau = options.initialTau;
    }
    this.uDisplacement = quat4.create([0,0,0,0]);

    // Make a rectangular prism which, when placed at the position or view pos
    // of COM, must always contain part of the object.
    this.boundingBox = [0, 0, 0, 0, 0, 0];
    this.boundingBoxP = [0, 0, 0, 0, 0, 0];
    this.boundingBoxF = [0, 0, 0, 0, 0, 0];
    this.boundingIdx = [0, 0, 0, 0, 0, 0];
    
    // This object is not necessarily at rest, so its shape will be Lorentz
    // contracted. Create a boost matrix to transform all of its points by.
    var initialBoost = cBoostMat(quat4.create([-this.COM.V[0],
                                               -this.COM.V[1],
                                               -this.COM.V[2],
                                               this.COM.V[3]]), c);

    // Map the shape points into the starting reference frame and compute the
    // bounding box as we go.
    for (var i = 0; i < shape.length; i++) {
        this.shapePoints[i] = quat4.create(mat4.multiplyVec4(initialBoost, shape[i],
                                                             tempQuat4));
        for(var j = 0; j < 3; j++) {
            if (this.shapePoints[i][j] < 
                this.shapePoints[this.boundingIdx[2 * j + 1]][j]) {
                this.boundingIdx[2 * j + 1] = i;
            }
            if (this.shapePoints[i][j] > this.shapePoints[this.boundingIdx[2 * j]][j]) {
                this.boundingIdx[2 *j] = i;
            }
        }
        this.pastPoints[i] = quat4.create([0,0,0,0]);
        // Do we even want to track the whole thing on the future light cone?
        this.futPoints[i] = quat4.create([0,0,0,0]);
        this.pointPos[i] = quat4.create([0,0,0,0]);
    }
}

extendedObject.prototype = {
    /**
     * Bring the COM and surrounding points ahead in time by increment timeStep.
     */
    update: function(timeStep, scene) {
        this.COM.updateX0(timeStep);
        this.COM.calcPast();
        
        // See if we might want to draw the whole thing this frame.
        this.wI3d = this.wasInteresting3D(scene);
        this.iI3d = this.isInteresting3D(scene);
        this.wI2d = this.wasInteresting2D(scene);
        this.iI2d = this.isInteresting2D(scene);

        // If so, find out where all the points are.
        // Putting checks for drawing 3d/2d would save some computation at times.
        if (this.iI3d || this.iI2d || this.wI2d || this.wI3d) {
            for (var i = 0; i < (this.shapePoints.length); i++) {
                quat4.add(this.COM.X0, this.shapePoints[i], this.pointPos[i]);
                quat4.scale(this.COM.V, -this.pointPos[i][3] / this.COM.V[3],
                            tempQuat4);
                quat4.add(this.pointPos[i], tempQuat4, this.pointPos[i]);
            }
        } 

        // If not, just compute the new locations of the bounding box vertices.
        // Doing things this way means it takes one frame after the object is
        // in view before we start drawing it, but saves redundant computation
        // or further if statements if it is visible.
        else {
            for (var j = 0; j < (this.boundingIdx.length); j++) {
                var i = this.boundingIdx[j];
                quat4.add(this.COM.X0, this.shapePoints[i], this.pointPos[i]);
                quat4.scale(this.COM.V, -this.pointPos[i][3] / this.COM.V[3],
                            tempQuat4);
                quat4.add(this.pointPos[i], tempQuat4, this.pointPos[i]);
            }
        }
        
        // See if we need the light delayed points. Note that calPastPoints also
        // takes care of is/was interesting.
        if (scene.options.alwaysShowVisualPos || scene.options.interactions ||
            (!scene.options.neverShowVisualPos && this.options.showVisualPos)) {
            this.calcPastPoints();
            this.findBB(this.pastPoints, this.boundingBoxP);
        }
        this.findBB(this.pointPos, this.boundingBox);
        this.findBB(this.futPoints, this.boundingBoxF);
    },

    /**
     * Find the bounding boxes from the updated points and the indices.
     * The bounding box does not always contain the whole object, but it comes close.
     * Best case is a circle/sphere (always contained), worst case is a 
     * slightly oblate square/cube.
     */
    findBB: function(pointsArr, BB) {
        BB[0] = Math.min(pointsArr[this.boundingIdx[0]][0],
                         pointsArr[this.boundingIdx[1]][0]);
        BB[1] = Math.max(pointsArr[this.boundingIdx[0]][0],
                         pointsArr[this.boundingIdx[1]][0]);
        BB[2] = Math.min(pointsArr[this.boundingIdx[0]][1], 
                         pointsArr[this.boundingIdx[1]][1]);
        BB[3] = Math.max(pointsArr[this.boundingIdx[0]][1],
                         pointsArr[this.boundingIdx[1]][1]);
        BB[4] = Math.min(pointsArr[this.boundingIdx[0]][2], 
                         pointsArr[this.boundingIdx[1]][2]);
        BB[5] = Math.max(pointsArr[this.boundingIdx[0]][2],
                         pointsArr[this.boundingIdx[1]][2]);

        for (var i = 2; i < 5; i++) {
            BB[0] = Math.min(BB[0], pointsArr[this.boundingIdx[i]][0]);
            BB[1] = Math.max(BB[1], pointsArr[this.boundingIdx[i]][0]);
            BB[2] = Math.min(BB[2], pointsArr[this.boundingIdx[i]][1]);
            BB[3] = Math.max(BB[3], pointsArr[this.boundingIdx[i]][1]);
            BB[4] = Math.min(BB[4], pointsArr[this.boundingIdx[i]][2]);
            BB[5] = Math.max(BB[5], pointsArr[this.boundingIdx[i]][2]);
        }
    },

    /**
     * Map all the vectors involved in this object onto a new frame.
     * translation1 is a translation in the present frame.
     * rotation is lorentz transform defined by a matrix including boost or rotation.
     * translation2 is a translation in the new frame.
     */
    changeFrame: function(translation1, rotation, translation2) {
        this.COM.changeFrame(translation1, rotation, translation2);

        for (var i = 0; i < this.shapePoints.length; i++) {
            this.shapePoints[i] = mat4.multiplyVec4(rotation, this.shapePoints[i]);
        }
    },
    
    // Draw this object onto the given scene.
    draw: function(scene) {
        // We must account for object-specific options (this.options.showVisualPos)
        // along with the scene's overrides. We must also check that this object
        // has been "created", 
        if ((scene.options.alwaysShowVisualPos || 
             (this.options.showVisualPos && !scene.options.neverShowVisualPos)) &&
            (!this.created ||
             ((!this.COM.endPt || this.COM.XView[3] < this.COM.endPt[3]) &&
              (this.COM.XView[3] > this.COM.initialPt[3])))) {
            this.drawPast(scene);
            if (this.options.show3D || scene.curOptions.show3D) {
                this.drawPast3D(scene);
            }
        }
        if ((scene.options.alwaysShowFramePos ||
             (!scene.options.neverShowFramePos && this.options.showFramePos)) &&
            ((!this.COM.endPt || 0 < this.COM.endPt[3]) &&
             (!this.created || 0 > this.COM.initialPt[3])))  {
            this.drawNow(scene);
            if (this.options.show3D || scene.curOptions.show3D) {
                this.drawNow3D(scene);
            }
        }
        if (this.options.showMinkowski) this.drawXT(scene);
        if (scene.debug) {
            for (var i = 0; i < this.boundingBox.length; i++) {
                scene.g.beginPath();
                scene.g.fillStyle = "#f00";
                scene.g.arc(this.futPoints[this.boundingIdx[i]][0] / scene.zoom + 
                scene.origin[0],
                           -this.futPoints[this.boundingIdx[i]][1] / scene.zoom + 
                scene.origin[1], 3, 0, twopi, true);
                scene.g.fill();
            }
        }
    },
    
    /**
     * NB: these methods assume a model of Born rigidity.
     * Objects are assumed to have an infinite speed of sound.
     * This can lead to non-local effects under high acceleration.
     * Future cone is calculated in here for now as there is a lot of redundant calculation.
     */
    calcPastPoints: function() {
        var gamma = this.COM.V[3] / c;
        // Probably doesn't need to be worked out every frame.
        var vDotv = quat4.spaceDot(this.COM.V, this.COM.V) / Math.pow(gamma, 2);
        var xDotx;
        var vDotx;
        var a;
        var viewTime;
        var futTime;

        var v = quat4.scale(this.COM.V, 1 / gamma, tempQuat4);
        
        // If it's interesting, solve for the intersection of this world-line and the 
        // light cone for every point.
        if (this.wI3d || this.wI2d) {
            var j = 0;
            for (var i = 0; i < (this.shapePoints.length); i++) {
                xDotx = quat4.spaceDot(this.pointPos[i], this.pointPos[i]);
                vDotx = quat4.spaceDot(this.pointPos[i], v);
                a = c*c - vDotv;

                viewTime = -(vDotx - Math.sqrt(Math.pow(vDotx, 2) + a * xDotx)) / a * c;
                quat4.scale(v, viewTime / c, this.uDisplacement);
                quat4.subtract(this.pointPos[i], this.uDisplacement, 
                               this.pastPoints[i]);

                this.pastRadialV[i] = quat4.spaceDot(this.pastPoints[i], v) /
                    Math.max(Math.sqrt(Math.abs(quat4.spaceDot(
                                                    this.pastPoints[i],
                                                    this.pastPoints[i]))),
                             1e-16);
                
                // May as well do the future cone intersection in here seeing as
                // we've already done most of the calculations. Don't think we
                // want the whole thing at the future for any reason.
                // Just calculate the bounding box for now.
                futTime = -(vDotx + Math.sqrt(Math.pow(vDotx, 2) + a * xDotx)) / a * c;
                quat4.scale(v, futTime / c, this.uDisplacement);
                quat4.subtract(this.pointPos[i], this.uDisplacement,
                               this.futPoints[i]);
            }
        }
        // If it's not interesting, just find the appropriate bounding box.
        else {
            for (var j = 0; j < (this.boundingIdx.length); j++) {
                var i = this.boundingIdx[j];
                xDotx = quat4.spaceDot(this.pointPos[i], this.pointPos[i]);
                vDotx = quat4.spaceDot(this.pointPos[i], v);
                a = c*c - vDotv;

                viewTime = -(vDotx - Math.sqrt(Math.pow(vDotx, 2) + a * xDotx)) / a * c;
                quat4.scale(v, viewTime / c, this.uDisplacement);
                quat4.subtract(this.pointPos[i], this.uDisplacement,
                               this.pastPoints[i]);

                this.pastRadialV[i] = quat4.spaceDot(this.pastPoints[i], v) /
                    Math.max(Math.sqrt(Math.abs(quat4.spaceDot(
                                                    this.pastPoints[i],
                                                    this.pastPoints[i]))),
                 1e-16); 
                // May as well do the future cone intersection in here seeing as
                // we've already done most of the calculations.
                futTime = -(vDotx + Math.sqrt(Math.pow(vDotx, 2) + a * xDotx)) / a * c;
                quat4.scale(v, futTime / c, this.uDisplacement);
                quat4.subtract(this.pointPos[i], this.uDisplacement, this.futPoints[i]);
            }
        }
    },

    /**
     * Draw the object on the 2d context as it would be measured
     */
    drawNow: function(scene) {
        var xview;
        var yview;

        scene.g.fillStyle = "#0f0";
        // If it's interesting, draw the whole thing.
        if (this.iI2d) {
            // Stroke a path over the present points 0 and 1 coordinates.
            scene.g.strokeStyle = "#0f0";
            scene.g.beginPath();
            scene.g.moveTo(this.pointPos[0][0] / scene.zoom + scene.origin[0],
                           -this.pointPos[0][1] / scene.zoom + scene.origin[1]);
            for (var i = 0; i < (this.shapePoints.length); i++) {
                scene.g.lineTo(this.pointPos[i][0] / scene.zoom + scene.origin[0],
                               -this.pointPos[i][1] / scene.zoom + scene.origin[1]);
            }
            scene.g.stroke();
            
            // If we're drawing text, find the appropriate position and draw some text.
            if(scene.curOptions.showText) {
                var i = 1;
                var textX =  (this.boundingBox[0] + this.boundingBox[1]) /
            (2 * scene.zoom) + scene.origin[0] - 10;
                var textY = -this.boundingBox[3] / scene.zoom + scene.origin[1];
                if (this.options.showVelocity) {
                    scene.g.fillText("v = " + (Math.round(1000 * Math.sqrt(1-Math.min(1/Math.pow(this.COM.V[3] / c, 2), 1))) / 1000) + "c",
                                     textX, textY - 10 * i);
                    i++;
                }
                if (this.options.showGamma || scene.options.showGamma) {
                    scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[3] / c)) / 1000, 
                                     textX, textY - 10 * i);
                    i++;
                }
                if (this.options.showTime || scene.options.showTime) {
                    scene.g.fillText("tau = " + (Math.round((this.COM.tau / c))), textX, textY - 10 * i);
                    i++;
                }
                if (this.label !== "") {
                    scene.g.fillText(this.label, textX, textY - 10 * i);
                    i++;
                }
            }
        }

        // If we're not drawing the whole thing we might be drawing a point.
        // Some redundant calculation with isInteresting.
        else {
            xview = this.COM.X0[0] / scene.zoom + scene.origin[0];
            yview = -this.COM.X0[1] / scene.zoom + scene.origin[1];
            if (xview > 0 && xview < scene.width &&
                yview > 0 && yview < scene.height) {
                scene.g.beginPath();
                scene.g.arc(xview, yview, 2.5, 0, twopi, true);
                scene.g.fill();
            }
        }
    },

    /**
     * Draw the intersection with the light cone on the 2d context.
     * The concept is the same as drawNow (stroke a path).
     * The complexity comes from limitations of canvas. Changing styles and
     * Stroking is very expensive, so this is to be minimized.
     * This method strokes contiguous lines of the same color together.
     */
    drawPast: function(scene) {
        var xview;
        var yview;
        var doDoppler = (scene.options.alwaysDoppler ||
                        (!scene.options.neverDoppler && this.options.showDoppler));

        if (this.wI2d) {
            var currentColor;
            var prevColor;
            if (!doDoppler) scene.g.strokeStyle = this.stillColor;
            scene.g.beginPath();
            for (var i = 1; i < (this.pastPoints.length); i++) {
                if (doDoppler) {
                    prevColor = currentColor;
                    currentColor = tempToColor(dopplerShiftColor(this.temp,
                                                                 this.pastRadialV[i],
                                                                 this.COM.V[3] / c));
                    if ((currentColor != prevColor)) {
                        scene.g.strokeStyle = currentColor;
                    }
                } 
                
                scene.g.moveTo(this.pastPoints[i-1][0] / scene.zoom + scene.origin[0],
                               -this.pastPoints[i-1][1] / scene.zoom + scene.origin[1]);
                scene.g.lineTo(this.pastPoints[i][0] / scene.zoom + scene.origin[0],
                               -this.pastPoints[i][1] / scene.zoom + scene.origin[1]);

                // If we've changed color stroke, and begin a new path too -- 
                // unless we're at the end.
                if (currentColor != prevColor) {
                    scene.g.stroke();
                    if (i < (this.pastPoints.length - 1)) scene.g.beginPath();
                }
            }
            // Might have one more stroke to do.
            if (currentColor == prevColor) scene.g.stroke();

            // If we've got a debug console open we probably want a bit more information
            if (scene.debug) {
                scene.g.beginPath();
                scene.g.arc(this.COM.XView[0] / scene.zoom + scene.origin[0],
                            -this.COM.XView[1]  / scene.zoom + scene.origin[1],
                            3, 0, twopi, true);
                scene.g.fill();
            }
            
            if(scene.curOptions.showText) {
                scene.g.fillStyle = "#0F0";
                var textX =  (this.boundingBoxP[0] + this.boundingBoxP[1]) / 
                    (2 * scene.zoom) + scene.origin[0] - 10;
                var textY = -this.boundingBoxP[3] / scene.zoom + scene.origin[1];
                var i = 1;
                if (this.options.showVelocity) {
                    scene.g.fillText("v = " + (Math.round(1000 * Math.sqrt(1-Math.min(1/Math.pow(this.COM.V[3] / c, 2), 1)))/1000) + "c",
                                     textX, textY - 10 * i);
                    i++;
                }
                if (this.options.showGamma) {
                    scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[3] / c)) / 1000, 
                                     textX, textY - 10 * i);
                    i++;
                }
                if (this.options.showTime || scene.options.showTime) {
                    scene.g.fillText("t = " + (-Math.round((this.COM.viewTime / c)*10) / 10), 
                                     textX, textY - 10 * i);
                    i++;
                }
                if (this.options.showTime || scene.options.showTime) {
                    scene.g.fillText("tau = " + (Math.round((this.COM.tauPast / c)*10) / 10), 
                                     textX, textY - 10 * i);
                    i++;
                }
                 if (this.options.showPos || scene.options.showPos) {
                     scene.g.fillText("XYZ: " + Math.round(this.COM.XView[0]) + ", " + Math.round(this.COM.XView[1]) + ", " + Math.round(this.COM.XView[2]),
                                      textX, textY - 10 * i);
                }
                if (this.label !== "") {
                    scene.g.fillText(this.label, textX, textY - 10 * i);
                    i++;
                }
            }
        }
        // If we're not drawing the whole thing we might still be drawing a dot.
        else {
            xview = this.COM.XView[0] / scene.zoom + scene.origin[0];
            yview = -this.COM.XView[1] / scene.zoom + scene.origin[1];
            if (xview > 0 && xview < scene.width &&
                yview > 0 && yview < scene.height) {
                if (doDoppler) {
                    scene.g.fillStyle = tempToColor(dopplerShiftColor(this.temp,
                                                                      this.COM.radialVPast,
                                                                      this.COM.V[3] / c));
                } else {
                    scene.g.fillStyle = this.stillColor;
                }

                scene.g.beginPath();
                scene.g.arc(xview, yview, 2.5, 0, twopi, true);
                scene.g.fill();
            }
        }
    },


    // Almost the same concept as the other draw commands, but with a simple 
    // pinhole camera for 3d.
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
                currentColor = tempToColor(dopplerShiftColor(this.temp,
                                                             this.pastRadialV[0],
                                                             this.COM.V[3] / c));
                scene.TDC.strokeStyle = currentColor;
            } else {
                scene.TDC.strokeStyle = this.stillColor;
            }
            for (var i = 1; i < this.pastPoints.length; i++) {
                // Calculate z values; camBack moves the camera back or forward 
                // slightly from the actual reference frame.
                zCoeff1 = 40 / (scene.zoom * 
                                (this.pastPoints[i - 1][1] + scene.camBack));
                zCoeff2 = 40 / (scene.zoom * 
                                (this.pastPoints[i][1] + scene.camBack));
                // If both points are in front of the camera, draw a line between them.
                if (this.pastPoints[i-1][1] > -scene.camBack && 
                    this.pastPoints[i][1] > -scene.camBack){
                    // Change color if we need to.
                    if (doDoppler) {
                        prevColor = currentColor;
                        currentColor = tempToColor(dopplerShiftColor(this.temp,
                                                                     this.pastRadialV[i],
                                                                     this.COM.V[3] / c));
                        if (prevColor != currentColor) {
                            scene.TDC.strokeStyle = currentColor;
                        }
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
            // Might have one line left.
            if (prevColor == currentColor) scene.TDC.stroke();
        } 
        // If we're not drawing the whole thing, see if we need to draw a dot.
        else {
            var coeff = 40 / (scene.zoom * (this.COM.XView[1] + scene.camBack));
            var xview = this.COM.XView[0] * coeff + scene.origin[0];
            var yview = -this.COM.XView[2] * coeff + scene.origin[1];
            var viewSize = Math.max(this.boundingBoxP[3] - this.boundingBoxP[2],
                                    this.boundingBoxP[5] - this.boundingBoxP[4]) * 
                coeff / 2;
            if (xview > 0 && xview < scene.tWidth &&
                yview > 0 && yview < scene.tHeight &&
                this.COM.XView[1] > -scene.camBack + 1) {
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
        var coeff = 40 / (scene.zoom * (this.pointPos[0][1] + scene.camBack));
        var startedDrawing = false;
        var xview;
        var yview;
        
        /** 
         * Slightly more complicated logic here than calcPastPoints to try to 
         * avoid calls to moveTo.
         * Haven't really seen the expected performance benefits, the extr
         * a checks/arithmetic may not be worth it.
         */
        if (this.iI3d) {
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
            
            for (var i = 1; i < (this.pointPos.length); i++) {
                coeff = 1/(scene.zoom * (this.pointPos[i][1] + scene.camBack) / 40);
                xview = this.pointPos[i][0] * coeff + scene.origin[0];
                yview = -this.pointPos[i][2] * coeff + scene.origin[1];
                if (this.pointPos[i-1][1] > -scene.camBack &&
                    this.pointPos[i][1] > -scene.camBack &&
                    xview < scene.tWidth &&
                    xview > 0 &&
                    yview < scene.tHeight &&
                    yview > 0) {
                    if (startedDrawing) {
                        scene.TDC.lineTo(xview, yview);
                    } else {
                        scene.TDC.moveTo(xview, yview);
                        startedDrawing = true;
                    }
                } else startedDrawing = false;
            }
            scene.TDC.stroke();
        } 
        // We might still want a dot.
        else {
            coeff = 40 / (scene.zoom * (this.COM.X0[1] + scene.camBack));
            xview = this.COM.X0[0] * coeff + scene.origin[0];
            yview = -this.COM.X0[2] * coeff + scene.origin[1];
            var viewSize = Math.max(this.boundingBox[1] - this.boundingBox[0],
                                    this.boundingBox[3] - this.boundingBox[2]) * 
                    coeff / 2;
            // Check on viewSize is a bit of a kludge. If the z value is very small,
            // the dot will be enormous and filling an arc of that size is very slow.
            if (xview > 0 && xview < scene.tWidth &&
                yview > 0 && yview < scene.tHeight &&
                coeff > -scene.camBack &&
                viewSize > 0 && viewSize < scene.width) {
                scene.TDC.fillStyle = "#0f0";
                scene.TDC.beginPath();
                scene.TDC.arc(xview, yview, viewSize, 0, twopi, true);
                scene.TDC.closePath();
                scene.TDC.fill();
            }
        }
    },

    /**
      * Determine the intersection, if any, between this object's wordline
      * and the worldline of a given photon, taking into account this object's
      * physical size (bounding box). Returns a 4-event of the collision location,
      * or Infinity if there will never be a collision.
      * TODO: Needs checking for c, or reworking with more elegant methods.
      */
    photonCollision : function(photon) {
        var yAtFut = photon.V[1] * this.COM.XFut[3] / c;
        if (this.boundingBoxF[0] <= 0 &&
            this.boundingBoxF[1] >= 0 &&
            this.boundingBoxF[2] <= yAtFut &&
            this.boundingBoxF[3] >= yAtFut &&
            this.boundingBoxF[4] <= 0 &&
            this.boundingBoxF[5] >= 0) {
            return quat4.create([0, this.COM.XFut[1] - (yAtFut - this.boundingBoxF[2]),
                                 0, this.COM.XFut[3] - (yAtFut - this.boundingBoxF[2])]
                               );
        } else {
            return Infinity;
        }
    },

    drawXT: function(scene) {
        // Some relevant points scaled for zoom.
        var xvis  = this.COM.X0[0] / scene.zoom;
        var xvisP = this.COM.XView[0] / scene.zoom;
        var xvisF = this.COM.XFut[0] / scene.zoom;
        var xyScale = scene.width / scene.height;
        var tvisP = this.COM.XView[3] / scene.timeZoom;
        var tvisF = this.COM.XFut[3] / scene.timeZoom;
        var dxdtVis = this.COM.V[0] / this.COM.V[3] * c * scene.timeZoom / scene.zoom;

        // Points in space time that represent the beginning and end of visible worldlines.
        var tOfLinet = scene.origin[2];
        var tOfLinex = tOfLinet * dxdtVis + this.COM.X0[0]  / scene.zoom;
        var bOfLinet = -(scene.height + scene.origin[2]);
        var bOfLinex = bOfLinet * dxdtVis + this.COM.X0[0]  / scene.zoom;

        scene.h.strokeStyle = "#fff";
        scene.h.fillStyle = "#0a0";

        // A world Line.
        scene.h.beginPath();
        
        // If this object begins existing at a specific point in time, draw
        // the worldline starting there. Otherwise, make the worldline begin at
        // the bottom of the diagram.
        if (this.created) {
            scene.h.moveTo((this.COM.initialPt[0] / scene.zoom + 
                            scene.origin[0]),
                           (-this.COM.initialPt[3] / scene.timeZoom /
                            c + scene.origin[2]));
        } else {
            scene.h.moveTo(bOfLinex + scene.origin[0],
                           -bOfLinet + scene.origin[2]);
        }
        if (this.COM.endPt) {
            scene.h.lineTo(this.COM.endPt[0] / scene.zoom + scene.origin[0],
                           (-this.COM.endPt[3] / scene.timeZoom / c +
                            scene.origin[2]));
        } else {
            scene.h.lineTo(tOfLinex + scene.origin[0],
                           -tOfLinet + scene.origin[2]);
        }
        scene.h.stroke();

        // A dot at t=0.
        if ((this.COM.initialPt[3] < 0) &&
            (!this.COM.endPt || this.COM.endPt[3] > 0)) {
            scene.h.beginPath();
            scene.h.arc(xvis + scene.origin[0], scene.origin[2],
                        5, 0, twopi, true);
            scene.h.fill();
        }

        // A dot at the light cone.
        if (scene.options.alwaysShowVisualPos ||
            (this.options.showVisualPos && !scene.options.neverShowVisualPos)) {
            scene.h.fillStyle = tempToColor(dopplerShiftColor(this.temp,
                                                              this.COM.radialVPast,
                                                              this.COM.V[3] / c));
            scene.h.beginPath();
            scene.h.arc(xvisP + scene.origin[0],
                        -tvisP / c + scene.origin[2],
                        5, 0, twopi, true);
            scene.h.fill();
        }

        // A dot at the future light cone.
        // TODO: A separate condition for showFuturePos
        if (scene.options.alwaysShowVisualPos ||
            (this.options.showVisualPos && !scene.options.neverShowVisualPos)) {
            scene.h.fillStyle = "#f00";
            scene.h.beginPath();
            scene.h.arc(xvisF + scene.origin[0],
                        -tvisF / c + scene.origin[2],
                        5, 0, twopi, true);
            scene.h.fill();
        }

        if (this.label !== "" && scene.curOptions.showText) {
        if ((this.COM.initialPt[3] <= 0) &&
            (!this.COM.endPt || this.COM.endPt[3] > 0)){
                scene.h.beginPath();
                scene.h.fillStyle = "#777";
                scene.h.fillText(this.label,
                                  xvis + scene.origin[0] + 5,
                                  -5 + scene.origin[2]);
            }
            if (scene.options.alwaysShowVisualPos ||
                (this.options.showVisualPos && !scene.options.neverShowVisualPos)) {
                scene.h.fillText(this.label + " (visual)",
                                  xvisP + scene.origin[0] + 5,
                                  -tvisP / c + scene.origin[2]);
                scene.h.fill();
            }
        }
        // Find a vector that points from intialPt to somewhere near now.
        scene.h.fillStyle = "#aaa";
        if (this.options.showTime || scene.options.showTime) {
            var dotScale  = 25 * Math.pow(2, Math.round(Math.log(scene.timeZoom) / 
                                                        Math.log(2)));
            var dotScaleR = 15 * Math.sqrt(scene.timeZoom / dotScale);
            var hNumDots  = Math.ceil(scene.mHeight / dotScale / 2 *
                                      scene.timeZoom / this.COM.V[3] * c);
            var dotR, roundedTauParam, tDotPos, xDotPos;

            for (var i = -hNumDots; i < hNumDots; i++) {
                roundedTauParam = Math.round((this.COM.tau - this.COM.initialTau) /
                                             dotScale / c) * dotScale;

                quat4.scale(this.COM.V, roundedTauParam, tempQuat4);
                quat4.add(tempQuat4, this.COM.initialPt, tempQuat42);

                quat4.scale(this.COM.V, i * dotScale, tempQuat4);
                quat4.add(tempQuat4, tempQuat42, tempQuat42);

                xDotPos = tempQuat42[0] / scene.zoom + scene.origin[0];
                tDotPos = -tempQuat42[3] / c / scene.timeZoom + scene.origin[2];

                if ((i + roundedTauParam / dotScale) % 10 === 0) {
                    dotR = 2 * dotScaleR;
                } else if ((i + roundedTauParam / dotScale) % 5 === 0) {
                    dotR = 1.41 * dotScaleR;
                } else {
                    dotR = dotScaleR;
                }
                //Rounding error somewhere causing flickering, hence the +1
                if ((!this.COM.endPt || tempQuat42[3] <= this.COM.endPt[3] + 1) &&
                    (tempQuat42[3] >= this.COM.initialPt[3] - 1)) {
                    scene.h.moveTo(tempQuat42[0] / scene.zoom + scene.origin[0],
                                   tempQuat42[3] / c / scene.timeZoom + scene.origin[2]);
                    scene.h.arc(xDotPos,
                                tDotPos, dotR,
                                0, twopi, true);
                    
                    if (scene.curOptions.showText && 
                        ((i + roundedTauParam / dotScale) % 5 === 0)) {
                        scene.h.fill();
                        scene.h.beginPath();
                        scene.h.fillStyle = "#0f0";
                        scene.h.fillText("Tau: " + 
                                         (this.COM.initialTau + Math.round((roundedTauParam + i * dotScale))) + "s",
                                         xDotPos + 3, tDotPos + 3);

                        if (scene.options.showPos || this.options.showPos){
                            scene.h.fillText("[x, t]: [" + 
                                             Math.round((xDotPos - scene.origin[0]) * scene.zoom) + ", " +
                                             -Math.round((tDotPos - scene.origin[2]) * scene.timeZoom) + "]",
                                             xDotPos + 3, tDotPos + 13);
                        }

                        scene.h.fill();
                        scene.h.fillStyle = "#aaa";
                        scene.h.beginPath();
                    }
                }
            }
            scene.h.fill();
        }

        if (scene.debug) {
            scene.h.beginPath();
            scene.h.arc(this.COM.initialPt[0] / scene.zoom + scene.origin[0],
                        -this.COM.initialPt[3] / c / scene.timeZoom + scene.origin[2], 
                        6, 0, twopi, true);
            scene.h.fill();
        }
    },

    getV: function() {
        return this.COM.V;
    },

    getX0: function() {
        return this.COM.X0;
    },

    getXView: function() {
        return this.COM.XView;
    },
    getXFut: function() {
        return this.COM.XFut;
    },

    /**
     * Determine the distance from a given point to this object, returning
     * the minimum of the distance between (a) the point and this object's
     * visual position and (b) the point and this object's frame position,
     * depending on if frame and visual positions are currently displayed.
     */
    minDistanceTo: function(point, scene) {
        var frameDist, viewDist;
        if (scene.options.alwaysShowVisualPos ||
            (this.options.showVisualPos && !scene.options.neverShowVisualPos)) {
            var viewVec = quat4.subtract(point, this.COM.XView);
            viewDist = quat4.spaceDot(viewVec, viewVec);
        } else {
            viewDist = Infinity;
        }

        if (scene.options.alwaysShowFramePos ||
            (this.options.showFramePos && !scene.options.neverShowFramePos)) {
            var frameVec = quat4.subtract(point, this.COM.X0);
            frameDist = quat4.spaceDot(frameVec, frameVec);
        } else {
            frameDist = Infinity;
        }
        return Math.sqrt(Math.min(frameDist, viewDist));
    },

    // Various functions to determine if we care where the points other than the COM are.
    isInteresting3D : function(scene) {
        var coeff = 40 / (scene.zoom * (this.COM.X0[1] + scene.camBack));
        if ((( this.boundingBox[3]) > -scene.camBack) &&
            (( this.boundingBox[0] * coeff + scene.origin[0] < scene.tWidth) ||
             ( this.boundingBox[1] * coeff + scene.origin[0] > 0) ) &&
            ((-this.boundingBox[4] * coeff + scene.origin[1] < scene.tHeight) ||
             (-this.boundingBox[5] * coeff + scene.origin[1] > 0) ) &&
            (( this.boundingBox[1] - this.boundingBox[0]) * coeff > 5 ||
              (this.boundingBox[3] - this.boundingBox[2]) * coeff > 5 ||
              (this.boundingBox[5] - this.boundingBox[4]) * coeff > 5 )
           ) return true;
        else return false;
    },
    
    wasInteresting3D : function(scene) {
        var coeff = 40 / (scene.zoom * (this.COM.XView[1] + scene.camBack));
        if ((( this.boundingBoxP[3]) > -scene.camBack) &&
            (( this.boundingBoxP[0] * coeff + scene.origin[0] < scene.tWidth) ||
             ( this.boundingBoxP[1] * coeff + scene.origin[0] > 0)) &&
            ((-this.boundingBoxP[4] * coeff + scene.origin[1] < scene.tHeight)||
             (-this.boundingBoxP[5] * coeff + scene.origin[1] > 0)) &&
             ((this.boundingBoxP[1] - this.boundingBoxP[0]) * coeff > 5 ||
              (this.boundingBoxP[3] - this.boundingBoxP[2]) * coeff > 5 ||
              (this.boundingBoxP[5] - this.boundingBoxP[4]) * coeff > 5)
           ) return true;
        else return false;
    },
    
    isInteresting2D : function(scene) {
        if (((this.boundingBox[0]) / scene.zoom + scene.origin[0] < scene.width  ||
             (this.boundingBox[1]) / scene.zoom + scene.origin[0] > 0) &&
            ((this.boundingBox[2]) / scene.zoom + scene.origin[1] < scene.height ||
             (this.boundingBox[3]) / scene.zoom + scene.origin[1] > 0) &&
            ((this.boundingBox[1] - this.boundingBox[0]) / scene.zoom > 5 ||
             (this.boundingBox[3] - this.boundingBox[2]) / scene.zoom > 5)
            ) return true;
        else return false;
    },
    
    wasInteresting2D : function(scene) {
        if (((this.boundingBoxP[0]) / scene.zoom + scene.origin[0] < scene.width  ||
             (this.boundingBoxP[1]) / scene.zoom + scene.origin[0] > 0) &&
            ((this.boundingBoxP[2]) / scene.zoom + scene.origin[1] < scene.height ||
             (this.boundingBoxP[3]) / scene.zoom + scene.origin[1] > 0) &&
            ((this.boundingBoxP[1] - this.boundingBoxP[0]) / scene.zoom > 5 ||
             (this.boundingBoxP[3] - this.boundingBoxP[2]) / scene.zoom > 5)
            ) return true;
        else return false;
    }
}
