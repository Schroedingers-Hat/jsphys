"use strict";

/**
 * Scene encompasses all functions and data contained in a single "scene":
 * that is, one instance of the relativity simulation, containing a single
 * demo and set of interacting objects.
 */
function Scene() {
    // glMatrix defaults to 32-bit arrays, but we'd like 64-bit arrays
    // as we sometimes get nasty rounding errors otherwise.
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
    this.lightConeCanvas = document.createElement('canvas');
    if (typeof FlashCanvas != "undefined") {
        FlashCanvas.initElement(this.lightConeCanvas);
    }

    this.lCCtx = this.lightConeCanvas.getContext('2d');
    this.lCCtx.font = defFont;
    
    // fillText was only introduced with Firefox 3.5, and some older browsers do
    // not support it. Provide empty functions if there's no browser implementation.
    if(!this.TDC.fillText) {
        this.TDC.fillText   = function(){};
        this.g.fillText     = function(){};
        this.h.fillText     = function(){};
    }
    
    this.setSize();

    this.camBack = 0;
    this.carray = [];
    this.zoom = 0.25;
    this.timeZoom = 0.25;
    this.t = 0;
    this.keyDown = false;
    
    // The default set of object-specific settings. These can be overridden by
    // a specific demo, and by individual objects in that demo.
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

    // Global scene options. These are applied regardless of object-specific
    // settings, and can be changed by the user as overrides.
    this.options = {"alwaysDoppler": false,
                    "neverDoppler": false,
                    "alwaysShowFramePos": false,
                    "neverShowFramePos": false,
                    "alwaysShowVisualPos": false,
                    "neverShowVisualPos": false,
                    "interactions": true
                   };

    this.drawing = false;
    
    // Records whether the keys for various actions are currently pressed
    // interface.js binds various key events to these actions and toggles their
    // values
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
                    "timeZoomOut": false};
}

