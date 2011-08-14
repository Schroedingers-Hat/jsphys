// Convenient constants.
var c = 2; //Do not change, not fully implemented
var twopi = Math.PI * 2;
var tempVec3 = quat4.create();
var tempQuat4 = quat4.create(); //Use this one, will get rid of tempVec3 eventually.

// Some convenient matrices.
var rotLeft  = mat4.create([1, 0, 0, 0,
                            0, Math.cos(0.1), Math.sin(-0.1), 0,
                            0, Math.sin( 0.1), Math.cos(0.1), 0,
                            0, 0, 0, 1]);
var rotRight = mat4.create([1, 0, 0, 0,
                            0, Math.cos(0.1), Math.sin( 0.1), 0,
                            0, Math.sin(-0.1), Math.cos(0.1), 0,
                            0, 0, 0, 1]);

var rotUp = mat4.create([1, 0, 0, 0,
                         0, 1, 0, 0,
                         0, 0, Math.cos(0.1), Math.sin(0.1),
                         0, 0, Math.sin( -0.1), Math.cos(0.1)]);
var rotDown = mat4.create([1, 0, 0, 0,
                           0, 1, 0, 0,
                           0, 0, Math.cos(0.1), Math.sin(-0.1),
                           0, 0, Math.sin(0.1), Math.cos(0.1)]);

var boostRight  = cBoostMat(quat4.create([0, 0.05, 0, 0]), c);
var boostLeft   = cBoostMat(quat4.create([0, -0.05, 0, 0]), c);
var boostUp     = cBoostMat(quat4.create([0, 0, -0.05, 0]), c);
var boostDown   = cBoostMat(quat4.create([0, 0, 0.05, 0]), c);

//Convention of using Velocity not multiplied by gamma.

// Take two points [x,y] and return the distance between them.
function getDistance(pt1, pt2)
{
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}

/*
 *vToGamma
 *Takes a 3-velocity (0th element time) and returns
 *gamma.
*/
function vToGamma(V) {
    if (V.length == 3)
    {
        return Math.pow((1 - (V[1] * V[1] + V[2] * V[2])/(c*c) ), -0.5);
    }
    if (V.length == 4)
    {
        return Math.pow((1 - (V[1] * V[1] + V[2] * V[2] + V[3] * V[3])/(c*c) ), -0.5);
    }
}

//Takes a momentum (0th element Energy) and re-generates the energy
//From the spacial elements.
function genEnergy(P,c,m) {
    if (P.length == 3)
    {
        P[0] = Math.pow((c * c + P[1] * P[1] + P[2] * P[2]), 0.5);
    }
    if (P.length == 4)
    {
        P[0] = Math.pow((c*c *  m*m + P[1] * P[1] + P[2] * P[2] + P[3] * P[3]), 0.5);
    }
 return P;
}

/*
 * cBoostMat
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
    var gamma = boostV[0] / c;
    var bx = boostV[1] / boostV[0];
    var by = boostV[2] / boostV[0];

    var boostMagSq = (bx * bx) + (by * by);

	return (mat4.create([gamma,       -bx * gamma,                            -by * gamma,                            0,
                         -bx * gamma, 1 + (gamma - 1) * bx * bx / boostMagSq, (gamma - 1) * bx * by / boostMagSq,     0,
                         -by * gamma, (gamma - 1) * bx * by / boostMagSq,     1 + (gamma - 1) * by * by / boostMagSq, 0,
                         0,           0,                                      0,                                      1
                        ]));
}
