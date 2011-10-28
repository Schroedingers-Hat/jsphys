/**
 * Travelling wave summation demonstration
 * by Alex Reinhart
 * Based on:
 * Sine Console
 * Processing: Creative Coding and
 * Computational Art
 * By Ira Greenberg */

/* @pjs pauseOnBlur="true"; */

float py, pyprev;
float k, k2;
float amplitude = 50;
float amplitude2 = 50;
float t = 0;

void setup(){
  size(600, 210);
  background (255);
  smooth();
  noLoop();
}

void draw(){
  background (255);
  // keep reinitializing to 255, to avoid
  // flashing during redrawing

  k = w / waveSpeed;
  k2 = w2 / waveSpeed;

  // Draw axes
  stroke(127);
  strokeWeight(1);
  line(1, 105, width, 105);
  line(width/2, 1, width/2, height)

  // Draw first traveling wave -- y1 = sin(k1 x - w1 t)
  stroke(0, 127, 0);
  for (int i = 0; i < width; i++) {
    py = 105 + sin(k * i - (w * t)) * amplitude;
    pyprev = 105 + sin(k * (i-1) - (w * t)) * amplitude;
    line(i-1, pyprev, i, py);
  }

  // Draw second traveling wave -- y1 = sin(k2 x - w2 t)
  stroke(0, 0, 127);
  for (int i = 0; i < width; i++) {
    py = 105 + sin(k2 * i - (w2 * t) - phaseAngle) * amplitude2;
    pyprev = 105 + sin(k2 * (i-1) - (w2 * t) - phaseAngle) * amplitude2;
    line(i-1, pyprev, i, py);
  }
  
  // Draw sum wave
  stroke(0);
  strokeWeight(2);
  for (int i = 0; i < width; i++) {
    py = 105 + sin(k2 * i - (w2 * t) - phaseAngle) * amplitude2 + sin(k * i - (w * t)) * amplitude;
    pyprev = 105 + sin(k * (i-1) - (w * t)) * amplitude + 
             sin(k2 * (i-1) - (w2 * t) - phaseAngle) * amplitude2;
    line(i-1, pyprev, i, py);
  }

  // Draw a spot in the middle, floating on the sum wave
  i = width/2;
  py = 105 + sin(k2 * i - (w2 * t)- phaseAngle) * amplitude2 + sin(k * i - (w * t)) * amplitude;
  ellipse(i, py, 4, 4);
  
  if (playing) {
    t += timestep;
  }
}
