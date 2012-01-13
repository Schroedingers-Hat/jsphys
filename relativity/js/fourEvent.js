"use strict";

/**
 * Create a new fourEvent. Takes an initial position X and a 3-velocity V,
 * which will be rescaled to have a magnitude of c.
 */
function fourEvent(X, options, scene) {
    if (options.caption) this.caption = options.caption;
    if (options.audio) {
        this.audioTrack = options.audio;
        this.audioPlayed = false;
        scene.audio.load(this.audioTrack);
    }
    this.X0 = quat4.create(X);
    this.later = X[3] + 1;
    
    this.eventCallbacks = [];
    this.audioCallbacks = [];
    if (options.afterAudio) {
        this.audioCallbacks = options.afterAudio;
    }
    if (options.onEvent) {
        this.eventCallbacks = options.onEvent;
    }
    // By default, if a caption is provided but no callback specified, push
    // the caption when the fourEvent occurs.
    if (this.caption && this.eventCallbacks.indexOf("caption") === -1 &&
        this.audioCallbacks.indexOf("caption") === -1) {
        this.eventCallbacks.push("caption");
    }
    // Similarly for an audio track.
    if (this.audioTrack && this.eventCallbacks.indexOf("audio") === -1 &&
        this.audioCallbacks.indexOf("audio") === -1) {
        this.eventCallbacks.push("audio");
    }
}

fourEvent.prototype.update = function(timeStep) {
    // Move it back in time one timeStep (so we go forward in time).
    this.later = this.X0[3] + 5*timeStep; // A bit later than now.
    this.X0[3] = this.X0[3] - timeStep;
};

fourEvent.prototype.changeFrame = function(translation1, rotation, translation2) {
    // Translate.
    quat4.subtract(this.X0, translation1);
    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    // Optional translation.
    if (translation2) quat4.subtract(this.X0, translation2);
};

fourEvent.prototype.draw = function(scene) {
    if (this.visible) {
        // Only makes sense to display if we're showing the current position.
        if (scene.options.alwaysShowFramePos || 
            (this.options.showFramePos && !scene.options.neverShowFramePos)) {
            this.drawNow(scene);
        } 
        this.drawXT(scene);
        if (scene.options.alwaysShowVisualPos ||
            (this.options.showVisualPos && !scene.options.neverShowVisualPos)) {
            this.drawPast(scene);
        }
    }
    // Later is also back in time if time is reversed.
    if ((this.X0[3] < 0 && this.later >= 0) ||
        (this.X0[3] > 0 && this.later <=0)) {
        if (!this.audioPlayed) {
            this.playCallbacks(this.eventCallbacks, scene);
            this.audioPlayed = true;
        }
    }
};

fourEvent.prototype.drawXT = function(scene) {
    var xvis  = this.X0[0] / scene.zoom;
    var tvis  = this.X0[3] / scene.zoom / c;

    scene.h.strokeStyle = "#fff";
    scene.h.beginPath();
    scene.h.fillStyle = "#ff0";
    scene.h.arc(this.X0[0] / scene.zoom + scene.origin[0],
               -this.X0[3] / c / scene.timeZoom + scene.origin[2],2,0,twopi,true);

    scene.h.fill();
};

fourEvent.prototype.drawNow = function(scene) {
    if (Math.abs(this.X0[3]) < 5) {
        scene.g.fillStyle = "#fff";
        scene.g.beginPath();
        scene.g.arc(this.X0[0] / scene.zoom + scene.origin[0],
                    -this.X0[1] / scene.zoom + scene.origin[1],
                    5-Math.abs(this.X0[3]), 0, twopi,true);
        scene.g.fill();
    }
};

fourEvent.prototype.drawPast = function(scene) {
    // Some condition here similar to below.
    if (Math.abs(this.X0[3] + vec3.length(this.X0)) < 5) {
        scene.g.beginPath();
        scene.g.fillStyle = "#00f";
        scene.g.arc(this.X0[0] / scene.zoom + scene.origin[0],
                   -this.X0[1] / scene.zoom + scene.origin[1], 
                   5-Math.abs(this.X0[3] + vec3.length(this.X0)), 0, twopi, true);
        scene.g.fill();
    }
};

/**
 * Below are various utility callback creators. They can be called when the
 * fourEvent is triggered, or once the audio track has finished playing.
 */
fourEvent.prototype.playCallbacks = function(callbacks, scene) {
    callbacks.forEach(function(callback) {
        switch (callback) {
            case "caption":
            this.pushCaption(scene);
            break;
            
            case "pause":
            this.pause(scene);
            break;
            
            case "nextStep":
            this.nextStep(scene);
            break;
            
            case "audio":
            this.playAudio(scene);
            break;
            
            case "highlightNext":
            this.highlightNext();
            break;
        }
    }, this);
};

fourEvent.prototype.pushCaption = function(scene) {
    scene.pushCaption(this.caption);
};

fourEvent.prototype.pause = function(scene) {
    if (scene.drawing) {
        scene.pause();
    }
};

fourEvent.prototype.nextStep = function(scene) {
    scene.nextStep();
};

fourEvent.prototype.prevStep = function(scene) {
    scene.prevStep();
};

fourEvent.prototype.highlightNext = function() {
    highlightNext();
};

fourEvent.prototype.playAudio = function(scene) {
    var callback = function()  {
        this.playCallbacks(this.audioCallbacks, scene);
    };
    scene.audio.play(this.audioTrack, $.proxy(callback, this));
};
