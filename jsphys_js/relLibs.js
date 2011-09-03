// Updated for A[3] is timelike, updated for c

"use strict";

// Convenient constants.
var c; // Default value set in scene.defaults
var nullQuat4 = quat4.create([0,0,0,0]);
var twopi = Math.PI * 2;
var tempVec3 = quat4.create();
var tempQuat4 = quat4.create(); //Use this one, will get rid of tempVec3 eventually.
var tempQuat42 = quat4.create();
var dopplerRoundVal = 20;
var colorFilter = 2;
// Some convenient matrices.
var rotLeft  = mat4.create([ Math.cos(0.1),  Math.sin(0.1),0, 0,
                             Math.sin(-0.1),  Math.cos(0.1), 0, 0,
                             0,              0,             1, 0,
                             0,              0,             0, 1]);

var rotRight = mat4.create([ Math.cos(0.1),  Math.sin(-0.1), 0, 0,
                             Math.sin(0.1), Math.cos(0.1), 0, 0,
                             0,              0,             1, 0,
                             0,              0,             0, 1]);
//Not needed for 2D, not right for A[3] is timelike.
//var rotUp = mat4.create([1, 0, 0, 0,
//                         0, 1, 0, 0,
//                         0, 0, Math.cos(0.1), Math.sin(0.1),
//                         0, 0, Math.sin( -0.1), Math.cos(0.1)]);
//var rotDown = mat4.create([1, 0, 0, 0,
//                           0, 1, 0, 0,
//                           0, 0, Math.cos(0.1), Math.sin(-0.1),
//                           0, 0, Math.sin(0.1), Math.cos(0.1)]);

//Convention of using Velocity not multiplied by gamma.

// Take two points [x,y] and return the distance between them.
function getDistance(pt1, pt2)
{
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}

/**
 * Takes a 3- or 4-velocity, (vx, vy, [vz,] t), and returns gamma.
 */
function vToGamma(v) {
    if (v.length == 3)
    {
        return Math.pow((1 - (v[0] * v[0] + v[1] * v[1])/(c*c) ), -0.5);
    }
    if (v.length == 4)
    {
        return Math.pow((1 - (v[0] * v[0] + v[1] * v[1] + v[2] * v[2])/(c*c) ), -0.5);
    }
}

/**
 * Takes a momentum (0th element Energy) and recalculates the energy
 * from the spatial elements.
 */
function genEnergy(P,c,m) {
    if (P.length == 3)
    {
        P[2] = Math.pow((c * c + P[0] * P[0] + P[1] * P[1]), 0.5);
    }
    if (P.length == 4)
    {
        P[3] = Math.pow((c*c *  m*m + P[0] * P[0] + P[1] * P[1] + P[2] * P[2]), 0.5);
    }
    return P;
}

/**
 * Takes a velocity and a speed of light and returns a boost matrix
 * A bit less efficient than it should be, create some temporary variables lazy git. :/
 *
 * Until that time, here's an explanation.
 * An acceleration (or boost) in relativity is almost exactly equivalent to a rotation.
 * You can think of a particle/object as moving at the speed of light at all times in the t direction,
 * The acceleration 'rotates' that path so that it is moving in the x direction a little bit as well as the y.
 * This matrix implements the appropriate cosh(artanh(B)) and similar values, using linear algebra for speed (although not clarity)
 * One way to get an idea for how hyperbolic space works is to play with a triangle. Declare the wrong side to be the hypotenuse, and change
 * The angles. You'll notice that both the opposite and adjacent tend to infinity, so too do x and t intervals for a given proper time (hypotenuse)
 * I plan to make a demo of this some time.
 *
 * NB: Does not yet handle boost in z direction. If you give it a z component it will not work correctly.
 */
