// Use JQuery to wait for document load
//$(document).ready(function() {
//  var viewportWidth = $('body').width() - 16;
//  $('#canvas').attr('width', viewportWidth);
//  $('#help-screen').hide();
//
//  $('#debug').change(function() {
//    // Enable/disable debug mode based on checkbox state
//  });
//  $('#demo-chooser-activate').click(function() {
//    $('#demo-chooser').toggle();
//  });
//  $('#help').click(function() {
//    $('#help-screen').toggle();
//  });
//  $('#settings-activate').click(function() {
//    $('#settings').toggle();
//    $('#settings-activate').toggleClass('nav-active');
//  });
//  // If the URL hash contains a demo, load the specified demo and place it
//  // in the history so we can go back to it later.
//  if (window.location.hash !== '') {
//    var demo = window.location.hash.substr(1);
//    loadDemo({source: demo, name: demo}, scene)();
//  }
//
//  $(window).resize(function() {
//    return function(event) {
//      if (typeof FlashCanvas === 'undefined') {
//        var viewportWidth = $('body').width() - 16;
//        $('#canvas').attr('width', viewportWidth);
//      }
//    };
//  }());
//
//  mainLoop = new MainLoop(0);
//  mainLoop.start();
//});
//

// Pair of functions to recursively accumulate offsets.
// Because the builtin functions are eminently retarded.
// TODO: Put them somewhere sensible.
function xOffset(item) {
  // If we have a parent, run again on parent and add. Else report offset.
  return item.offsetParent ? xOffset(item.offsetParent) + item.offsetLeft :
                             item.offsetLeft;
}
function yOffset(item) {
  // If we have a parent, run again on parent and add. Else report offset.
  return item.offsetParent ? yOffset(item.offsetParent) + item.offsetTop :
                             item.offsetTop;
}
function rgbStr(r,g,b) {
  return '#' + ((1<<24) + (r<<16) + (g<<8) + b|0).toString(16).slice(1);
}
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
