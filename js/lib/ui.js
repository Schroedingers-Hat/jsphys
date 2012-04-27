/** @module jsphys/lib/UI*/

/**
  Holds miscellaneous functions for dealing with the browser.
  @namespace UI
*/
var UI = {};
// Pair of functions to recursively accumulate offsets.
// Because the builtin functions are eminently retarded.
// TODO: Put them somewhere sensible.
/**
  @memberOf UI
*/
UI.xOffset = function(item) {
  // If we have a parent, run again on parent and add. Else report offset.
  return item.offsetParent ? UI.xOffset(item.offsetParent) + item.offsetLeft :
                             item.offsetLeft;
};
/**
@memberOf UI
*/
UI.yOffset = function(item) {
  // If we have a parent, run again on parent and add. Else report offset.
  return item.offsetParent ? UI.yOffset(item.offsetParent) + item.offsetTop :
                             item.offsetTop;
};
/**
@memberOf UI
Convert r,g,b as numbers between 0 and 256 to a string in format '#ffffff'
*/
UI.rgbStr = function(r,g,b) {
  return '#' + ((1<<24) + (r<<16) + (g<<8) + b|0).toString(16).slice(1);
};

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

