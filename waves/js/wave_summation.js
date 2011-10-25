/** Global variables for processing.js access **/
var waveSpeed = 3;
var timestep = 0.3
var w = 0.25;
var w2 = 0.45;
var playing = false;

/** Page setup **/
$(document).ready(function() {
    $("#speed-slider").slider({min: -5, max: 5, step: 0.1, slide: setAnimSpeed,
                           value: timestep});
    $("#wave1-w-slider").slider({min: 0, max: 1, step: 0.01, slide: setW1,
                           value: w});
    $("#wave2-w-slider").slider({min: 0, max: 1, step: 0.01, slide: setW2,
                           value: w2});
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

function playSound() {
    var audio = new Audio(); // create the HTML5 audio element
    var wave = new RIFFWAVE(); // create an empty wave file
    var data = []; // yes, it's an array

    wave.header.sampleRate = 44100; // set sample rate to 44KHz
    wave.header.numChannels = 1; // one channel

    var i = 0;
    while (i < 100000) { 
      data[i++] = 127 + (Math.round(127*Math.sin((w / 10) * i)) + 
                  Math.round(127*Math.sin((w2 / 10) * i + phaseAngle))) / 2;
    }

    wave.Make(data); // make the wave file
    audio.src = wave.dataURI; // set audio source
    audio.play(); // we should hear two tones one on each speaker
}
