// Use JQuery to wait for document load
$(document).ready(function() {
  var viewportWidth = $('body').width() - 16;
  $('#canvas').attr('width', viewportWidth);
  $('#help-screen').hide();

  $('#debug').change(function() {
    // Enable/disable debug mode based on checkbox state
  });
  $('#demo-chooser-activate').click(function() {
    $('#demo-chooser').toggle();
  });
  $('#help').click(function() {
    $('#help-screen').toggle();
  });
  $('#settings-activate').click(function() {
    $('#settings').toggle();
    $('#settings-activate').toggleClass('nav-active');
  });
  // If the URL hash contains a demo, load the specified demo and place it
  // in the history so we can go back to it later.
  if (window.location.hash !== '') {
    var demo = window.location.hash.substr(1);
    loadDemo({source: demo, name: demo}, scene)();
  }

  $(window).resize(function() {
    return function(event) {
      if (typeof FlashCanvas === 'undefined') {
        var viewportWidth = $('body').width() - 16;
        $('#canvas').attr('width', viewportWidth);
      }
    };
  }());

  mainLoop = new MainLoop(0);
  mainLoop.start();
});
