"use strict";

/**
 * The AudioManager implements a queueing system to be used for audio narration
 * of demos. Objects can load media files which should be played, and when those
 * objects decide the media should be played (based on time, a button, or
 * whatever), they call `play`. Objects can also specify callbacks which fire
 * when the audio track has completed.
 */
function AudioManager() {
    this.reset();
}

AudioManager.prototype = {
    /**
     * Load a track so it will be ready to play in advance.
     */
    load: function(track) {
        var a = document.createElement('audio');
        var src = document.createElement('source');
        if (a.canPlayType('audio/ogg; codecs="vorbis"') != "") {
            src.setAttribute('src', 'demos/audio/' + track + '.ogg');
            src.setAttribute('type', 'audio/ogg; codecs="vorbis"');
        } else {
            src.setAttribute('src', 'demos/audio/' + track + '.mp3');
            src.setAttribute('type', 'audio/mpeg; codecs="mp3"');
        }
        a.appendChild(src);
        a.load();
        this.tracks[track] = a;
        this.numTracks += 1;
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
        
        this.tracks[track].addEventListener("ended",
                                            $.proxy(this.playbackEnded, this));
        this.tracks[track].play();
        this.currentTrack = track;
    },
    
    /**
     * When playback of the current track has ended, play the next track in the
     * queue, if necessary.
     */
    playbackEnded: function() {
        this.currentTrack = null;
 
        if (this.queue.length > 0) {
            var track = this.queue.shift();
            this.play(track.track, track.onFinish);
        }
    },
    
    /**
     * Pause/resume current audio playback.
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
    
    /**
     * Reset the audio manager, pausing any current tracks before they're
     * destroyed. If the audio were not stopped, switching to a new demo
     * would leave the previous demo's audio running.
     */
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
        this.numTracks = 0;
    }
};
