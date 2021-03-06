// Updated for A[3] is timelike, updated for c

"use strict";

// glMatrix defaults to 32-bit arrays, but we'd like 64-bit arrays
// as we sometimes get nasty rounding errors otherwise.
if (typeof Float64Array !== "undefined") {
    glMatrixArrayType = Float64Array;
}

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
var rotLeft  = mat4.create([Math.cos(0.02),  Math.sin(0.02), 0, 0,
                            Math.sin(-0.02), Math.cos(0.02), 0, 0,
                            0,               0,              1, 0,
                            0,               0,              0, 1]);

var rotRight = mat4.create([Math.cos(0.02), Math.sin(-0.02), 0, 0,
                            Math.sin(0.02), Math.cos(0.02),  0, 0,
                            0,              0,               1, 0,
                            0,              0,               0, 1]);
//Not needed for 2D, not right for A[3] is timelike.
//var rotUp = mat4.create([1, 0, 0, 0,
//                         0, 1, 0, 0,
//                         0, 0, Math.cos(0.1), Math.sin(0.1),
//                         0, 0, Math.sin( -0.1), Math.cos(0.1)]);
//var rotDown = mat4.create([1, 0, 0, 0,
//                           0, 1, 0, 0,
//                           0, 0, Math.cos(0.1), Math.sin(-0.1),
//                           0, 0, Math.sin(0.1), Math.cos(0.1)]);

// Convention of using Velocity not multiplied by gamma.

// Take two points [x,y] and return the distance between them.
function getDistance(pt1, pt2) {
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}

/**
 * Takes a 3- or 4-velocity, (vx, vy, [vz,] t), and returns gamma.
 */
function vToGamma(v) {
    if (v.length == 3) {
        return Math.pow((1 - (v[0] * v[0] + v[1] * v[1])/(c*c) ), -0.5);
    }
    if (v.length == 4) {
        return Math.pow((1 - (v[0] * v[0] + v[1] * v[1] + v[2] * v[2])/(c*c) ), -0.5);
    }
}

/**
 * Takes a momentum (0th element Energy) and recalculates the energy
 * from the spatial elements.
 */
function genEnergy(P,c,m) {
    if (P.length == 3) {
        P[2] = Math.pow((c * c + P[0] * P[0] + P[1] * P[1]), 0.5);
    }
    if (P.length == 4) {
        P[3] = Math.pow((c*c * m*m + P[0] * P[0] + P[1] * P[1] + P[2] * P[2]), 0.5);
    }
    return P;
}

/**
 * Takes a velocity and a speed of light and returns a boost matrix 
 * 
 * A bit less efficient than it should be, create some temporary variables lazy
 * git. :/
 * 
 * Until that time, here's an explanation. An acceleration (or boost) in
 * relativity is almost exactly equivalent to a rotation. You can think of a
 * particle/object as moving at the speed of light at all times in the t
 * direction. The acceleration 'rotates' that path so that it is moving in the x
 * direction a little bit as well as the y.  This matrix implements the
 * appropriate cosh(artanh(B)) and similar values, using linear algebra for
 * speed (although not clarity).
 * 
 * One way to get an idea for how hyperbolic space  works is to play with a 
 * triangle. Declare the wrong side to be the hypotenuse, and change the angles.
 * You'll notice that both the opposite and adjacent tend to infinity, so too do
 * x and t intervals for a given proper time (hypotenuse).
 * 
 * I plan to make a demo of this some time.
 * 
 * NB: Does not yet handle boost in z direction. If you give it a z component it
 * will not work correctly.
 */
function cBoostMat(boostV, c) {
    var gamma = boostV[3] / c;
    if (gamma - 1 < 0.0000001) {
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
 */
function boostFrom3Vel(vx, vy, vz) {
    var gamma = vToGamma([vx, vy, vz]);
    return cBoostMat(quat4.create([vx * gamma, vy * gamma, vz * gamma, 
                                   Math.sqrt(c*c + (Math.pow(gamma, 2) * (vx*vx + vy*vy + vz*vz)))]), c);
}

