function Scene() {
    this.createObject = function (obj) {
        if (typeof obj.options == "undefined") {
            obj.options = {};
        }
        if (typeof obj.label == "undefined") {
            obj.label = "";
        }

        var thingy = new obj.object(quat4.create([0, obj.x[0], obj.x[1], 0], 0), 
                                    quat4.create([0, obj.p[0], obj.p[1], 0], 0), obj.label, obj.options)
        thingy.COM.init(this.timeStep);
        this.carray.push(thingy);
    };

    this.draw = function() {
        var newTime  = new Date().getTime();
        this.timeStep = (newTime - this.initialTime) * this.timeScale - (this.t/c);
        keySinceLastFrame = false;
        this.clear();

        this.carray.forEach(function(obj) {
            obj.COM.updateX0(this.timeStep);
            obj.draw(this)
        }, this);

        this.drawCrosshairs();
     
        this.t = this.t + (this.timeStep*c);
        $("#fps").html(Math.floor(1000 / (this.timeStep / this.timeScale)));
        $("#hsg").html(Math.floor(this.carray[this.carray.length - 1].COM.V[0]));
        $("#gameclock").html(Math.floor(this.t / this.timeScale / 1000 / c));
        $("#time").html(Math.floor((newTime - this.initialTime) / 1000));

        if (leftDown == true)     this.changeArrayFrame(quat4.create([0, 0, 0, 0]), boostLeft,  this.carray);
        if (upDown == true)       this.changeArrayFrame(quat4.create([0, 0, 0, 0]), boostUp,    this.carray);
        if (downDown == true)     this.changeArrayFrame(quat4.create([0, 0, 0, 0]), boostDown,  this.carray);
        if (rotLeftDown == true)  this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotRight,   this.carray);
        if (rotRightDown == true) this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotLeft,    this.carray);
        if (rotUpDown == true)    this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotUp,      this.carray);
        if (rotDownDown == true)  this.changeArrayFrame(quat4.create([0, 0, 0, 0]), rotDown,    this.carray);
        if (rightDown == true)    this.changeArrayFrame(quat4.create([0, 0, 0, 0]), boostRight, this.carray);

        requestAnimFrame(drawScene);
    };

    this.clear = function() {
        this.g.clearRect(0, 0, this.width, this.height);
    };

    this.drawCrosshairs = function () {
        this.g.strokeStyle = "#fff";
        this.g.beginPath();
        this.g.moveTo(this.hwidth - 10, this.hheight);
        this.g.lineTo(this.hwidth + 10, this.hheight);
        this.g.stroke();

        this.g.beginPath();
        this.g.moveTo(this.hwidth, this.hheight - 10);
        this.g.lineTo(this.hwidth, this.hheight + 10);
        this.g.stroke();
    };

    this.startAnimation = function() {
        this.initialTime = new Date().getTime();
        this.t = 0;
        this.interval = requestAnimFrame(drawScene);
    };

    this.stopAnimation = function() {
        clearInterval(this.interval);
    };

    this.nextStep = function() {
        this.stopAnimation();
        this.curStep += 1;
        this.carray = [];
        this.load(this.demo, this.curStep);
        this.startAnimation();
    };

    this.prevStep = function() {
        this.stopAnimation();
        this.curStep -= 1;
        this.carray = [];
        this.load(this.demo, this.curStep);
        this.startAnimation();
    }

    this.load = function(demo, step) {
        this.curStep = step;
        this.demo = demo;

        demo.steps[step].objects.forEach(this.createObject, this);
        $('#caption').html(demo.steps[step].caption);

        // If the demo specifies an object whose frame is preferred, shift to that frame.
        if (typeof demo.steps[step].frame == "number") {
            this.shiftToFrameOfObject(this.carray[demo.steps[step].frame]);
        }
    };

    // Find the closest object to the given (x,y), within a distance maxDist
    // in screen pixels (i.e. (x,y) is a screen location, not a scaled scene
    // coordinate)
    this.findClosestObject = function(x, y, maxDist) {
        var i = 0;
        var minDist = this.width;
        var minElement = -1;

        for (i = 0; i < this.carray.length; i++) {
            var dist = getDistance([x,y], [this.carray[i].COM.XView[1] / this.zoom + this.hwidth, 
                                           this.carray[i].COM.XView[2] / this.zoom + this.hheight]);
            if (dist < minDist) {
                minDist = dist;
                minElement = i;
            }
        }

        if (minDist < maxDist) {
            return this.carray[minElement];
        }
        return false;
    }

    // Take a given inertialObject and switch to its reference frame
    this.shiftToFrameOfObject = function(obj) {
        var newFrameBoost = cBoostMat(quat4.scale(obj.COM.V,
                                                  1 / obj.COM.V[0], tempVec3), 
                                                  c);

        var XShift = new Float32Array(obj.COM.X0);
        
        // If the new frame is basically the same as the old frame, don't bother.
        if (Math.sqrt(quat4.spaceDot(XShift, XShift)) < 0.0001 &&
            Math.sqrt(quat4.spaceDot(obj.COM.V, obj.COM.V)) < 0.0001) {
                return;
        }

        this.carray.forEach(function(obj) {
            obj.COM.changeFrame(XShift, newFrameBoost);
            obj.draw(this);
        }, this);
    };

    this.changeArrayFrame = function(translation, boost) {
        this.carray.forEach(function(obj) {obj.COM.changeFrame(translation, boost)});
    }

    this.keySinceLastFrame = false;
    this.g = $('#canvas')[0].getContext("2d");
    this.width = $("#canvas").width();
    this.height = $("#canvas").height();
    this.hwidth = this.width / 2;
    this.hheight = this.height / 2;
    this.carray = [];
    this.zoom = 0.25;
    this.timeStep = 5;
    this.timeScale = 0.02;
    this.t = 0;
    this.showFramePos = false;
    this.showVisualPos = true;
    this.showDoppler = true;
    this.displayTime = false;
}

/**
 * Helper function to draw the scene. Necessary because of the setInterval()
 * this problem.
 */
function drawScene(event) {
    scene.draw();
}
