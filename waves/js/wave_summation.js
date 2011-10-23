/** Global variables for processing.js access **/
var waveSpeed = 3;
var timestep = 0.3
var w = 0.3;
var w2 = 0.45;
var playing = false;

/** Page setup **/
$(document).ready(function() {
    $("#speed-slider").slider({min: -5, max: 5, step: 0.1, slide: setAnimSpeed,
                           value: timestep});
    $("#wave1-w-slider").slider({min: 0, max: 1, step: 0.03, slide: setW1,
                           value: w});
    $("#wave2-w-slider").slider({min: 0, max: 1, step: 0.03, slide: setW2,
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