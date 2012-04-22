'use strict';


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
    a.setAttribute('src', 'demos/audio/' + track + '.ogg');
    a.load();
    this.tracks[track] = a;
  },

  /**
     * Play the track. Optionally provide onFinish, a callback which is called
     * when the audio has completed playing.
     */
  play: function(track, onFinish) {
    if (! (track in this.tracks)) {
      throw "Track '" + track + "' cannot be played before being loaded.";
    }

    if (this.currentTrack !== null) {
      // Another track is playing, so queue this one.
      this.queue.push({
        'track': track,
        'onFinish': onFinish
      });
      return;
    }

    if (onFinish) {
      this.tracks[track].addEventListener('ended', onFinish);
    }

    this.tracks[track].addEventListener('ended', $.proxy(this.playbackEnded, this));
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
  }
};


/**
 * Load a demo from the given JSON source file.
 */
function loadDemo(demo, scene) {
  return function() {
    $.getJSON('demos/' + demo.source + '.json', function(data) {
      if (typeof FlashCanvas === 'undefined') {
      }

      $('#prevStep').prop('disabled', true);
      $('#nextStep').prop('disabled', false);
      $('#demo-chooser').hide();
    });

    // Add this demo to the browser history so users can share links, use
    // back/forward, and so on
    if (window.history) {
      if (window.location.hash !== ('#' + demo.source)) {
        window.history.pushState({
          demo: demo
        },
        demo.name, '#' + demo.source);
      } else {
        // Necessary in case the user has followed a direct link to this
        // demo, in which case the history state would not be set yet
        window.history.replaceState({
          demo: demo
        },
        demo.name);
      }
    }
  };
}


/**
 * Builds the demo chooser menu by iterating through our provided demos array.
 */
function loadDemoList(scene) {
  $.getJSON('demos/manifest.json', function(demos) {
    var e;
    $.each(demos, function(category, list) {
      $('#demo-chooser').append('<h4>' + category + '</h4>');
      var ul = $('<ul></ul>').appendTo($('#demo-chooser'));
      list.forEach(function(demo) {
        e = $('<li>' + demo.name + '</li>').click(loadDemo(demo, scene));
        ul.append(e);
      });
    });
  });
}

// Load
loadDemoList(0);
scene = new Scene();
// Main loop

var MainLoop = function(scene) {
  var counter = 0;
  var running = false;
  function run() {
    // Process input.

    // Do bookkeeping with timers and shit for real world times.
    if (counter++% 10 === 0) { console.log(counter);}
    // Process any relevant io.

    // Do update scene stuff.
    if (running) {requestAnimFrame(run);}
  }
  this.start = function() {
    running = true;
    run();
  };
  this.stop = function() {
    running = false;
  };
};
function Scene(canvas) {


}

Scene.prototype = {

};
// Use JQuery to wait for document load
$(document).ready(function() {
  var viewportWidth = $('body').width() - 16;
  $('#canvas').attr('width', viewportWidth);
  $('#help-screen').hide();

  $('#debug').change(function() {
    // Enable/disable debug mode based on checkbox state
  });
  $('#demo-chooser-activate').click(function() {
    $('#demo-chooser').toggle();
  });
  $('#help').click(function() {
    $('#help-screen').toggle();
  });
  $('#settings-activate').click(function() {
    $('#settings').toggle();
    $('#settings-activate').toggleClass('nav-active');
  });
  // If the URL hash contains a demo, load the specified demo and place it
  // in the history so we can go back to it later.
  if (window.location.hash !== '') {
    var demo = window.location.hash.substr(1);
    loadDemo({source: demo, name: demo}, scene)();
  }

  $(window).resize(function() {
    return function(event) {
      if (typeof FlashCanvas === 'undefined') {
        var viewportWidth = $('body').width() - 16;
        $('#canvas').attr('width', viewportWidth);
      }
    };
  }());

  mainLoop = new MainLoop(0);
  mainLoop.start();
});
