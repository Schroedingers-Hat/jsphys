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
var zoomOut = false;
var scene;

//TODO: Pull all the keycodes out of here and put them in an array or something.
//Will allow changing the controls to boot.

// Get Key Input
function onKeyDown(evt) 
{
        
        scene.kC = evt.keyCode;
    	if (evt.keyCode == 81) rotLeftDown = true;
    	else if (evt.keyCode == 69) rotRightDown = true;
        else if (evt.keyCode == 68) rightDown = true;
    	else if (evt.keyCode == 65) leftDown = true;
    	else if (evt.keyCode == 87) upDown = true;
    	else if (evt.keyCode == 83) downDown = true;
		else if (evt.keyCode == 51) scene.curOptions.show3D = !scene.curOptions.show3D;
        else if (evt.keyCode == 17) {
            if (ctrlDown == false) fireDown = true;
            ctrlDown = true;
        }
//    	else if (evt.keyCode == 49) rotUpDown = true; //Not needed for 2D 
//    	else if (evt.keyCode == 50) rotDownDown = true;  //Not needed for 2D

        else if (evt.keyCode == 84) scene.options.showTime = !scene.options.showTime;
        else if (evt.keyCode == 90)
        {
            $('#doppler').click();
        }
        else if (evt.keyCode == 88)
        {
            $('#framePos').click();
        }
        else if (evt.keyCode == 67)
        {
            $('#vPos').click();
        }
    	else if (evt.keyCode == 61 || evt.keyCode == 107) 
    	{
            zoomIn = true;
    	}
    	else if (evt.keyCode == 109) 
    	{
           zoomOut = true; 
    	}
        else if (evt.keyCode == 80)
        {
            scene.options.showPos = !scene.options.showPos;
        }
        if (!scene.drawing && !scene.keyDown){
            scene.beginFrameTime = new Date().time;
            requestAnimFrame(drawScene);
            scene.keyDown = true;
        }
}

function onKeyUp(evt) 
{
	if (evt.keyCode == 68) rightDown = false;
	else if (evt.keyCode == 65) leftDown = false;
	else if(evt.keyCode == 87) upDown = false;
	else if(evt.keyCode == 83) downDown = false;
    else if (evt.keyCode == 61 || evt.keyCode == 107) zoomIn = false;
    else if (evt.keyCode == 109) zoomOut = false;
	else if (evt.keyCode == 69) rotRightDown = false;
	else if (evt.keyCode == 81) rotLeftDown = false;
    else if (evt.keyCode == 17) ctrlDown = false;
//	else if (evt.keyCode == 49) rotUpDown = false;  
//	else if (evt.keyCode == 50) rotDownDown = false;  
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

    scene.boost.right = boostFrom3Vel(0.02 * scene.zoom * c, 0, 0, scene.zoom);
    scene.boost.left = boostFrom3Vel(-0.02 * scene.zoom * c, 0, 0, scene.zoom);
    scene.boost.up = boostFrom3Vel(0, 0.02 * scene.zoom * c, 0, scene.zoom);
    scene.boost.down = boostFrom3Vel(0, -0.02 * scene.zoom * c, 0, scene.zoom);

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
function pause(event) {
    if (!scene.drawing) {
        $("#pause").html("Pause");
    } else {
        $("#pause").html("Play");
    }
    scene.pause();
    updateSliders();
    event.preventDefault();
}

function setAnimSpeed(event, ui) {
    if (ui.value > 0) {
        scene.timeScale = Math.pow(2, ui.value) - 1;
    }
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
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * Take an index into the demos array and play the matching demo.
 */
function loadDemo(idx) {
    return function() {
        scene.load(demos[idx], 0);
        $("#zoom-slider").slider({min: -5.5, max: 4, step: 0.5, slide: zoomToSlider,
                                  value: -(Math.log(scene.zoom) / Math.LN2)});
        $("#speed-slider").slider({min: -2 , max: 2, step: 0.02, slide: setAnimSpeed, 
                                   value: (Math.log(scene.timeScale + 1) / Math.LN2)});
        $("#demo-chooser").hide();
        scene.startAnimation();
        requestAnimFrame(drawScene);
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
    demos.forEach(function(demo, idx) {
        var e = $("<li>" + demo.name + "</li>").click(loadDemo(idx));
        $("#demo-list").append(e);
    })
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
    event.preventDefault();
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
    event.preventDefault();
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
    event.preventDefault();
}
// Use JQuery to wait for document load
$(document).ready(function()
{
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    scene = new Scene();
    
    loadDemoList();

    $("#pause").click(pause);
    $("#canvas").click(clickHandler);
    $("#doppler").click(dopplerButtonClick);
    $('#framePos').click(framePosClick);
    $('#vPos').click(vPosClick);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
});
