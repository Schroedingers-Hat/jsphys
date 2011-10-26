/** Very simple piano note simulation. **/

/* @pjs pauseOnBlur="true"; */

float py, pyprev;
float angle, angle2;
float k, k2;
float amplitude = 40;
float t = 0;

float[] ks = new float[5];

// Essentially the wave speed, but large so that the waves appear large
// enough to be distinguishable in the simulation.
float pianoScaleFactor = 3000;

void setup(){
  size(600, 210);
  background (255);
  smooth();
  noLoop();

  for (int i = 0; i < 5; i++) {
    ks[i] = pianoNote * (i + 1) / pianoScaleFactor;
  }
}

void draw(){
  background (255);
  // keep reinitializing to 255, to avoid
  // flashing during redrawing
  angle = 0;
  angle2 = 0;
  

  // Draw axes
  stroke(127);
  strokeWeight(1);
  line(1, 105, width, 105);
  line(width/2, 1, width/2, height);

  stroke(0);

  // Calculate initial point
  sum = 0;
  for (int j = 0; j < 5; j++) {
      sum += 50 * pianoAmplitudes[j] * sin(ks[j] * (- 1) - (pianoNote * (j + 1) / pianoScaleFactor * t));
  }
  pyprev = 105 + sum;

  // Calculate all subsequent points, connecting dots by connecting to the
  // previously drawn point
  for (int i = 0; i < width; i++) {
    float sum = 0;
    for (int j = 0; j < 5; j++) {
        sum += 50 * pianoAmplitudes[j] * sin(ks[j] * i - (pianoNote * (j + 1) / pianoScaleFactor * t));
    }

    py = 105 + sum;

    line(i - 1, pyprev, i, py);
    pyprev = py;
  }

  stroke(0, 0, 127);
  pyprev = 105 + sin(ks[0] * (-1) - (pianoNote / pianoScaleFactor * t)) * amplitude;
  for (int i = 0; i < width; i++) {
      py = 105 + sin(ks[0] * i - (pianoNote / pianoScaleFactor * t)) * amplitude;
      line(i-1, pyprev, i, py);
      pyprev = py;
  }
  
  t += timestep;
}
