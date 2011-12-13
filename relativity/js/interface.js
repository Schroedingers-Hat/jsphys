/**
 * User interface event handling -- mouse and keyboard input
 */

"use strict";

var keys = {'q': 'rotateLeft', 'e': 'rotateRight',
            'w': 'boostUp', 's': 'boostDown',
            'a': 'boostLeft', 'd': 'boostRight',
            'space': 'fire'};
var k = new Kibo();

/**
 * Bind all keyboard shortcuts for the given scene.
 */
function bindKeys(scene) {
    k.down('any', function() {
        if (k.lastKey() in keys) {
            scene.actions[keys[k.lastKey()]] = true;
            if (!scene.drawing && !scene.keyDown) {
                scene.beginFrameTime = new Date().time;
                requestAnimFrame(drawScene(scene));
                scene.keyDown = true;
            }
        }
    });

    k.up('any', function() {
        if (k.lastKey() in keys) {
            scene.actions[keys[k.lastKey()]] = false;
        }
    });

    k.down('t', function() {
        scene.options.showTime = !scene.options.showTime;
    });

    k.down('p', function() {
        scene.options.showPos = !scene.options.showPos;
    });

    k.down('z', function(evt) {
        dopplerButtonClick(scene)(evt);
    });

    k.down('h', function() {
        showHelp();
    });
}

/**
 * Change the reference frame to that of the object closest to the mouse
 * cursor when the user clicks. Click on an object and see from its perspective
 */
function clickHandler(scene) {
    return function (e) {
        var offset = $('#canvas').offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

        var minElement = scene.findClosestObject(x, y, 30);

        if (minElement !== false) {
            scene.shiftToFrameOfObject(minElement);
        }
    };
}

/**
 * Zoom a scene to a specified zoom level, move the zoom slider to match, and
 * recalculate the standard boosts to be used when translating with wasd.
 */
function zoomTo(scene, zoom) {
    scene.zoom = zoom;

    scene.boost.right = boostFrom3Vel( 0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0, 0);
    scene.boost.left  = boostFrom3Vel(-0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0, 0);
    scene.boost.up    = boostFrom3Vel(0,  0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0);
    scene.boost.down  = boostFrom3Vel(0, -0.02 * Math.min(20, Math.max(2, scene.zoom)) * c, 0);

    drawLightCone(scene, scene.lCCtx);
    if (!scene.drawing) {
        scene.draw();
    }
    updateSliders(scene);
}

/**
 * Create a callback to work on the specified scene, converting a zoom slider
 * event into a zoom level.
 *
 * The zoom scale goes 0.06 to 40, but representing that in a slider would be awkward.
 * Current zoom steps work in powers of 2, not in a continuous scale. So, the slider
 * goes -4 to 5.5, and is turned into a power of 2. (2^-4 = 0.06, for example.)
 */
function zoomToSlider(scene) {
    return function(event, ui) {
        zoomTo(scene, Math.pow(2, -ui.value));
    };
}

/**
 * Create a pause callback for the specified scene, which will pause it
 * when called.
 */
function doPause(scene) {
    return function(event) {
        if (!scene.drawing) {
            $("#pause").html("Pause");
        } else {
            $("#pause").html("Play");
        }
        scene.pause();
        updateSliders(scene);
        if (event.preventDefault) event.preventDefault();
        else event.returnValue = false;
    };
}

/**
 * Create a callback to be used by the speed slider, converting slider values
 * to a timescale in the specified scene.
 */
function setAnimSpeed(scene) {
    return function(event, ui) {
        if (ui.value > 0) {
            scene.timeScale = Math.pow(2, ui.value) - 1;
        }
        if (ui.value < 0) {
            scene.timeScale = -Math.pow(2, -ui.value) + 1;
        }
        updateSliders(scene);
    };
}

/**
 * If the scene's zoom or speed has change, adjust the sliders in the UI to math
 * the new values.
 */
function updateSliders(scene) {
    $("#zoom-slider").slider("option", "value", -(Math.log(scene.zoom) / Math.LN2));

    $("#speed-slider").slider("option", "value",
                              (Math.log(scene.timeScale + 1) / Math.LN2));
    $("span#speed").text(Math.round(scene.timeScale * 10000) / 10 + "x");
}

/**
 * The Doppler button has three states:
 * - Turn off: Force Doppler shifting to be disabled for all objects in the scene.
 * - Turn on: Force Doppler shifting to be enabled for all objects in the scene.
 * - Default: Do whatever the demo wants.
 */
function dopplerButtonClick(scene) {
    return function(evt) {
        if (!scene.options.neverDoppler && !scene.options.alwaysDoppler) {
            // we're currently in default mode. switch to force off.
            scene.options.neverDoppler = true;
            scene.options.alwaysDoppler = false;
            $("#doppler").html("Turn on");
        } else if (scene.options.neverDoppler && !scene.options.alwaysDoppler) {
            // we're in force off mode. switch to force on.
            scene.options.neverDoppler = false;
            scene.options.alwaysDoppler = true;
            $("#doppler").html("Set default");
        } else {
            // switch to default.
            scene.options.neverDoppler = false;
            scene.options.alwaysDoppler = false;
            $("#doppler").html("Turn off");
        }
        if (evt.preventDefault) evt.preventDefault();
        else evt.returnValue = false;
    };
}

/**
 * Functions like the Doppler button, but in a different order.
 */
