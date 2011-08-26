function Scene() {
    glMatrixArrayType = Float64Array;

    /**
     * Called by scene.load() to create each individual object in a scene.
     * Hence obj is an object from the demo system specifying options,
     * a label, coordinates, and momentum.
     */
    this.createObject = function (obj) {
        if (typeof obj.options == "undefined") {
            obj.options = {};
        }
        if (typeof obj.label == "undefined") {
            obj.label = "";
        }

        // Copy object-specific options in on top of the global defaults
        obj.options = $.extend({}, this.options, obj.options);

        // Upgrade 2D to 3D
        if (obj.x.length == 2) {
            obj.x[2] = 0;
        }
        if (obj.p.length == 2) {
            obj.p[2] = 0;
        }
        if (obj.shape) {
            var thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], 0]), 
                                    quat4.create([obj.p[0], obj.p[1], obj.p[2], 0]), obj.label, obj.options, obj.shape, this.timeStep);
        } else {
            var thingy = new obj.object(quat4.create([obj.x[0], obj.x[1], obj.x[2], 0]), 
                                    quat4.create([obj.p[0], obj.p[1], obj.p[2], 0]), obj.label, obj.options);
        }
        this.carray.push(thingy);

    };

    /**
     * Draw the scene onto the canvas. Uses requestAnimFrame to schedule the
     * next frame.
     */
    this.draw = function() {
        if (this.carray.length === 0) { return; }
        if (this.timeScale == 0) {
            this.frameEndTime = new Date().getTime();
            requestAnimFrame(drawScene);
            return;
        }
        this.frameStartTime = new Date().getTime();
        this.timeStep = (this.frameStartTime - this.frameEndTime) * this.timeScale;

        this.clear();
        drawLightCone(this);
        this.carray.forEach(function(obj) {
            obj.update(this.timeStep);
            obj.draw(this);
            obj.drawXT(this); 
        }, this);
        this.drawCrosshairs();
        this.t = this.t + (this.timeStep * c);
        
        this.hsg.html(Math.floor(this.carray[0].COM.V[3] / c));
        this.gameclock.html(Math.floor(this.t / 1000 / c));
        this.time.html(Math.floor((this.frameStartTime - this.initialTime) / 1000));

        if (leftDown == true)     this.changeArrayFrame(quat4.create([0, 0, 0, 0]), this.boost.left,  this.carray);
        if (upDown == true)       this.changeArrayFrame(quat4.create([0, 0, 0, 0]), this.boost.up,    this.carray);
        if (downDown == true)     this.changeArrayFrame(quat4.create([0, 0, 0, 0]), this.boost.down,  this.carray);
        if (rightDown == true)    this.changeArrayFrame(quat4.create([0, 0, 0, 0]), this.boost.right, this.carray);
        if (rotLeftDown == true)  this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotRight,   this.carray);
        if (rotRightDown == true) this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotLeft,    this.carray);
        if (rotUpDown == true)    this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotUp,      this.carray);
        if (rotDownDown == true)  this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotDown,    this.carray);

        requestAnimFrame(drawScene);
        this.frameEndTime = new Date().getTime();

        this.fps.html(Math.floor(1000 / (this.frameEndTime - this.frameStartTime)));
    };

    this.clear = function() {
        this.g.clearRect(0, 0, this.width, this.height);
        this.h.clearRect(0, 0, this.width, this.height);
        this.TDC.clearRect(0, 0, this.width, this.height);
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

    this.startAnimation = function() {
        this.frameEndTime = new Date().getTime();
        this.t = 0;
        this.draw();
    };

    this.nextStep = function() {
        this.curStep += 1;
        this.replay();
    };

    this.prevStep = function() {
        this.curStep -= 1;
        this.replay();
    };

    this.replay = function() {
        this.carray = [];
        this.load(this.demo, this.curStep);
        this.startAnimation();
    };

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

        // Clone defaults into options, rather than getting a reference to it
        this.options = jQuery.extend({}, this.defaults);

        if (typeof demo.steps[step].options === "object") {
            $.extend(this.options, demo.steps[step].options);
        }

        demo.steps[step].objects.forEach(this.createObject, this);
        $('#caption').html(demo.steps[step].caption);

        // If the demo specifies an object whose frame is preferred, shift to that frame.
        if (typeof demo.steps[step].frame === "number") {
            this.shiftToFrameOfObject(this.carray[demo.steps[step].frame]);
        }
    };

    /**
     * Find the closest object to the given (x,y), within a distance maxDist
     * in screen pixels (i.e. (x,y) is a screen location, not a scaled scene
     * coordinate)
     */
    this.findClosestObject = function(x, y, maxDist) {
        var i = 0;
        var minDist = this.width;
        var minElement = -1;

        for (i = 0; i < this.carray.length; i++) {
            var dist = getDistance([x,y], [this.carray[i].COM.XView[0] / this.zoom + this.origin[0], 
                                           this.carray[i].COM.XView[1] / this.zoom + this.origin[1]]);
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
    this.shiftToFrameOfObject = function(obj) {
        var newFrameBoost = cBoostMat(obj.COM.V, c);

        var XShift = new Float64Array(obj.COM.X0);
        XShift[1] = XShift[1] + 30;

        this.changeArrayFrame(XShift, newFrameBoost);
    };

    /**
     * Switch every object in the scene to a new reference frame given by
     * the provided translation and boost.
     */
    this.changeArrayFrame = function(translation, boost) {
        this.carray.forEach(function(obj) {
        if( obj.changeFrame) {obj.changeFrame(translation, boost)
        } else { obj.COM.changeFrame(translation, boost)};
        });
    };

    this.initialTime = new Date().getTime();
    this.g = $('#canvas')[0].getContext("2d");
    this.h = $('#minkowski')[0].getContext("2d");
    this.TDC = $('#3DCanvas')[0].getContext("2d");
    this.width = $("#canvas").width();
    this.height = $("#canvas").height();
    this.hwidth = this.width / 2;
    this.hheight = this.height / 2;
    this.origin = [this.hwidth, this.hheight, this.hheight];
    this.carray = [];
    this.zoom = 0.25;
    this.timeStep = 5;
    this.timeScale = 0.02;
    this.t = 0;

    this.defaults = {"showDoppler": true,
                     "showVisualPos": true,
                     "showFramePos": false,
                     "showVelocities": true,
                     "showTime": false,
                     "showGamma": true};
    
    this.boost = {"left": boostFrom3Vel(-0.05, 0, 0, this.zoom),
                  "right": boostFrom3Vel(0.05, 0, 0, this.zoom),
                  "up": boostFrom3Vel(0, -0.05, 0, this.zoom),
                  "down": boostFrom3Vel(0, 0.05, 0, this.zoom)};
    
    this.options = {"alwaysDoppler": false,
                    "neverDoppler": false,
                    "alwaysShowFramePos": false,
                    "neverShowFramePos": true};
    
    this.hsg = $("#hsg");
    this.gameclock = $("#gameclock");
    this.time = $("#time");
    this.fps = $("#fps");
}

/**
 * Helper function to draw the scene. Necessary because of the setInterval()
 * this problem.
 */
function drawScene(event) {
    scene.draw();
}

function drawLightCone(scene){
    var size = Math.max(scene.width,scene.height);
    scene.h.fillStyle = "#300";
    scene.h.beginPath();
    scene.h.moveTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.h.lineTo(-size * c + scene.origin[0], size + scene.origin[2]);
    scene.h.lineTo( size * c + scene.origin[0], -size + scene.origin[2]);
    scene.h.lineTo( size * c + scene.origin[0], size + scene.origin[2]);
    scene.h.moveTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.h.closePath();
    scene.h.fill();
    scene.h.fillStyle = "#003";
    scene.h.beginPath();
    scene.h.moveTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.h.lineTo( size * c + scene.origin[0], -size + scene.origin[2]);
    scene.h.lineTo(-size * c + scene.origin[0],  size + scene.origin[2]);
    scene.h.lineTo( size * c + scene.origin[0],  size + scene.origin[2]);
    scene.h.moveTo(-size * c + scene.origin[0], -size + scene.origin[2]);
    scene.h.closePath();
    scene.h.fill();
    scene.h.strokeStyle = "#FFF";
    scene.h.lineWidth = 3;
    scene.h.beginPath();
    scene.h.moveTo(0, scene.origin[2]);
    scene.h.lineTo(scene.width, scene.origin[2]);
    scene.h.moveTo(scene.origin[0], 0);
    scene.h.lineTo(scene.origin[0], scene.height); 
    scene.h.stroke();
    scene.h.lineWidth = 1;
}
