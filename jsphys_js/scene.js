"use strict";

function Scene() {
    if (typeof Float64Array !== "undefined") {
        glMatrixArrayType = Float64Array;
    }

    /** Demo loading functions **/

    /**
     * Load the specified demo at the given step. (The step indexes into
     * the demo's steps array.)
     */
    this.load = function(demo, step) {
        this.carray = [];
        this.curStep = step;
        this.demo = demo;

        // If the demo specifies global options, set 'em
        if (typeof demo.steps[step].origin === "object") {
            this.origin = demo.steps[step].origin;
        }
        if (typeof demo.steps[step].timeScale === "number") {
            this.timeScale = demo.steps[step].timeScale;
        }
        if (typeof demo.steps[step].zoom === "number") {
            this.zoom = demo.steps[step].zoom;
        }

        // Clone defaults into curOptions, rather than getting a reference to it
        this.curOptions = jQuery.extend({}, this.defaults);

        if (typeof demo.steps[step].options === "object") {
            $.extend(this.curOptions, demo.steps[step].options);
        }

        // Update c with the demo's chosen value
        c = (this.curOptions.c) ? this.curOptions.c : 1;

        drawLightCone(this);

        this.boost = {"left": boostFrom3Vel(-0.005, 0, 0, this.zoom),
                      "right": boostFrom3Vel(0.005, 0, 0, this.zoom),
                      "up": boostFrom3Vel(0, 0.005, 0, this.zoom),
                      "down": boostFrom3Vel(0, -0.005, 0, this.zoom)};
  
        demo.steps[step].objects.forEach(this.createObject, this);

        $('#caption').html(demo.steps[step].caption);

        // If the demo specifies an object whose frame is preferred, shift to that frame.
        if (typeof demo.steps[step].frame === "number") {
            this.shiftToFrameOfObject(this.carray[demo.steps[step].frame], demo.steps[step].shift);
        }
        this.frameStartTime = new Date().getTime();
    };

    /**
     * Called by scene.load() to create each individual object in a scene.
     * Hence obj is an object from the demo system specifying options,
     * a label, coordinates, and momentum.
     */
    this.createObject = function (obj) {
        if (typeof obj.options === "undefined") {
            obj.options = {};
        }
        if (typeof obj.label === "undefined") {
            obj.label = "";
        }

        // Copy object-specific options in on top of the global defaults
        obj.options = $.extend({}, this.curOptions, obj.options);

        // Upgrade 2D to 3D
        if (obj.x.length == 2) {
            obj.x[2] = 0;
        }
        if (obj.p && obj.p.length == 2) {
            obj.p[2] = 0;
        }
        var thingy;
        if (obj.shape) {
            thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], 0]), 
                                    quat4.create([obj.p[0], obj.p[1], obj.p[2], 0]), obj.label, obj.options, obj.shape);
        } else if (obj.v) {
            thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], 0]),
                                    quat4.create([obj.v[0], obj.v[1], obj.v[2], 0]), obj.label, obj.options);
        } else {
            thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], 0]), 
                                    quat4.create([obj.p[0], obj.p[1], obj.p[2], 0]), obj.label, obj.options);
        }
        this.carray.push(thingy);
    };

    /** Scene drawing functions **/

    /**
     * Draw the scene onto the canvas. Uses requestAnimFrame to schedule the
     * next frame.
     */
    this.draw = function() {
        this.oldFrameStartTime = this.frameStartTime;
        this.frameStartTime = new Date().getTime();
        var timeStep = 0;
        if (this.drawing){
            timeStep = (this.frameStartTime - this.oldFrameStartTime) * this.timeScale;
        }
        this.clear();

        this.h.drawImage(this.lightConeCanvas, 0, 0);
        this.carray.forEach(function(obj) {
            obj.update(timeStep);
            obj.draw(this);
            obj.drawXT(this); 
        }, this);
        this.drawCrosshairs();
        this.drawInfo();
        this.t = this.t + (timeStep * c);

        if (leftDown === true)     this.changeArrayFrame(nullQuat4, this.boost.left );
        if (upDown === true)       this.changeArrayFrame(nullQuat4, this.boost.up   );
        if (downDown === true)     this.changeArrayFrame(nullQuat4, this.boost.down );
        if (rightDown === true)    this.changeArrayFrame(nullQuat4, this.boost.right);
        if (rotLeftDown === true)  this.changeArrayFrame(nullQuat4, rotRight);
        if (rotRightDown === true) this.changeArrayFrame(nullQuat4, rotLeft );
        if (rotUpDown === true)    this.changeArrayFrame(nullQuat4, rotUp   );
        if (rotDownDown === true)  this.changeArrayFrame(nullQuat4, rotDown );

        if (this.drawing || this.keyDown) {
            requestAnimFrame(drawScene);
        }
        this.lastFrameEndTime = this.frameEndTime;
        this.frameEndTime = new Date().getTime();
    };

    this.drawInfo = function() {
        scene.g.fillStyle = "rgba(100,100,100,0.3)";
        scene.g.beginPath();
        scene.g.moveTo(10,10);
        scene.g.lineTo(150,10);
        scene.g.lineTo(150,100);
        scene.g.lineTo(10,100);
        scene.g.closePath();
        scene.g.fill();
        scene.g.fillStyle = "rgba(150,0,150,1)";
        scene.g.fillText("Game Time: " + Math.round(this.t/c), 30, 30);
        scene.g.fillText("Real Time: " + Math.round((this.frameStartTime - this.initialTime)/c) / 1000, 30, 50);

        if (window.console && window.console.firebug) {
            scene.g.fillText("Fps: " + Math.round((1000 / (-this.lastFrameEndTime + this.frameEndTime))), 30, 70);
            scene.g.fillText("c: " + c, 30, 80);
            scene.g.fillText("keyCode: " + this.kC, 30, 90); 
        }
    };

    this.drawCrosshairs = function () {
        this.g.strokeStyle = "#fff";
        this.g.beginPath();
        this.g.moveTo(this.origin[0] - 10, this.origin[1]);
        this.g.lineTo(this.origin[0] + 10, this.origin[1]);
        this.g.stroke();

        this.g.beginPath();
        this.g.moveTo(this.origin[0], this.origin[1] - 10);
        this.g.lineTo(this.origin[0], this.origin[1] + 10);
        this.g.stroke();
    };

    this.clear = function() {
        this.g.clearRect(0, 0, this.width, this.height);
        this.h.clearRect(0, 0, this.mWidth, this.mHeight);
        this.TDC.clearRect(0, 0, this.tWidth, this.tHeight);
    };

    /** Animation and step control functions **/

    this.startAnimation = function() {
        // Frame timing is used to maintain constant speed. Reset.
        this.frameEndTime = new Date().getTime();
        this.initialTime = new Date().getTime();
        this.t = 0;

        // If not currently animating, draw the first frame.
        if (!this.drawing) {
            this.draw();
        }
    };

    this.nextStep = function() {
        if (this.curStep + 1 < this.demo.steps.length) {
            this.curStep += 1;
            this.replay();
        }
    };

    this.prevStep = function() {
        if (this.curStep > 0) {
            this.curStep -= 1;
            this.replay();
        }
    };

    /**
     * Reload the current demo from scratch and restart the animation.
     */
    this.replay = function() {
        this.load(this.demo, this.curStep);
        this.startAnimation();
    };

    this.pause = function() {
        if (!this.drawing) {
            this.frameStartTime = new Date().getTime();
            this.drawing = true;
            this.draw();
        } else {
            this.drawing = false;
        }
    };

    /** Object utilities **/

    /**
     * Find the closest object to the given (x,y), within a distance maxDist
     * in screen pixels (i.e. (x,y) is a screen location, not a scaled scene
     * coordinate)
     */
    this.findClosestObject = function(x, y, maxDist) {
        var minDist = this.width;
        var minElement = -1;

        for (var i = 0; i < this.carray.length; i++) {
            var dist = getDistance([x,y], [this.carray[i].XView[0] / this.zoom + this.origin[0],
                                           -this.carray[i].XView[1] / this.zoom + this.origin[1]]);
            if (dist < minDist) {
                minDist = dist;
                minElement = i;
            }
        }

        if (minDist < maxDist) {
            return this.carray[minElement];
        }
        return false;
    };

    // Take a given inertialObject and switch to its reference frame
    this.shiftToFrameOfObject = function(obj, shift) {
        if (shift) { this.changeArrayFrame(quat4.create(obj.X0), cBoostMat(obj.V, c), shift);}
        else { this.changeArrayFrame(quat4.create(obj.X0), cBoostMat(obj.V, c));}
    };

    /**
     * Switch every object in the scene to a new reference frame given by
     * the provided translation and boost.
     */
    this.changeArrayFrame = function(translation1, boost, translation2) {
        if (translation2){
            this.carray.forEach(function(obj) {
                obj.changeFrame(translation1, boost, translation2);
            });
        } else {
            this.carray.forEach(function(obj) {
                obj.changeFrame(translation1, boost);
            });
        }


    };

    this.initialTime = new Date().getTime();
    this.g = $('#canvas')[0].getContext("2d");
    this.h = $('#minkowski')[0].getContext("2d");
    this.TDC = $('#3DCanvas')[0].getContext("2d");
    this.width = $("#canvas").width();
    this.height = $("#canvas").height();
    this.mWidth = $("#minkowski").width();
    this.mHeight = $("#minkowski").height();
    this.tWidth = $("#3DCanvas").width();
    this.tHeight = $("#3DCanvas").height();

    this.lightConeCanvas = document.createElement('canvas');
    this.lightConeCanvas.width =  this.mWidth;
    this.lightConeCanvas.height =  this.mHeight;
    this.lCCtx = this.lightConeCanvas.getContext('2d');
    this.kC = 0;
    this.camBack = 0;
    this.hwidth = this.width / 2;
    this.hheight = this.height / 2;
    this.origin = [this.hwidth, this.hheight, this.hheight];
    this.carray = [];
    this.zoom = 0.25;
    this.timeScale = 0.02;
    this.t = 0;
    this.defaults = {"showDoppler": true,
                     "showVisualPos": true,
                     "showFramePos": false,
                     "showVelocity": true,
                     "showTime": false,
                     "showGamma": true,
                     "show3D": false,
                     "showPos": false,
                     "c": 3};
  
    this.options = {"alwaysDoppler": false,
                    "neverDoppler": false,
                    "alwaysShowFramePos": false,
                    "neverShowFramePos": false,
                    "alwaysShowVisualPos": false,
                    "neverShowVisualPos": false,
                    "showTime": false};

    this.drawing = true;
}

