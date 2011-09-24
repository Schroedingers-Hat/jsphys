"use strict";
function Scene() {

    /**
     * Various state variables and options.
     */
    if (typeof Float64Array !== "undefined") {
        glMatrixArrayType = Float64Array;
    }

    this.initialTime = new Date().getTime();
    if (typeof FlashCanvas != "undefined") {

        FlashCanvas.initElement($('#canvas')[0]);
        FlashCanvas.initElement($('#minkowski')[0]);
        FlashCanvas.initElement($('#3DCanvas')[0]);
    }
    var defFont = "0.8em Helvetiker, helvetica, arial, sans-serif";
    this.g = $('#canvas')[0].getContext("2d");
    this.h = $('#minkowski')[0].getContext("2d");
    this.TDC = $('#3DCanvas')[0].getContext("2d");
    this.g.font = defFont;
    this.h.font = defFont;
    this.loaded = false;
    this.TDC.font = defFont;
    this.width = $("#canvas").width();
    this.height = $("#canvas").height();
    this.mWidth = $("#minkowski").width();
    this.mHeight = $("#minkowski").height();
    this.tWidth = $("#3DCanvas").width();
    this.tHeight = $("#3DCanvas").height();
    this.lightConeCanvas = document.createElement('canvas');
    this.lightConeCanvas.width =  this.mWidth;
    this.lightConeCanvas.height =  this.mHeight;
    if (typeof FlashCanvas != "undefined") {
        FlashCanvas.initElement(this.lightConeCanvas);
    }


    this.lCCtx = this.lightConeCanvas.getContext('2d');
    this.lCCtx.font = defFont;
    if(!this.TDC.fillText){
        this.TDC.fillText   = function(){};
        this.g.fillText     = function(){};
        this.h.fillText     = function(){};
    }

    this.camBack = 0;
    this.hwidth = this.width / 2;
    this.hheight = this.height / 2;
    this.origin = [this.hwidth, this.hheight, this.hheight];
    this.carray = [];
    this.zoom = 0.25;
    this.timeZoom = 0.25;
    this.t = 0;
    this.keyDown = false;
    this.defaults = {"showDoppler": true,
                     "showVisualPos": true,
                     "showFramePos": false,
                     "showVelocity": true,
                     "showTime": false,
                     "showGamma": true,
                     "show3D": false,
                     "showPos": false,
                     "c": 3,
                     "showText": true,
                     "timeScale": 0.01,
                     "showMinkowski": true,
                     "canShoot": false};

    this.options = {"alwaysDoppler": false,
                    "neverDoppler": false,
                    "alwaysShowFramePos": false,
                    "neverShowFramePos": false,
                    "alwaysShowVisualPos": false,
                    "neverShowVisualPos": false,
                    "interactions": true
                   };

    this.drawing = false;
    
    this.actions = {"rotateLeft": false,
                    "rotateRight": false,
                    "rotateUp": false,
                    "rotateDown": false,
                    "boostLeft": false,
                    "booostRight": false,
                    "boostUp": false,
                    "boostDown": false,
                    "speedUp": false,
                    "slowDown": false,
                    "fire": false,
                    "zoomIn": false,
                    "zoomOut": false,
                    "timeZoomIn": false,
                    "timeZoomOut": false}
    
    
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
        } else {
            this.timeScale = this.defaults.timeScale;
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

        drawLightCone(this, this.lCCtx);

        this.boost = {"left": boostFrom3Vel(-0.05 * c, 0, 0),
                      "right": boostFrom3Vel(0.05 * c, 0, 0),
                      "up": boostFrom3Vel(0, 0.05 * c, 0),
                      "down": boostFrom3Vel(0, -0.05 * c, 0)};

        // demo.steps[step].objects.forEach(this.createObject, this);
        for ( var i = 0; i < demo.steps[step].objects.length; i++) {
            this.createObject(demo.steps[step].objects[i]);
        }

        $('#caption').html(demo.steps[step].caption);

        // If the demo specifies an object whose frame is preferred, shift to that frame.
        if (typeof demo.steps[step].frame === "number") {
            this.shiftToFrameOfObject(this.carray[demo.steps[step].frame], demo.steps[step].shift);
        }
        this.frameStartTime = new Date().getTime();
        this.loaded = true;
    };

    this.pushCaption = function(caption) {
            $('#caption').html(caption);
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
        } else if (obj.x.length == 3) {
			obj.x[3] = 0;
		}
        if (obj.p && obj.p.length == 2) {
            obj.p[2] = 0;
        }
		
        var thingy;
        if (obj.shape) {
            thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], obj.x[3]]),
                                    quat4.create([obj.p[0], obj.p[1], obj.p[2], 0]), obj.label, obj.options, obj.shape);
        } else if (obj.v) {
            if (obj.x[3]) thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], obj.x[3]]),
                                    quat4.create([obj.v[0], obj.v[1], obj.v[2], 0]), obj.label, obj.options);
            else thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], 0]),
                                    quat4.create([obj.v[0], obj.v[1], obj.v[2], 0]), obj.label, obj.options);
        } else if (obj.p) {
            thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], obj.x[3]]),
                                    quat4.create([obj.p[0], obj.p[1], obj.p[2], 0]), obj.label, obj.options);
        } else {
            thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], obj.x[3]]), obj.options);
        }
        thingy.update(0, this);
        this.carray.push(thingy);
    };

    
    
    
    
    /** Scene drawing functions **/
    /**
     * Draw the scene onto the canvas. Uses requestAnimFrame to schedule the
     * next frame.
     */
    this.draw = function() {
        this.processInput();
        
        this.oldFrameStartTime = this.frameStartTime;
        this.frameStartTime = new Date().getTime();
        var timeStep = 0;
        if (this.drawing){
            timeStep = (this.frameStartTime - this.oldFrameStartTime) * this.timeScale * c;
        }
        this.clear();
        
        // Draw the light cone, if we're using flashCanvas, don't use offscreen canvas.
        if (typeof FlashCanvas != "undefined") {
            //Ie draw light cone here.
            drawLightCone(this,this.h);

        }else {
            this.h.drawImage(this.lightConeCanvas, 0, 0);
        }
        // Put some text on the light cone. Doesn't seem to work in opera 9, not sure why.
        if(this.curOptions.showText) {
            this.h.beginPath();

            this.h.fillText("x(m)", this.mWidth - 30, this.origin[2] - 10);
            this.h.fillText("t(s)", 5 + this.origin[0], 10);
            this.h.fill();
        }
        
        // Where the meat of the work is done.
        for ( var i = 0; i < this.carray.length; i++) {
            this.carray[i].update(timeStep, this);
            this.carray[i].draw(this);
        }
        
        // Some UI drawing.
        this.drawCrosshairs();
        if(this.curOptions.showText) this.drawInfo();
        
        // Get ready for the next frame.
        this.t = this.t + (timeStep);
        if (this.drawing || this.keyDown) {
            requestAnimFrame(drawScene(this));
        }

    };

    this.processInput = function() {
        // Create a new photon. Careful with this, photons are tracked even after they disappear.
        if (this.actions.fire && this.curOptions.canShoot) {
            var firstCollisionIdx = 0;
            var collisionTime;
            var firstCollisionTime = Infinity;
            var newPhoton = new photon(quat4.create([0, 0, 0, 0]),
                                       quat4.create([0, 1, 0, 0]), "photon", {"showCircle": false, "fired": true, "showFramePos": true});
            for ( var i = 0; i < this.carray.length; i++) {
                if (this.carray[i].photonCollisionTime){
                    collisionTime = this.carray[i].photonCollisionTime(newPhoton);
                    if ( collisionTime < firstCollisionTime &&
                        (!this.carray[i].COM.endPt || (this.carray[i].COM.endPt[3] > collisionTime))) {
                        firstCollisionTime = collisionTime;
                        firstCollisionIdx = i;
                    }
                }
            }
            if (firstCollisionTime < Infinity) {
                newPhoton.endPt = this.carray[firstCollisionIdx].photonCollision(newPhoton);
//                newPhoton.endPt = quat4.create(this.carray[firstCollisionIdx].getXFut());
                this.carray[firstCollisionIdx].COM.endPt = quat4.create(newPhoton.endPt);
            }
            this.carray.push(newPhoton);
            this.actions.fire = false;
        }

        // Determine whether we need to change frames
        var boost = false;
        if (this.actions.boostLeft)   boost = this.boost.left;
        if (this.actions.boostRight)  boost = this.boost.right;
        if (this.actions.boostUp)     boost = this.boost.up;
        if (this.actions.boostDown)   boost = this.boost.down;
        
        if (this.actions.rotateLeft)  boost = rotRight;
        if (this.actions.rotateRight) boost = rotLeft;
        
        if (this.actions.rotateUp === true)    this.changeArrayFrame(nullQuat4, rotUp   );
        if (this.actions.rotateDown === true)  this.changeArrayFrame(nullQuat4, rotDown );
        if (boost !== false) {
            this.changeArrayFrame(nullQuat4, boost);
        }
        if (this.actions.zoomOut == true) {
            zoomTo(this.zoom * 1.05);
        }
        if (this.actions.zoomIn == true) {
            zoomTo(this.zoom / 1.05);
        }
        if (this.actions.timeZoomIn == true) {
            this.timeZoom = this.timeZoom / 1.05;
            drawLightCone(this, this.lCCtx);
        }
        if (this.actions.timeZoomOut == true) {
            this.timeZoom = this.timeZoom * 1.05;
            drawLightCone(this, this.lCCtx);
        }
        if (this.actions.slowDown) {
            this.timeScale = this.timeScale / 1.1;
            updateSliders(this);
        }
        if (this.actions.speedUp) {
            this.timeScale = this.timeScale * 1.1;
            updateSliders(this);
        }
    }
    
    
    this.drawInfo = function() {
        this.g.fillStyle = "rgba(100,100,100,0.3)";
        this.g.beginPath();
        this.g.moveTo(10,10);
        this.g.lineTo(150,10);
        this.g.lineTo(150,110);
        this.g.lineTo(10,110);
        this.g.closePath();
        this.g.fill();
        this.g.fillStyle = "rgba(150,0,150,1)";
        this.g.fillText("Game Time: " + Math.round(this.t/c), 30, 30);
        this.g.fillText("Real Time: " + Math.round((this.frameStartTime - this.initialTime)/c) / 1000, 30, 50);
        this.g.fillText("Time speedup: " + Math.round(this.timeScale * 10000) / 10 + "x", 30, 70);
        if (window.console && window.console.firebug) {
            this.g.fillText("Fps: " + Math.round((1000 / (-this.oldFrameStartTime + this.frameStartTime))), 30, 80);
            this.g.fillText("c: " + c, 30, 90);
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
            if (!this.carray[i].nonTimeLike) {
                var dist = this.carray[i].minDistanceTo([(x - this.origin[0]) * this.zoom,
                                                         -(y - this.origin[1]) * this.zoom, 0, 0], this);
                if (dist < minDist) {
                    minDist = dist;
                    minElement = i;
                }
            }
        }

        if (minDist < maxDist && minElement >= 0) {
            return this.carray[minElement];
        }
        return false;
    };

    // Take a given inertialObject and switch to its reference frame
    this.shiftToFrameOfObject = function(obj, shift) {
        if (shift) { this.changeArrayFrame(quat4.create(obj.getX0()), cBoostMat(obj.getV(), c), shift);}
        else { this.changeArrayFrame(quat4.create(obj.getX0()), cBoostMat(obj.getV(), c));}
    };


    /**
     * Switch every object in the scene to a new reference frame given by
     * the provided translation and boost.
     */
    this.changeArrayFrame = function(translation1, boost, translation2) {
        if (translation2){
            for (var i=0;i < this.carray.length; i++) {
                this.carray[i].changeFrame(translation1, boost, translation2);
            }
        } else {
             for (var i=0;i < this.carray.length; i++) {
                this.carray[i].changeFrame(translation1, boost);
            }
        }


    };

}

