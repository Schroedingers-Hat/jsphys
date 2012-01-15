"use strict";

/**
 * Create a new fourEvent. Takes an initial position X and a 3-velocity V,
 * which will be rescaled to have a magnitude of c.
 */
function fourEvent(X, options, scene) {
    if (options.caption) {
      this.caption = options.caption;
    }
    if (options.audio) {
        this.audioTrack = options.audio;
        this.audioPlayed = false;
        scene.audio.load(this.audioTrack);
    }
    this.X0 = quat4.create(X);
    // Flag to tell if we've played or not. Set to true when it is in the
    // definite past, and false when it is in the definite future
    this.fired = false;    
    // Is this object in the definite past?
    this.isDefPast = false;
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
    this.X0[3] = this.X0[3] - timeStep;
    // Are we a timelike interval away?
    var isTimeLike = quat4.spaceTimeDot(this.X0, this.X0) < 0;
    // Are we also in the past in the current frame?
    var isPast = this.X0[3] < 0;
    this.isDefPast = isTimeLike && isPast;
};

fourEvent.prototype.changeFrame = function(translation1, rotation, translation2) {
    // Translate.
    quat4.subtract(this.X0, translation1);
    // Boost both velocity and position vectors using the boost matrix.
    mat4.multiplyVec4(rotation, this.X0);
    // Optional translation.
    if (translation2) {
      quat4.subtract(this.X0, translation2);
    }
};

fourEvent.prototype.draw = function(scene) {
    // Later is also back in time if time is reversed.
    if ( this.isDefPast && !this.fired ) {
        if (!this.audioPlayed) {
          this.playCallbacks(this.eventCallbacks, scene);
        }
        this.audioPlayed = true;
        this.fired = true;
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
        doPause(scene)();
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
