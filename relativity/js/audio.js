"use strict";

function AudioManager() {
    this.tracks = {};
    this.currentTrack = null;
    this.queue = [];
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
            throw "Track cannot be played before being loaded.";
        }
        
        if (this.currentTrack === track) {
            // Let it finish.
            return;
        } else if (this.currentTrack !== null) {
            // Another track is playing, so queue this one.
            this.queue.push(track);
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
        
        if (this.queue.length > 0) {
            this.play(this.queue.shift());
        }
    }
};