/**
 * Helper function to draw the scene. Necessary because of the setInterval()
 * this problem.
 */
function drawScene(scene) {
    return function (event) {
        scene.draw();
    }
}

/**
 * Function to draw a light cone. ctx is there for drawing either on an offscreen canvas
 * or onscreen (used if FlashCanvas is active). They are assumed to be the same size.
 */
function drawLightCone(scene, ctx){
 var size = Math.max(scene.origin[0], scene.origin[2]);
 var ycoeff;
 var xcoeff = Math.min(size, size * c / scene.zoom * scene.timeZoom);
 if (xcoeff == size) ycoeff = size / c * scene.zoom / scene.timeZoom;
 else ycoeff = size;
    ctx.fillStyle = "#300";
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,ycoeff + scene.origin[2]);
    ctx.lineTo(-xcoeff+ scene.origin[0], ycoeff + scene.origin[2]);
    ctx.lineTo( xcoeff+ scene.origin[0], -ycoeff + scene.origin[2]);
    ctx.lineTo( scene.mWidth, -ycoeff + scene.origin[2]);
    ctx.lineTo( scene.mWidth, ycoeff + scene.origin[2]);
    ctx.lineTo( xcoeff+ scene.origin[0], ycoeff + scene.origin[2]);
    ctx.lineTo(-xcoeff+ scene.origin[0], -ycoeff + scene.origin[2]);
    ctx.lineTo(-xcoeff+ scene.origin[0], -ycoeff + scene.origin[2]);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#003";
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(scene.mWidth,0);
    ctx.lineTo( xcoeff+ scene.origin[0], -ycoeff + scene.origin[2]);
    ctx.lineTo(-xcoeff+ scene.origin[0], ycoeff + scene.origin[2]);
    ctx.lineTo(-xcoeff+ scene.origin[0],scene.mHeight);
    ctx.lineTo( xcoeff+ scene.origin[0],scene.mHeight);
    ctx.lineTo( xcoeff+ scene.origin[0], ycoeff + scene.origin[2]);
    ctx.lineTo(-xcoeff+ scene.origin[0], -ycoeff + scene.origin[2]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, scene.origin[2]);
    ctx.lineTo(scene.mWidth, scene.origin[2]);
    ctx.moveTo(scene.origin[0], 0);
    ctx.lineTo(scene.origin[0], scene.mHeight);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#fff";
    return;
}

function setSize(scene) {
    scene.width = $("#canvas").width();
    scene.height = $("#canvas").height();
    scene.mWidth = $("#minkowski").width();
    scene.mHeight = $("#minkowski").height();
    scene.tWidth = $("#3DCanvas").width();
    scene.tHeight = $("#3DCanvas").height();
    scene.lightConeCanvas.width =  scene.mWidth;
    scene.lightConeCanvas.height =  scene.mHeight;
    scene.hwidth = scene.width / 2;
    scene.hheight = scene.height / 2;
    scene.origin = [scene.hwidth, scene.hheight, scene.hheight];
    drawLightCone(scene,scene.lCCtx);
}
