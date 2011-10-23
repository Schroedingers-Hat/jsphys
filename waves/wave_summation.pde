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
float angle, angle2;
float w, w2;
float amplitude = 50;
float amplitude2 = 50;
float t = 0;

void setup(){
  size(600, 200);
  background (0);
  smooth();
  noLoop();
}

void draw(){
  background (255);
  // keep reinitializing to 0, to avoid
  // flashing during redrawing
  angle = 0;
  angle2 = 0;
  w = waveSpeed * k;
  w2 = waveSpeed * k2;
  
  stroke(127);
  
  // Draw first traveling wave -- y1 = sin(k1 x - w1 t)
  for (int i = 0; i < width; i++) {
    py = 100 + sin(k * i - (w * t)) * amplitude;
    pyprev = 100 + sin(k * (i-1) - (w * t)) * amplitude;
    line(i-1, pyprev, i, py);
  }
  
  // Draw second traveling wave -- y1 = sin(k2 x - w2 t)
  for (int i = 0; i < width; i++) {
    py = 100 + sin(k2 * i - (w2 * t)) * amplitude2;
    pyprev = 100 + sin(k2 * (i-1) - (w2 * t)) * amplitude2;
    line(i-1, pyprev, i, py);
  }
  
  stroke(0);
  // Draw sum wave
  for (int i = 0; i < width; i++) {
    py = 100 + sin(k2 * i - (w2 * t)) * amplitude2 + sin(k * i - (w * t)) * amplitude;
    pyprev = 100 + sin(k * (i-1) - (w * t)) * amplitude + 
             sin(k2 * (i-1) - (w2 * t)) * amplitude2;
    line(i-1, pyprev, i, py);
  }
  
  t += timestep;
}