/**
 * Helper function to draw the scene. Necessary because of the setInterval()
 * this problem.
 */
function drawScene(event) {
    scene.draw();
}

function drawLightCone(scene){
    var size = Math.max(scene.mHeight - scene.origin[2], scene.origin[2]);
    scene.lCCtx.fillStyle = "#300";
    scene.lCCtx.beginPath();
    scene.lCCtx.moveTo(0,0);
    scene.lCCtx.lineTo(0, scene.mHeight);
    scene.lCCtx.lineTo(-size * c + scene.origin[0], size + scene.origin[2]);
    scene.lCCtx.lineTo( size * c + scene.origin[0], -size + scene.origin[2]);
    scene.lCCtx.lineTo(scene.mWidth, 0);
    scene.lCCtx.lineTo(scene.mWidth, scene.mHeight);
    scene.lCCtx.lineTo( size * c + scene.origin[0], size + scene.origin[2]);
    scene.lCCtx.lineTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.lCCtx.closePath();
    scene.lCCtx.fill();
    scene.lCCtx.fillStyle = "#003";
    scene.lCCtx.beginPath();
    scene.lCCtx.moveTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.lCCtx.lineTo( size * c + scene.origin[0], -size + scene.origin[2]);
    scene.lCCtx.lineTo(-size * c + scene.origin[0],  size + scene.origin[2]);
    scene.lCCtx.lineTo( size * c + scene.origin[0],  size + scene.origin[2]);
    scene.lCCtx.moveTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.lCCtx.closePath();
    scene.lCCtx.fill();
    scene.lCCtx.strokeStyle = "#FFF";
    scene.lCCtx.lineWidth = 3;
    scene.lCCtx.beginPath();
    scene.lCCtx.moveTo(0, scene.origin[2]);
    scene.lCCtx.lineTo(scene.mWidth, scene.origin[2]);
    scene.lCCtx.moveTo(scene.origin[0], 0);
    scene.lCCtx.lineTo(scene.origin[0], scene.mHeight); 
    scene.lCCtx.stroke();
    scene.lCCtx.lineWidth = 1;
    scene.lCCtx.fillStyle = "#fff";
    scene.lCCtx.fillText("t(s)", 5 + scene.origin[0], 10);
    scene.lCCtx.fillText("x(m)", scene.width - 30, scene.origin[2] - 10);
}
