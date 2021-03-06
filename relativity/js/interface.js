/**
 * User interface event handling -- mouse and keyboard input
 */

"use strict";

var keys = {'q': 'rotateLeft', 'e': 'rotateRight',
            'w': 'boostUp', 's': 'boostDown',
            'a': 'boostLeft', 'd': 'boostRight',
            'left':'boostLeft', 'right': 'boostRight', 
            'up': 'boostUp', 'down':'boostDown',
            'space': 'fire', 'page_up' : 'zoomIn', 'page_down' : 'zoomOut'};
var k = new Kibo();

/**
 * Bind all keyboard shortcuts for the given scene.
 */
function bindKeys(scene) {
    k.down('any', function() {
        if (k.lastKey() in keys) {
            scene.actions[keys[k.lastKey()]] = true;
            if (!scene.drawing && !scene.keyDown) {
                scene.keyDown = true;
                scene.draw();
            }
            return false;
        }
    });

    k.up('any', function() {
        if (k.lastKey() in keys) {
            scene.actions[keys[k.lastKey()]] = false;
            scene.keyDown = false;
        }
    });

    k.down('t', function() {
        scene.options.showTime = !scene.options.showTime;
        scene.ensureUpdate();
    });

    k.down('p', function() {
        scene.options.showPos = !scene.options.showPos;
        scene.ensureUpdate();
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
        var offset = $('#canvas-2d').offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

        var minElement = scene.findClosestObject(x, y, 30);

        if (minElement !== false) {
            scene.shiftToFrameOfObject(minElement);
        }
        scene.ensureUpdate();
    };
}

/**
 * Zoom a scene to a specified zoom level, move the zoom slider to match, and
 * recalculate the standard boosts to be used when translating with wasd.
 */
function zoomTo(scene, zoom) {
    scene.zoom = zoom;

    scene.boost.right = boostFrom3Vel( 0.01 * Math.min(1, Math.max(2, scene.zoom)) , 0, 0);
    scene.boost.left  = boostFrom3Vel(-0.01 * Math.min(1, Math.max(2, scene.zoom)) , 0, 0);
    scene.boost.up    = boostFrom3Vel(0,  0.01 * Math.min(1, Math.max(2, scene.zoom)) , 0);
    scene.boost.down  = boostFrom3Vel(0, -0.01 * Math.min(1, Math.max(2, scene.zoom)) , 0);

    scene.ensureUpdate();
    updateSliders(scene);
}

/**
 * Callback to zoom in one zoom step.
 */
function zoomIn(scene) {
    return function() {
        zoomTo(scene, Math.pow(2, -$("#zoom-slider").slider("value") - 0.12));
        return false;
    };
}

/**
 * Callback to zoom out one step.
 */
function zoomOut(scene) {
    return function() {
        zoomTo(scene, Math.pow(2, -$("#zoom-slider").slider("value") + 0.12));
        return false;
    };
}

/**
 * Create a callback to work on the specified scene, converting a zoom slider
 * event into a zoom level.
 *
 * The zoom scale goes 0.06 - 40, but representing that in a slider would be awkward.
 * Current zoom steps work in powers of 2, not in a continuous scale. So, the slider
 * goes -4 to 5.5, and is turned into a power of 2. (2^-4 = 0.06, for example.)
 */
function zoomToSlider(scene) {
    return function(event, ui) {
        zoomTo(scene, Math.pow(2, -ui.value));
    };
}

function highlightNext() {
    $("#nextStep").addClass("button-highlight");
}

/**
 * Create a pause callback for the specified scene, which will pause it
 * when called.
 */
function doPause(scene) {
    return function(event) {
        if (!scene.drawing) {
            $("#pause").html("Pause");
            $("#pause").removeClass("button-highlight");
        } else {
            $("#pause").html("Play");
            $("#pause").addClass("button-highlight");
        }
        scene.pause();
        updateSliders(scene);
        if (event) {
            if (event.preventDefault) event.preventDefault();
            else event.returnValue = false;
        }
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
        if (ui.value <= 0) {
            scene.timeScale = -Math.pow(2, -ui.value) + 1;
        }
        updateSliders(scene);
    };
}

/**
 * Callback to speed up animation
 */
function speedUp(scene) {
    return function() {
        var curSpeed = $("#speed-slider").slider('value');
        setAnimSpeed(scene)(undefined, {value: curSpeed + 0.002});
        return false;
    };
}

/**
 * Callback to slow down animation
 */
function slowDown(scene) {
    return function() {
        var curSpeed = $("#speed-slider").slider('value');
        setAnimSpeed(scene)(undefined, {value: curSpeed - 0.002});
        return false;
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
    $("span#curSpeed").text(Math.round(scene.timeScale * 10000) / 10 + "x");
}

/**
 * The Doppler setting has three states:
 * - Turn off: Force Doppler shifting to be disabled for all objects in the scene.
 * - Turn on: Force Doppler shifting to be enabled for all objects in the scene.
 * - Default: Do whatever the demo wants.
 */
function dopplerChange(scene) {
    return function(evt) {
        switch(evt.currentTarget.value) {
            case "always":
            scene.options.neverDoppler = false;
            scene.options.alwaysDoppler = true;
            break;
            
            case "never":
            scene.options.neverDoppler = true;
            scene.options.alwaysDoppler = false;
            break;
            
            case "default":
            scene.options.neverDoppler = false;
            scene.options.alwaysDoppler = false;
            break;
        }

        if (evt.preventDefault) evt.preventDefault();
        else evt.returnValue = false;
    };
}

/**
 * Functions like the Doppler setting, but in a different order.
 */
function framePosChange(scene) {
    return function(evt) {
        switch(evt.currentTarget.value) {
            case "always":
            scene.options.neverShowFramePos = false;
            scene.options.alwaysShowFramePos = true;
            break;
            
            case "never":
            scene.options.neverShowFramePos = true;
            scene.options.alwaysShowFramePos = false;
            break;
            
            case "default":
            scene.options.neverShowFramePos = false;
            scene.options.alwaysShowFramePos = false;
            break;
        }
        
        if(event.preventDefault) event.preventDefault();
        else event.returnValue = false;
    };
}

function vPosChange(scene) {
    return function(evt) {
        switch(evt.currentTarget.value) {
            case "always":
            scene.options.neverShowVisualPos = false;
            scene.options.alwaysShowVisualPos = true;
            break;
            
            case "never":
            scene.options.neverShowVisualPos = true;
            scene.options.alwaysShowVisualPos = false;
            break;
            
            case "default":
            scene.options.neverShowVisualPos = false;
            scene.options.alwaysShowVisualPos = false;
            break;
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
        // Disable the Next button when there are no further steps
        if (scene.curStep === scene.demo.steps.length - 1) {
            $("#nextStep").prop('disabled', true);
        }
        $("#prevStep").prop('disabled', false);
        $("#nextStep").removeClass("button-highlight");
        if (scene.audio.numTracks > 0) {
            $("#narrated").removeClass("no-narration");
        } else {
            $("#narrated").addClass("no-narration");
        }
    };
}

/**
 * Create callback to move the given scene to the previous step.
 */
function prevStep(scene) {
    return function() {
        scene.prevStep();
        updateSliders(scene);
        
        if (scene.curStep === 0) {
            $("#prevStep").prop('disabled', true);
        }
        $("#nextStep").prop('disabled', false);
        $("#nextStep").removeClass("button-highlight");
        if (scene.audio.numTracks > 0) {
            $("#narrated").removeClass("no-narration");
        } else {
            $("#narrated").addClass("no-narration");
        }
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
                                          value: -(Math.log(scene.zoom) / Math.LN2),
                                          orientation: "vertical"});
                $("#speed-slider").slider({min: -0.3, max: 0.3, step: 0.001, 
                                           slide: setAnimSpeed(scene),
                                           value: (Math.log(scene.timeScale + 1) / Math.LN2)});
            }
            
            $("#prevStep").prop('disabled', true);
            $("#nextStep").prop('disabled', false);
            $("#demo-chooser").hide();
            if (scene.audio.numTracks > 0) {
                $("#narrated").removeClass("no-narration");
            } else {
                $("#narrated").addClass("no-narration");
            }
            scene.startAnimation();
        });

        // Add this demo to the browser history so users can share links, use
        // back/forward, and so on
        if (window.history) {
            if (window.location.hash !== ("#" + demo.source)) {
                window.history.pushState({
                    demo: demo
                }, demo.name, "#" + demo.source);
            } else {
                // Necessary in case the user has followed a direct link to this
                // demo, in which case the history state would not be set yet
                window.history.replaceState({demo: demo}, demo.name);
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
 * We support three views: "2D", "3D", and "minkowski". This produces a
 * callback which toggles which is visible.
 */
function switchToView(view) {
    return function() {
        $("#canvas-minkowski").hide();
        $('#canvas-2d').hide();
        $('#canvas-3d').hide();
        
        $('#canvas-' + view).show();
        
        $('#view-2d').removeClass('nav-active');
        $('#view-3d').removeClass('nav-active');
        $('#view-minkowski').removeClass('nav-active');
        $('#view-' + view).addClass('nav-active');
    };
}

/**
 * Return mousemove handler for the canvas, which allows us to drag the origin
 * about to navigate.
 */
function shiftOrigin(scene, startX, startY, startOrigin, view) {
    return function(e) {
        if (view == "2D") {
            var newX = startOrigin[0] + e.pageX - startX;
            var newY = startOrigin[1] + e.pageY - startY;
            scene.origin[0] = newX;
            scene.origin[1] = newY;
        } else if (view == "minkowski") {
            var newX = startOrigin[0] + e.pageX - startX;
            var newT = startOrigin[2] + e.pageY - startY;
            scene.origin[0] = newX;
            scene.origin[2] = newT;
        }
        scene.ensureUpdate();
    };
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
    $("#canvas-2d").attr('width', viewportWidth);
    $("#canvas-minkowski").attr('width', viewportWidth);
    $("#canvas-3d").attr('width', viewportWidth);
    $('#help-screen').hide();
    var scene = new Scene();

    loadDemoList(scene);
    bindKeys(scene);
    $('#pause').click(doPause(scene));
    //$("#canvas-2d").click(clickHandler(scene));
    
    $("#canvas-2d").mousedown(function(e) {
        $("#canvas-2d").mousemove(shiftOrigin(scene, e.pageX, e.pageY,
                                              scene.origin.slice(0), '2D'));
    });
    $("#canvas-2d").mouseup(function(e) {
        $("#canvas-2d").unbind('mousemove');
    });
    
    $("#canvas-minkowski").mousedown(function(e) {
        $("#canvas-minkowski").mousemove(shiftOrigin(scene, e.pageX, e.pageY,
                                                     scene.origin.slice(0),
                                                     'minkowski'));
    });
    $("#canvas-minkowski").mouseup(function(e) {
        $("#canvas-minkowski").unbind('mousemove');
    });

    $("#doppler").change(dopplerChange(scene));
    $('#framePos').change(framePosChange(scene));
    $('#vPos').change(vPosChange(scene));
    $("#debug").change(function() {
        // Enable/disable debug mode based on checkbox state
        scene.debug = $("#debug").prop("checked");
        if (scene.debug) {
            // Create global reference to scene for easy debugging
            window.scene = scene;
        } else {
            window.scene = null;
        }
    });

    $("#nextStep").click(nextStep(scene));
    $("#prevStep").click(prevStep(scene));
    $("#replayStep").click(replay(scene));
    
    $("#help").click(showHelp);
    
    $("#zoomIn").click(zoomIn(scene));
    $("#zoomOut").click(zoomOut(scene));
    
    $("#slowDown").click(slowDown(scene));
    $("#speedUp").click(speedUp(scene));
    
    $('#demo-chooser-activate').click(function() {
        $('#demo-chooser').toggle();
    });
    
    $('#settings-activate').click(function() {
        $("#settings").toggle();
        $('#settings-activate').toggleClass('nav-active');
    });
    
    $("#view-minkowski").click(switchToView('minkowski'));
    $("#view-2d").click(switchToView('2d'));
    //$("#view-3d").click(switchToView('3d'));
    
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
                $("#canvas-2d").attr('width', viewportWidth);
                $("#canvas-minkowski").attr('width', viewportWidth);
                $("#canvas-3d").attr('width', viewportWidth);
                scene.setSize();
                scene.ensureUpdate();
            }
        };
    }());
});
