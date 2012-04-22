/**
 * Load a demo from the given JSON source file.
 */
function loadDemo(demo, scene) {
  return function() {
    $.getJSON('demos/' + demo.source + '.json', function(data) {
      if (typeof FlashCanvas === 'undefined') {
      }

      $('#prevStep').prop('disabled', true);
      $('#nextStep').prop('disabled', false);
      $('#demo-chooser').hide();
    });

    // Add this demo to the browser history so users can share links, use
    // back/forward, and so on
    if (window.history) {
      if (window.location.hash !== ('#' + demo.source)) {
        window.history.pushState({
          demo: demo
        },
        demo.name, '#' + demo.source);
      } else {
        // Necessary in case the user has followed a direct link to this
        // demo, in which case the history state would not be set yet
        window.history.replaceState({
          demo: demo
        },
        demo.name);
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
        e = $('<li>' + demo.name + '</li>').click(loadDemo(demo, scene));
        ul.append(e);
      });
    });
  });
}