function cBoostMat(boostV, c) {
    var gamma = boostV[3] / c;
    if (1 - gamma == 0)
    {
        return (mat4.create([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));
    }
    var bx = boostV[0] / boostV[3];
    var by = boostV[1] / boostV[3];

    var boostMagSq = (bx * bx) + (by * by);

	return (mat4.create([1 + (gamma - 1) * bx * bx / boostMagSq, (gamma - 1) * bx * by / boostMagSq,     0, -bx * gamma,
                         (gamma - 1) * bx * by / boostMagSq,     1 + (gamma - 1) * by * by / boostMagSq, 0, -by * gamma,
                         0,                                      0,                                      1, 0,
                         -bx * gamma,                            -by * gamma,                            0, gamma]));
}

/**
 * Take a 3-velocity and return a boost matrix from cBoostMat.
 *
 */
function boostFrom3Vel(vx, vy, vz) {
    var gamma = vToGamma([vx, vy, vz]);
    return cBoostMat(quat4.create([vx * gamma, vy * gamma, vz * gamma, 
                                   Math.sqrt(c*c + (Math.pow(gamma, 2) * (vx*vx + vy*vy + vz*vz)))]), c);
}


/**
 * Take a complete shape, consisting of a set of points, and pad the lines
 * between points with additional points. Helps realism with aberration.
 *
 * Resolution is the distance between points on the connecting lines.
 */
function linesPadder(shape, resolution)
{
    var tDisplace = quat4.create();
    var newShape = [];
    var distance;
    var numSteps;
    for(var i = 0; i < shape.length - 1; i++)
    {
        quat4.subtract(shape[i + 1], shape[i], tDisplace);
        distance = Math.sqrt(Math.abs(quat4.spaceDot(tDisplace, tDisplace)));
        numSteps = (Math.round(distance / resolution));
        if (numSteps == 0){
            tDisplace = [0,0,0,0];
        }
        else {
            quat4.scale(tDisplace, (1 / numSteps) );
        }
        for(var j = 0; j <= numSteps; j++ )
        {
            newShape.push(quat4.create(quat4.add(quat4.scale(tDisplace, j, tempQuat4),shape[i], tempQuat4)));
        }
    }
    return newShape;
}

/**
 * Draw a sphere of radius r consisting of numPts points interconnected by lines
 */
function aSphere(r, numPts){
   var Sphere = [];
   var numAngles = Math.ceil(Math.sqrt(numPts));
   for (var i = 0; i < (numAngles); i++){
       for (var j = 0; j < numAngles; j++) {
           Sphere.push( quat4.create([
               Math.cos(6.283 * j / numAngles) * Math.sin(3.1416 * (i+j / numAngles) / numAngles) * r,
               Math.sin(6.283 * j / numAngles) * Math.sin(3.1416 * (i+j / numAngles) / numAngles) * r,
               Math.cos(3.1416 * (i+j / numAngles) /  numAngles) * r,
               0]));
       }
    }
    return Sphere;
}

/**
 * Draw a circle of radius r consisting of numPts points interconnected by lines
 */
function aCircle(r, numPts) {
    var Circle = [];
    for (var i = 0; i <= numPts; i++){
        Circle.push( quat4.create([Math.cos(6.283 * i / numPts + twopi*3/4) * r, 
                                   Math.sin(6.283 * i / numPts + twopi*3/4) * r, 
                                   0, 
                                   0]) );
    }
    return Circle;
}

/**
 * Draw a stick figure with head radius size/2 and width 2*size,
 * with resolution proportional to detail.
 */
function aMan(size, detail){
    var headPts = aCircle(size/2,detail);
    var bodyPts = linesPadder([[0,-1.2*size,0,0],[-size,-0.2*size,0,0],[0,-1.2*size,0,0],
                   [size,-0.2*size,0,0],[0,-1.2*size,0,0],[0,-2*size,0,0],
                   [-size,-3*size,0,0],[0,-2*size,0,0],[size,-3*size,0,0]], 9*size / detail);
    return headPts.concat(bodyPts);
}

/**
 * Draw a potted plant with height roughly 2*size and resolution proportional
 * to detail.
 */
function potPlant(size, detail) {
    var flower = aCircle(size / 5, detail / 5);
    for (var i = 0; i <= detail; i++){
        flower.push( quat4.create([Math.cos(6.283 * i / detail + twopi*3/4) * (size / 5 + size / 3 * Math.abs(Math.sin(2.5*6.283 * i / detail))),
                                   Math.sin(6.283 * i / detail + twopi*3/4) * (size / 5 + size / 3 * Math.abs(Math.sin(2.5*6.283 * i / detail))), 
                                   0, 
                                   0]) );
    }
    var stemPot = linesPadder([[0,        -size / 5,  0, 0], [0,         -size,    0, 0],
                               [-0.5*size, -size,     0, 0], [-0.4*size, -1.8*size,0, 0], 
                               [0.4*size,  -1.8*size, 0, 0], [0.5*size,  -size,    0, 0],
                               [0,         -size,     0, 0]], 8 * size / detail);
    return flower.concat(stemPot);
}
