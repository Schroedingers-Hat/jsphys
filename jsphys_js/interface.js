/**
 * User interface event handling -- mouse and keyboard input
 */

"use strict";
var rightDown = false;
var leftDown = false;
var upDown = false;
var downDown = false;
var rotLeftDown = false;
var rotRightDown = false;
var rotUpDown = false;
var rotDownDown = false;
var ctrlDown = false;
var fireDown = false;
var zoomIn = false;
var timeZoomOut = false;
var timeZoomIn = false;
var speedDown = false;
var speedUp = false;
var zoomOut = false;
var keyIsUseful = false;
var scene;

//TODO: Pull all the keycodes out of here and put them in an array or something.
//Will allow changing the controls to boot.
window.onresize = function(event) {
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    $("#minkowski").attr('width', viewportWidth);
    $("#3DCanvas").attr('width', viewportWidth);
    setSize(scene); 
};

function onKeyPress(event)
{
		if(event.preventDefault) event.preventDefault();
		else event.returnValue = false;
		event.cancel = true;
		return false;

}
// Get Key Input
function onKeyDown(evt)
{

        keyIsUseful = true;
        scene.kC = evt.keyCode;
        if (evt.keyCode == 81) rotLeftDown = true;
		else if (evt.keyCode == 19) doPause(evt);
        else if (evt.keyCode == 69) rotRightDown = true;
        else if (evt.keyCode == 68) rightDown = true;
        else if (evt.keyCode == 65) leftDown = true;
        else if (evt.keyCode == 87) upDown = true;
        else if (evt.keyCode == 83) downDown = true;
        else if (evt.keyCode == 221) speedUp = true;
        else if (evt.keyCode == 219) speedDown = true;
        else if (evt.keyCode == 192) scene.curOptions.showText = !scene.curOptions.showText;
        else if (evt.keyCode == 220) {
            scene.timeScale = -scene.timeScale;
            updateSliders();
        }
        else if (evt.keyCode == 51) scene.curOptions.show3D = !scene.curOptions.show3D;
        else if (evt.keyCode == 32) {
            if (ctrlDown == false) fireDown = true;
            ctrlDown = true;
        }
//        else if (evt.keyCode == 49) rotUpDown = true; //Not needed for 2D
//        else if (evt.keyCode == 50) rotDownDown = true;  //Not needed for 2D

        else if (evt.keyCode == 84) scene.options.showTime = !scene.options.showTime;
        else if (evt.keyCode == 90)
        {
            // $('#doppler').click();
            dopplerButtonClick(evt);
        }
        else if (evt.keyCode == 88)
        {
            framePosClick(evt);
        }
        else if (evt.keyCode == 67)
        {
            vPosClick(evt);
        }
        else if (evt.keyCode == 109 || evt.keyCode == 189)
        {
           zoomOut = true;
        }
        else if (evt.keyCode == 61 || evt.keyCode == 107 || evt.keyCode == 187)
        {
            zoomIn = true;
        }
        else if (evt.keyCode == 188)
        {
           timeZoomOut = true;
        }
        else if (evt.keyCode == 190)
        {
            timeZoomIn = true;
        }
        else if (evt.keyCode == 80)
        {
            scene.options.showPos = !scene.options.showPos;
        } else keyIsUseful = false;
        if (!scene.drawing && !scene.keyDown && keyIsUseful){
            scene.beginFrameTime = new Date().time;
            requestAnimFrame(drawScene);
            scene.keyDown = true;
        }

		if(evt.preventDefault) evt.preventDefault();
		else evt.returnValue = false;
		evt.cancel = true;
		return false;

}

function onKeyUp(evt)
{


    if (evt.keyCode == 68) rightDown = false;
    else if (evt.keyCode == 65) leftDown = false;
    else if(evt.keyCode == 87) upDown = false;
    else if(evt.keyCode == 83) downDown = false;
    else if (evt.keyCode == 61 || evt.keyCode == 107 || evt.keyCode == 187) zoomIn = false;
    else if (evt.keyCode == 109 || evt.keyCode == 189) zoomOut = false;
    else if (evt.keyCode == 188) timeZoomOut = false;
    else if (evt.keyCode == 190) timeZoomIn = false;
    else if (evt.keyCode == 69) rotRightDown = false;
    else if (evt.keyCode == 81) rotLeftDown = false;
    else if (evt.keyCode == 219) speedDown = false;
    else if (evt.keyCode == 221) speedUp = false;
    else if (evt.keyCode == 32) ctrlDown = false;
//    else if (evt.keyCode == 49) rotUpDown = false;
//    else if (evt.keyCode == 50) rotDownDown = false;
    scene.keyDown = false;
}

/**
 * Change the reference frame to that of the object closest to the mouse
 * cursor when the user clicks. Click on an object and see from its perspective.
 */
function clickHandler(e)
{
    var offset = $('#canvas').offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;

    var minElement = scene.findClosestObject(x, y, 30);

    if (minElement != false) {
        scene.shiftToFrameOfObject(minElement);
    }
}

/**
 * Zoom to a specified zoom level, move the zoom slider to match, and
 * recalculate the standard boosts to be used when translating with wasd.
 */
function zoomTo(zoom) {
    scene.zoom = zoom;

    scene.boost.right = boostFrom3Vel( 0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0, 0);
    scene.boost.left  = boostFrom3Vel(-0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0, 0);
    scene.boost.up    = boostFrom3Vel(0,  0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0);
    scene.boost.down  = boostFrom3Vel(0, -0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0);

    drawLightCone(scene, scene.lCCtx);
    updateSliders();
}

