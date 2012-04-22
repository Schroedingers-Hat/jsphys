// Load
loadDemoList(0);
scene = new Scene();
// Main loop

var MainLoop = function(scene) {
  var counter = 0;
  var running = false;
  function run() {
    // Process input.

    // Do bookkeeping with timers and shit for real world times.
    if (counter++% 10 === 0) { console.log(counter);}
    // Process any relevant io.

    // Do update scene stuff.
    if (running) {requestAnimFrame(run);}
  }
  this.start = function() {
    running = true;
    run();
  };
  this.stop = function() {
    running = false;
  };
};
