/** Global variables for processing.js access **/
var waveSpeed = 3;
var timestep = 0.3
var k = 0.1;
var k2 = 0.15;
var playing = false;

/** Page setup **/
$(document).ready(function() {
    $("#speed-slider").slider({min: -5, max: 5, step: 0.1, slide: setAnimSpeed,
                           value: timestep});
    $("#wave1-k-slider").slider({min: 0, max: 0.2, step: 0.0125, slide: setK1,
                           value: k});
    $("#wave2-k-slider").slider({min: 0, max: 0.2, step: 0.0125, slide: setK2,
                           value: k2});
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

function setK1(event, ui) {
    k = ui.value;
}

function setK2(event, ui) {
    k2 = ui.value;
}