/**
 * Take a slider event and convert it to a zoom event.
 *
 * The zoom scale goes 0.06 to 40, but representing that in a slider would be awkward.
 * Current zoom steps work in powers of 2, not in a continuous scale. So, the slider
 * goes -4 to 5.5, and is turned into a power of 2. (2^-4 = 0.06, for example.)
 */
function zoomToSlider(event, ui) {
    zoomTo(Math.pow(2, -ui.value));
}

/**
 * Pause animation
 */
function doPause(event) {
    if (!scene.drawing) {
        $("#pause").html("Pause");
    } else {
        $("#pause").html("Play");
    }
    scene.pause();
    updateSliders();
    if(event.preventDefault) event.preventDefault();
    else event.returnValue = false;
}

function setAnimSpeed(event, ui) {
    if (ui.value > 0) {
        scene.timeScale = Math.pow(2, ui.value) - 1;
    }16
    if (ui.value < 0) {
        scene.timeScale = -Math.pow(2, -ui.value) + 1;
    }
}

/**
 * Do not quite comprehend what this does, copypasta from Paul Irish's tutorial
 * requestAnim shim layer by Paul Irish
 */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60 );
          };
})();

/**
 * Take an index into the demos array and play the matching demo.
 */
function loadDemo(idx) {
    return function() {
        scene.load(demos[idx], 0);
        if (typeof FlashCanvas != "undefined") {

        } else {
        $("#zoom-slider").slider({min: -5.5, max: 4, step: 0.02, slide: zoomToSlider,
                                   value: -(Math.log(scene.zoom) / Math.LN2)});
        $("#speed-slider").slider({min: -2 , max: 2, step: 0.001, slide: setAnimSpeed,
                                    value: (Math.log(scene.timeScale + 1) / Math.LN2)});
        }
         $("#demo-chooser").hide();
        scene.startAnimation();
    };
}

function updateSliders() {
    $("#zoom-slider").slider("option", "value", -(Math.log(scene.zoom) / Math.LN2));

    $("#speed-slider").slider("option", "value",
                              (Math.log(scene.timeScale + 1) / Math.LN2));
}

/**
 * Builds the demo chooser menu by iterating through our provided demos array.
 */
function loadDemoList() {
    var e;
    var demo;
    for (var idx=0; idx < demos.length; idx++) {
        e = $("<li>" + demos[idx].name + "</li>").click(loadDemo(idx));
        $("#demo-list").append(e);
    }
}

/**
 * The Doppler button has three states:
 * - Force off: Force Doppler shifting to be disabled for all objects in the scene.
 * - Force on: Force Doppler shifting to be enabled for all objects in the scene.
 * - Default: Do whatever the demo wants.
 */
function dopplerButtonClick(event) {
    if (!scene.options.neverDoppler && !scene.options.alwaysDoppler) {
        // we're currently in default mode. switch to force off.
        scene.options.neverDoppler = true;
        scene.options.alwaysDoppler = false;
        $("#doppler").html("Force on");
    } else if (scene.options.neverDoppler && !scene.options.alwaysDoppler) {
        // we're in force off mode. switch to force on.
        scene.options.neverDoppler = false;
        scene.options.alwaysDoppler = true;
        $("#doppler").html("Default");
    } else {
        // switch to default.
        scene.options.neverDoppler = false;
        scene.options.alwaysDoppler = false;
        $("#doppler").html("Force off");
    }
    if(event.preventDefault) event.preventDefault();
    else event.returnValue = false;
}

/**
 * Functions like the Doppler button, but in a different order.
 */
function framePosClick(event) {
    if (!scene.options.neverShowFramePos && !scene.options.alwaysShowFramePos) {
        // we're in default mode. switch to force on.
        scene.options.neverShowFramePos = false;
        scene.options.alwaysShowFramePos = true;
        $("#framePos").html("Force off");
    } else if (!scene.options.neverShowFramePos && scene.options.alwaysShowFramePos) {
        // we're currently in force on mode. switch to force off.
        scene.options.neverShowFramePos = true;
        scene.options.alwaysShowFramePos = false;
        $("#framePos").html("Default");
    } else {
        // switch to default.
        scene.options.neverShowFramePos = false;
        scene.options.alwaysShowFramePos = false;
        $("#framePos").html("Force on");
    }
    if(event.preventDefault) event.preventDefault();
    else event.returnValue = false;
}

function vPosClick(event) {
    if (!scene.options.neverShowVisualPos && !scene.options.alwaysShowVisualPos) {
        // we're in default mode. switch to force on.
        scene.options.neverShowVisualPos = false;
        scene.options.alwaysShowVisualPos = true;
        $("#vPos").html("Force off");
    } else if (!scene.options.neverShowVisualPos && scene.options.alwaysShowVisualPos) {
        // we're currently in force on mode. switch to force off.
        scene.options.neverShowVisualPos = true;
        scene.options.alwaysShowVisualPos = false;
        $("#vPos").html("Default");
    } else {
        // switch to default.
        scene.options.neverShowVisualPos = false;
        scene.options.alwaysShowVisualPos = false;
        $("#vPos").html("Force on");
    }

    if(event.preventDefault) event.preventDefault();
    else event.returnValue = false;
}
// Use JQuery to wait for document load
$(document).ready(function()
{
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    $("#minkowski").attr('width', viewportWidth);
    $("#3DCanvas").attr('width', viewportWidth);
    scene = new Scene();

    loadDemoList();
    //$(document).keydown(onKeyDown);
    //$(document).keyup(onKeyUp);
    //$("#pause").click(pause);
    $("#canvas").click(clickHandler);
    //$("#doppler").click(dopplerButtonClick);
    //$('#framePos').click(framePosClick);
    //$('#vPos').click(vPosClick);

});


