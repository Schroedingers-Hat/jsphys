/**
 * User interface event handling -- mouse and keyboard input
 */

var rightDown = false;
var leftDown = false;
var upDown = false;
var downDown = false;
var rotLeftDown = false;
var rotRightDown = false;
var rotUpDown = false;
var rotDownDown = false;
var scene;

//TODO: Pull all the keycodes out of here and put them in an array or something.
//Will allow changing the controls to boot.

// Get Key Input
function onKeyDown(evt) 
{
    	if (evt.keyCode == 81) rotLeftDown = true;
    	else if (evt.keyCode == 69) rotRightDown = true;
        else if (evt.keyCode == 68) rightDown = true;
    	else if (evt.keyCode == 65) leftDown = true;
    	else if (evt.keyCode == 87) upDown = true;
    	else if (evt.keyCode == 83) downDown = true;
//    	else if (evt.keyCode == 49) rotUpDown = true; //Not needed for 2D 
//    	else if (evt.keyCode == 50) rotDownDown = true;  //Not needed for 2D

        else if (evt.keyCode == 84) scene.displayTime = !scene.displayTime;
        else if (evt.keyCode == 90)
        {
            scene.showDoppler = !scene.showDoppler;
        }
        else if (evt.keyCode == 88)
        {
            scene.showFramePos = !scene.showFramePos;
        }
        else if (evt.keyCode == 67)
        {
            scene.showVisualPos = !scene.showVisualPos;
        }
    	else if (evt.keyCode == 61) 
    	{
            if (scene.zoom < 0.06 ) zoomTo(0.6);
            else zoomTo(scene.zoom / 2);
    	}
    	else if (evt.keyCode == 109) 
    	{
            if (scene.zoom > 40) zoomTo(40);
            else zoomTo(scene.zoom * 2);
    	}
}

function onKeyUp(evt) 
{
	if (evt.keyCode == 68) rightDown = false;
	else if (evt.keyCode == 65) leftDown = false;
	else if(evt.keyCode == 87) upDown = false;
	else if(evt.keyCode == 83) downDown = false;
	else if (evt.keyCode == 69) rotRightDown = false;
	else if (evt.keyCode == 81) rotLeftDown = false; 
//	else if (evt.keyCode == 49) rotUpDown = false;  
//	else if (evt.keyCode == 50) rotDownDown = false;  
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
    scene.boost.up = boostFrom3Vel(0, -0.02 * scene.zoom * c, 0, scene.zoom);
    scene.boost.down = boostFrom3Vel(0, 0.02 * scene.zoom * c, 0, scene.zoom);

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
    if (scene.timeScale == 0) {
        $("#pause").html("Pause");
        scene.timeScale = this.prevTimeScale;
    } else {
        $("#pause").html("Play");
        this.prevTimeScale = scene.timeScale;
        scene.timeScale = 0;
    }
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

// Use JQuery to wait for document load
$(document).ready(function()
{
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    scene = new Scene();
    
    loadDemoList();

    $("#pause").click(pause);
    $("#canvas").click(clickHandler);
    $("#doppler").change(function() {scene.options.showDoppler = !scene.options.showDoppler;});
    $("#framePos").change(function() {scene.options.showFramePos = !scene.options.showFramePos;});
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
});
