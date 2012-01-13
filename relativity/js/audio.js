"use strict";

function AudioManager() {
    this.reset();
}

/**
 * The AudioManager implements a queueing system to be used for audio narration
 * of demos. Objects can load media files which should be played, and when those
 * objects decide the media should be played (based on time, a button, or
 * whatever), they call `play`.
 */
AudioManager.prototype = {
    /**
     * Load a track so it will be ready to play in advance.
     */
    load: function(track) {
        var a = document.createElement('audio');
        a.setAttribute('src', 'demos/audio/' + track + '.ogg');
        a.load();
        this.tracks[track] = a;
    },
    
    /**
     * Play the track. Optionally provide onFinish, a callback which is called
     * when the audio has completed playing.
     */
    play: function(track, onFinish) {
        if (!(track in this.tracks)) {
            throw "Track '" + track + "' cannot be played before being loaded.";
        }
        
        if (this.currentTrack !== null) {
            // Another track is playing, so queue this one.
            this.queue.push({"track": track, "onFinish": onFinish});
            return;
        }
        
        if (onFinish) {
            this.tracks[track].addEventListener("ended", onFinish);
        }
        
        var endedCallback = $.proxy(this.playbackEnded, this);
        
        this.tracks[track].addEventListener("ended", endedCallback);
        this.tracks[track].play();
        this.currentTrack = track;
    },
    
    /**
     * When playback of the current track has ended, play the next track in the
     * queue, if necessary.
     */
    playbackEnded: function() {
        this.currentTrack = null;
        this.playFromQueue();
    },
    
    playFromQueue: function() {
        if (this.queue.length > 0) {
            var track = this.queue.shift();
            this.play(track.track, track.onFinish);
        }
    },
    
    /**
     * Pause current audio playback.
     */
    pause: function() {
        this.paused = true;
        if (this.currentTrack) {
            this.resumeTrack = true;
            this.tracks[this.currentTrack].pause();
        }
    },
    
    resume: function() {
        this.paused = false;
        if (this.currentTrack && this.resumeTrack) {
            this.tracks[this.currentTrack].play();
            this.resumeTrack = false;
        }
    },
    
    reset: function() {
        if (this.tracks) {
            $.each(this.tracks, function(name, track) {
                track.pause();
            });
        }
        
        this.tracks = {};
        this.currentTrack = null;
        this.queue = [];
        this.paused = false;
        this.resumeTrack = false;
    }
};
