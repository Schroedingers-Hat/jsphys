jsphys: javascript relativity simulator
=======================================

Provides a canvas-based JavaScript relativistic physics system for use in
demonstrating features of special relativity.

Features
--------

jsphys provies a framework for relativistic demos, using predefined scenarios
to demonstrate relativistic effects. Users can interact with the demos,
changing their reference frames, zooming in and out, and changing the playback
speed. Currently supported effects are:

* Relativistic Doppler shifting
* Length contraction of distances (but not of individual objects)
* Time dilation

Planned effects include relativistic beaming, contraction and aberration of
individual objects, and arbitrarily shaped objects. (Currently the system
only displays main sequence stars.)

Requirements
------------

jsphys uses features like canvas and JavaScript typed arrays, requiring a 
recent browser. It has currently been tested on recent versions of Firefox
and Chrome.

Demo
----

A demo of the work-in-progress version of jsphys is available:

http://schroedingers-hat.github.com/jsphys/jsphys.html