function framePosClick(scene) {
    return function(event) {
        if (!scene.options.neverShowFramePos && !scene.options.alwaysShowFramePos) {
            // we're in default mode. switch to force on.
            scene.options.neverShowFramePos = false;
            scene.options.alwaysShowFramePos = true;
            $("#framePos").html("Turn off");
        } else if (!scene.options.neverShowFramePos &&
                   scene.options.alwaysShowFramePos) {
            // we're currently in force on mode. switch to force off.
            scene.options.neverShowFramePos = true;
            scene.options.alwaysShowFramePos = false;
            $("#framePos").html("Set default");
        } else {
            // switch to default.
            scene.options.neverShowFramePos = false;
            scene.options.alwaysShowFramePos = false;
            $("#framePos").html("Turn on");
        }
        if(event.preventDefault) event.preventDefault();
        else event.returnValue = false;
    };
}

function vPosClick(scene) {
    return function(event) {
        if (!scene.options.neverShowVisualPos && !scene.options.alwaysShowVisualPos) {
            // we're in default mode. switch to force on.
            scene.options.neverShowVisualPos = false;
            scene.options.alwaysShowVisualPos = true;
            $("#vPos").html("Turn off");
        } else if (!scene.options.neverShowVisualPos && 
                   scene.options.alwaysShowVisualPos) {
            // we're currently in force on mode. switch to force off.
            scene.options.neverShowVisualPos = true;
            scene.options.alwaysShowVisualPos = false;
            $("#vPos").html("Set default");
        } else {
            // switch to default.
            scene.options.neverShowVisualPos = false;
            scene.options.alwaysShowVisualPos = false;
            $("#vPos").html("Turn on");
        }

        if(event.preventDefault) event.preventDefault();
        else event.returnValue = false;
    };
}

/**
 * Create callback to advance the given scene to the next step.
 */
function nextStep(scene) {
    return function() {
        scene.nextStep(); 
        updateSliders(scene);
    };
}

/**
 * Create callback to move the given scene to the previous step.
 */
function prevStep(scene) {
    return function() {
        scene.prevStep();
        updateSliders(scene);
    };
}

/**
 * Create callback to replay the given scene's current step.
 */
function replay(scene) {
    return function() {
        scene.replay();
        updateSliders(scene);
    };
}

/**
 * Load a demo from the given JSON source file.
 */
function loadDemo(demo, scene) {
    return function() {
        $.getJSON('demos/' + demo.source + '.json', function(data) {
            scene.load(data, 0);
            if (typeof FlashCanvas === "undefined") {
                $("#zoom-slider").slider({min: -5.5, max: 4, step: 0.02,
                                          slide: zoomToSlider(scene),
                                          value: -(Math.log(scene.zoom) / Math.LN2)});
                $("#speed-slider").slider({min: -2 , max: 2, step: 0.001, 
                                           slide: setAnimSpeed(scene),
                                           value: (Math.log(scene.timeScale + 1) / Math.LN2)});
            }
        
            $("#demo-chooser").hide();
            scene.startAnimation();
        });

        // Add this demo to the browser history so users can share links, use
        // back/forward, and so on
        if (window.history)
            if (window.location.hash !== ("#" + demo.source)) {
                window.history.pushState({
                    demo: demo
                }, demo.name, "#" + demo.source);
            } else {
                // Necessary in case the user has followed a direct link to this
                // demo, in which case the history state would not be set yet
                window.history.replaceState({demo: demo}, demo.name);
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
                e = $("<li>" + demo.name + "</li>").click(loadDemo(demo, scene));
                ul.append(e);
            });
        });
    });
}

function showHelp(event) {
    $('#help-screen').toggle();
    if(event.preventDefault) event.preventDefault(); 
    else event.returnValue = false; 
    return false;    
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

// Use JQuery to wait for document load
$(document).ready(function() {
    var viewportWidth = $('body').width() - 16;
    $("#canvas").attr('width', viewportWidth);
    $("#minkowski").attr('width', viewportWidth);
    $("#3DCanvas").attr('width', viewportWidth);
    $('#help-screen').hide();
    var scene = new Scene();

    loadDemoList(scene);
    bindKeys(scene);
    $('#pause').click(doPause(scene));
    $("#canvas").click(clickHandler(scene));

    // To make spacebar work as fire key, disable its usual behavior
    $(window).keypress(function (event) {
        if (event.which === 32) {
            event.preventDefault();
        }
    });

    $("#doppler").click(dopplerButtonClick(scene));
    $('#framePos').click(framePosClick(scene));
    $('#vPos').click(vPosClick(scene));

    $("#nextStep").click(nextStep(scene));
    $("#prevStep").click(prevStep(scene));
    $("#replayStep").click(replay(scene));
    
    $("#help").click(showHelp);
    
    // Capture back/forward events and take them to the corresponding demo,
    // if they've viewed more than one.
    window.onpopstate = function(e) {
        if (e.state) {
            loadDemo(e.state.demo, scene)();
        }
    };

    // If the URL hash contains a demo, load the specified demo and place it
    // in the history so we can go back to it later.
    if (window.location.hash !== "") {
        var demo = window.location.hash.substr(1);
        loadDemo({source: demo, name: demo}, scene)();
    }

    $(window).resize(function() { 
        return function(event) {
            if (typeof FlashCanvas === "undefined") {
                var viewportWidth = $('body').width() - 16;
                $("#canvas").attr('width', viewportWidth);
                $("#minkowski").attr('width', viewportWidth);
                $("#3DCanvas").attr('width', viewportWidth);
                scene.setSize();
            }
        };
    }());
});
