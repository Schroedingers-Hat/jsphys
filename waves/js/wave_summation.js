/** Global variables for processing.js access **/
var waveSpeed = 3;
var timestep = 0.3;
var w = 0.25;
var w2 = 0.45;
var phaseAngle = 0;
var playing = false;
var pianoPlaying = false;
var pianoNote = 262; // Play middle C
// Relative amplitudes of each harmonic, starting with the fundamental
// Normalized to sum to 1
var pianoAmplitudes = [0.414, 0.275, 0.110, 0.103, 0.097];
var pureAmplitudes = [1, 0, 0, 0, 0];

/** Page setup **/
$(document).ready(function() {
    $("#speed-slider").slider({min: -5, max: 5, step: 0.1, slide: setAnimSpeed,
                           value: timestep});
    $("#wave1-w-slider").slider({min: 0, max: 1, step: 0.01, slide: setW1,
                           value: w});
    $("#wave2-w-slider").slider({min: 0, max: 1, step: 0.01, slide: setW2,
                           value: w2});
    $("#wave-phase-slider").slider({min: 0, max: 6, step: 0.1, slide: setPhase,
                                    value: phaseAngle});
    $("#play").click(function() {
        var processing = Processing.getInstanceById("wave-sum-sim");
        if (playing) {
            processing.noLoop();
            $("#play").html("Play");
        } else {
            processing.loop();
            processing.draw();
            $("#play").html("Pause");
        }
        playing = !playing;
    });

    $("#listen").click(playSound);

    $("#piano-listen").click(playPiano(pianoAmplitudes));
    $("#piano-play").click(function() {
        var processing = Processing.getInstanceById("piano-sim");
        if (pianoPlaying) {
            processing.noLoop();
            $("#piano-play").html("Play");
        } else {
            processing.loop();
            processing.draw();
            $("#piano-play").html("Pause");
        }
        pianoPlaying = !pianoPlaying;
    });

    $("#sine-listen").click(playPiano(pureAmplitudes));
});

function setAnimSpeed(event, ui) {
    timestep = ui.value;
}

function setW1(event, ui) {
    w = ui.value;
}

function setW2(event, ui) {
    w2 = ui.value;
}

function setPhase(event, ui) {
    phaseAngle = ui.value;
}

function playSound() {
    var audio = new Audio(); // create the HTML5 audio element
    var wave = new RIFFWAVE(); // create an empty wave file
    var data = []; // yes, it's an array

    wave.header.sampleRate = 44100; // set sample rate to 44KHz
    wave.header.numChannels = 1; // one channel

    var i = 0;
    while (i < 100000) { 
      data[i++] = 127 + (Math.round(127*Math.sin((w / 10) * i)) + 
                  Math.round(127*Math.sin((w2 / 10) * i))) / 2;
    }

    wave.Make(data); // make the wave file
    audio.src = wave.dataURI; // set audio source
    audio.play();
}

function playPiano(amplitudes) {
    return function () {
        var audio = new Audio(); // create the HTML5 audio element
        var wave = new RIFFWAVE(); // create an empty wave file
        var data = []; // yes, it's an array

        wave.header.sampleRate = 8000; // set sample rate to 8KHz
        wave.header.numChannels = 1; // one channel

        var i = 0;
        while (i < 16000) { 
          var sum = 0;
          for (var j = 0; j < amplitudes.length; j++) {
              sum += Math.round(127 * amplitudes[j] * Math.sin((pianoNote * 2 * (j + 1) * Math.PI / 8000) * i));
          }

          data[i++] = Math.round((127 + sum) * Math.pow(Math.E, -(Math.LOG2E / 4000 * i))) / 2;
        }

        wave.Make(data); // make the wave file
        audio.src = wave.dataURI; // set audio source
        audio.play();
    }
}
