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
    	    scene.zoom = scene.zoom / 2;
            if (scene.zoom < 0.06 ) scene.zoom = 0.6;
            boostRight  = cBoostMat(quat4.create([0, 0.02 / scene.zoom, 0, 0]), c);
            boostLeft   = cBoostMat(quat4.create([0, -0.02 / scene.zoom, 0, 0]), c);
            boostUp     = cBoostMat(quat4.create([0, 0, -0.02 / scene.zoom, 0]), c);
            boostDown   = cBoostMat(quat4.create([0, 0, 0.02 / scene.zoom, 0]), c);
    	}
    	else if (evt.keyCode == 109) 
    	{
    	    scene.zoom = scene.zoom * 2;
            if (scene.zoom > 40) scene.zoom = 40;
            boostRight  = cBoostMat(quat4.create([0, 0.02 * scene.zoom, 0, 0]), c);
            boostLeft   = cBoostMat(quat4.create([0, -0.02 * scene.zoom, 0, 0]), c);
            boostUp     = cBoostMat(quat4.create([0, 0, -0.02 * scene.zoom, 0]), c);
            boostDown   = cBoostMat(quat4.create([0, 0, 0.02 * scene.zoom, 0]), c);
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

function zoomTo(zoom) {
    scene.zoom = zoom;
    boostRight  = cBoostMat(quat4.create([0, 0.02 / scene.zoom, 0, 0]), c);
    boostLeft   = cBoostMat(quat4.create([0, -0.02 / scene.zoom, 0, 0]), c);
    boostUp     = cBoostMat(quat4.create([0, 0, -0.02 / scene.zoom, 0]), c);
    boostDown   = cBoostMat(quat4.create([0, 0, 0.02 / scene.zoom, 0]), c);
}

/**
 * Take a slider event and convert it to a zoom event.
 *
 * The zoom scale goes 0.06 to 40, but representing that in a slider would be awkward.
 * Current zoom steps work in powers of 2, not in a continuous scale. So, the slider
 * goes -4 to 5.5, and is turned into a power of 2. (2^-4 = 0.06, for example.)
 */
function zoomToSlider(event, ui) {
    zoomTo(Math.pow(2, ui.value));
}

/**
 * Pause animation
 */
function pause() {
    if (scene.timeScale == 0) {
        scene.timeScale = this.prevTimeScale;
    } else {
        this.prevTimeScale = scene.timeScale;
        scene.timeScale = 0;
    }
    $("#speed-slider").slider("option", "value", (Math.log(scene.timeScale + 1) / Math.LN2));
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

// Use JQuery to wait for document load
$(document).ready(function()
{
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    scene = new Scene();
    scene.load(headOnObjects, 0);
    scene.startAnimation();
    //var interval = setInterval(drawScene, 20);
    $("#canvas").click(clickHandler);
    $("#doppler").change(function() {scene.showDoppler = !scene.showDoppler;});
    $("#zoom-slider").slider({min: -4, max: 5.5, step: 0.5, slide: zoomToSlider,
                              value: (Math.log(scene.zoom) / Math.LN2)});
    $("#speed-slider").slider({min: -2 , max: 2, step: 0.02, slide: setAnimSpeed, 
                               value: (Math.log(1.02) / Math.LN2)});
});

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);