Scene.prototype = {
    /**
     * Load the specified demo at the given step. (The step indexes into
     * the demo's steps array.)
     */
    toggle3D: function() {
        this.curOptions.show3D = !this.curOptions.show3D;
    },
    load: function(demo, step) {
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

        // Clone our default object-specific options into curOptions, rather than
        // getting a reference
        this.curOptions = jQuery.extend({}, this.defaults);

        // If the demo specifies option overrides, apply them
        if (typeof demo.steps[step].options === "object") {
            $.extend(this.curOptions, demo.steps[step].options);
        }

        // Update c with the demo's chosen value
        c = this.curOptions.c;

        drawLightCone(this, this.lCCtx);

        this.boost = {"left": boostFrom3Vel(-0.02 * c, 0, 0),
                      "right": boostFrom3Vel(0.02 * c, 0, 0),
                      "up": boostFrom3Vel(0, 0.02 * c, 0),
                      "down": boostFrom3Vel(0, -0.02 * c, 0)};

        demo.steps[step].objects.forEach(this.createObject, this);

        this.pushCaption(demo.steps[step].caption);

        // If the demo specifies an object whose frame is preferred, shift to that frame
        if (typeof demo.steps[step].frame === "number") {
            this.shiftToFrameOfObject(this.carray[demo.steps[step].frame],
                                      demo.steps[step].shift);
        }
        this.frameStartTime = new Date().getTime();
        this.loaded = true;
    },

    /**
     * Change the current demo caption to the chosen text.
     */
    pushCaption: function(caption) {
        $('#caption-text').html(caption);
    },
    
    /**
     * Called by scene.load() to create each individual object in a scene.
     * Hence obj is an object from the demo system specifying options,
     * a label, coordinates, and momentum.
     */
    createObject: function (obj) {
        if (typeof obj.options === "undefined") {
            obj.options = {};
        }
        if (typeof obj.label === "undefined") {
            obj.label = "";
        }

        // Take the current default options, set by the global defaults and
        // this demo's defaults, and apply any object-specific overrides
        obj.options = $.extend({}, this.curOptions, obj.options);

        // Pad object coordinates and momenta/velocities to 4-vectors
        obj.x.push(0, 0);
        obj.x.length = 4;
        if (obj.p) {
            obj.p.push(0, 0);
            obj.p.length = 4;
        }
        if (obj.v) {
            obj.v.push(0, 0);
            obj.v.length = 4;
        }
        
        var thingy;
        switch (obj.object) {
        case "extendedObject":
            // Some extendedObjects have custom shapes, such as asteroids
            // and stick figures, which are generated here.
            if (Object.prototype.toString.apply(obj.shape) !== '[object Array]') {
                obj.shape = window["shape_" + obj.shape.type](obj.shape.params);
            } else {
                // Pad the shape with extra intermediate points, so it can 
                // aberrate and contract more accurately
                obj.shape = linesPadder(obj.shape, this.width * this.zoom / 50);
            }
            thingy = new extendedObject(obj.x, obj.p,
                                        obj.label, obj.options, obj.shape);
            break;
            
        case "photon":
            thingy = new photon(obj.x, obj.v, obj.label, obj.options);
            break;
            
        case "fourEvent":
            thingy = new fourEvent(obj.x, obj.options);
            break;
        }
    
        if (thingy) {
            // Have the object compute its bounding box and visibility
            thingy.update(0, this);
            this.carray.push(thingy);
        }
    },

    /** Scene drawing functions **/

    /**
     * Draw the scene onto the canvas. Uses requestAnimFrame to schedule the
     * next frame.
     */
    draw: function() {
        this.processInput();
        
        // We scale timeSteps to stay close to our intended framerate.
        // Take the time elapsed since the previous frame was started and
        // scale it by a factor timeScale, which is essentially the relation
        // between real time and "game time". Advance all objects in time
        // by this interval.
        this.oldFrameStartTime = this.frameStartTime;
        this.frameStartTime = new Date().getTime();
        var timeStep = 0;
        if (this.drawing) {
            timeStep = (this.frameStartTime - this.oldFrameStartTime) * 
                this.timeScale * c;
        }
        
        this.clear();
        
        // Draw the light cone; if we're using flashCanvas, don't use offscreen canvas.
        if (typeof FlashCanvas != "undefined") {
            drawLightCone(this,this.h);
        } else {
            this.h.drawImage(this.lightConeCanvas, 0, 0);
        }
        // Put axes labels on the light cone.
        // Doesn't seem to work in opera 9, not sure why.
        if (this.curOptions.showText) {
            this.h.fillStyle = "#fff";
            this.h.fillText("x(m)", this.mWidth - 30, this.origin[2] - 10);
            this.h.fillText("t(s)", 5 + this.origin[0], 10);
            this.h.fill();
        }
        
        // Advance every object forward in time, then draw it to the canvas.
        this.carray.forEach(function (obj) {
            obj.update(timeStep, this);
            obj.draw(this);
        }, this);
        
        // Some UI drawing.
        this.drawCrosshairs();
        if (window.console && window.console.firebug && 
            this.curOptions.showText) {
            this.drawInfo();
        }
        
        this.t = this.t + (timeStep);
        
        // If we're currently drawing (and haven't just entered Pause, for
        // example), or the user is holding down a key, schedule another
        // animation frame.
        if (this.drawing || this.keyDown) {
            requestAnimFrame(drawScene(this));
        }
    },
    
    // Fire a photon aimed upwards from the current reference frame origin
    fireLaser: function() {
        var firstCollisionIdx = 0;
        var collisionTime;
        var firstCollisionTime = Infinity;
        var newPhoton = new photon(quat4.create([0, 0, 0, 0]),
                                   quat4.create([0, 1, 0, 0]), "photon", 
                                   {"showCircle": false, "fired": true, 
                                    "showFramePos": true});
        // Search through all objects and determine whether this photon will
        // collide with one in the future.
        for (var i = 0; i < this.carray.length; i++) {
            if (this.carray[i].photonCollision) {
                collisionTime = this.carray[i].photonCollision(newPhoton);
                if (collisionTime[3] < firstCollisionTime &&
                    (!this.carray[i].COM.endPt ||
                     (this.carray[i].COM.endPt[3] > collisionTime[3]))) {
                    firstCollisionTime = collisionTime[3];
                    firstCollisionIdx = i;
                }
            }
        }
        // If the photon will collide with an object, set that object's endPt
        // to the moment of collision, so that it will be destroyed along
        // with the photon.
        // TODO: Arrange for photon to be destroyed eventually, even if it does
        // not collide.
        if (firstCollisionTime < Infinity) {
            newPhoton.endPt = this.carray[firstCollisionIdx].photonCollision(newPhoton);
            this.carray[firstCollisionIdx].COM.endPt = quat4.create(newPhoton.endPt);
        }
        this.carray.push(newPhoton);
    },

    processInput: function() {
        // Create a new photon.
        // Careful with this, photons are tracked even after they disappear.
        if (this.actions.fire && this.curOptions.canShoot) {
            this.fireLaser();
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
        
        if (this.actions.rotateUp === true)    this.changeArrayFrame(nullQuat4, rotUp);
        if (this.actions.rotateDown === true)  this.changeArrayFrame(nullQuat4, rotDown);
        if (boost !== false) {
            this.changeArrayFrame(nullQuat4, boost);
        }
        if (this.actions.zoomOut === true) {
            zoomTo(this,this.zoom * 1.05);
        }
        if (this.actions.zoomIn === true) {
            zoomTo(this,this.zoom / 1.05);
        }
        if (this.actions.timeZoomIn === true) {
            this.timeZoom = this.timeZoom / 1.05;
            drawLightCone(this, this.lCCtx);
        }
        if (this.actions.timeZoomOut === true) {
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
    },
    
    /**
     * Draw some basic diagnostic information in the infobox.
     */
    drawInfo: function() {
        this.g.fillStyle = "rgba(100,100,100,0.3)";
        this.g.rect(10, 10, 140, 100);
        this.g.fill();
        
        this.g.fillStyle = "rgba(150,0,150,1)";
        this.g.fillText("Game Time: " + Math.round(this.t/c), 30, 30);
        this.g.fillText("Real Time: " + Math.round((this.frameStartTime - this.initialTime)/c) / 1000, 30, 45);
        this.g.fillText("Time speedup: " + Math.round(this.timeScale * 10000) / 10 + "x", 30, 60);
        this.g.fillText("Fps: " + Math.round((1000 / (-this.oldFrameStartTime + this.frameStartTime))), 30, 75);
        this.g.fillText("c: " + c, 30, 90);
    },
    
    /**
     * Draw crosshairs showing the origin of our reference frame.
     */
    drawCrosshairs: function () {
        this.g.strokeStyle = "#fff";
        this.g.beginPath();
        this.g.moveTo(this.origin[0] - 10, this.origin[1]);
        this.g.lineTo(this.origin[0] + 10, this.origin[1]);
        this.g.stroke();

        this.g.beginPath();
        this.g.moveTo(this.origin[0], this.origin[1] - 10);
        this.g.lineTo(this.origin[0], this.origin[1] + 10);
        this.g.stroke();
    },

    clear: function() {
        this.g.clearRect(0, 0, this.width, this.height);
        this.h.clearRect(0, 0, this.mWidth, this.mHeight);
        this.TDC.clearRect(0, 0, this.tWidth, this.tHeight);
    },
    
    /**
     * Compute this scene's canvas sizes, including the 3D canvas and the light
     * cone canvas. Set the location of the origin of our reference frame.
     */
    setSize: function () {
        this.width = $("#canvas").width();
        this.height = $("#canvas").height();
        this.mWidth = $("#minkowski").width();
        this.mHeight = $("#minkowski").height();
        this.tWidth = $("#3DCanvas").width();
        this.tHeight = $("#3DCanvas").height();
        this.lightConeCanvas.width = this.mWidth;
        this.lightConeCanvas.height = this.mHeight;
        this.hwidth = this.width / 2;
        this.hheight = this.height / 2;
        this.origin = [this.hwidth, this.hheight, this.hheight];
        drawLightCone(this, this.lCCtx);
    },

    /** Animation and step control functions **/

    startAnimation: function() {
        // Frame timing is used to maintain constant speed. Reset.
        this.frameEndTime = new Date().getTime();
        this.initialTime = new Date().getTime();
        this.t = 0;

        // If not currently animating, draw the first frame. If call draw()
        // when there's already an animation scheduled, we'll be creating
        // redundant drawing events.
        if (!this.drawing) {
            this.draw();
        }
    },

    nextStep: function() {
        if (this.curStep + 1 < this.demo.steps.length) {
            this.curStep += 1;
            this.replay();
        }
    },

    prevStep: function() {
        if (this.curStep > 0) {
            this.curStep -= 1;
            this.replay();
        }
    },

    /**
     * Reload the current demo from scratch and restart the animation.
     */
    replay: function() {
        this.load(this.demo, this.curStep);
        this.startAnimation();
    },

    pause: function() {
        if (!this.drawing) {
            this.frameStartTime = new Date().getTime();
            this.drawing = true;
            this.draw();
        } else {
            this.drawing = false;
        }
    },

    /** Object utilities **/

    /**
     * Find the closest object to the given (x,y), within a distance maxDist
     * in screen pixels (i.e. (x,y) is a screen location, not a scaled scene
     * coordinate). Returns false if no objects are within maxDist.
     */
    findClosestObject: function(x, y, maxDist) {
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
    },

    // Take a given inertialObject and switch to its reference frame
    shiftToFrameOfObject: function(obj, shift) {
        this.changeArrayFrame(quat4.create(obj.getX0()), cBoostMat(obj.getV(), c), 
                              shift);
    },

    /**
     * Switch every object in the scene to a new reference frame given by
     * the provided translation and boost.
     */
    changeArrayFrame: function(translation1, boost, translation2) {
        this.carray.forEach(function (obj) {
            obj.changeFrame(translation1, boost, translation2);
        });
    }
};

/**
 * Helper function to draw the scene. Necessary because of the setInterval()
 * this problem.
 */
function drawScene(scene) {
    return function (event) {
        scene.draw();
    };
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
}
