// Convenient constants.
var c = 1; //Do not change, not fully implemented
var twopi = Math.PI * 2;
var tempVec3 = quat4.create();

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
                        0, 0, Math.sin( -0.1), Math.cos(0.1)
                        ]);
var rotDown = mat4.create([1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, Math.cos(0.1), Math.sin(-0.1),
                        0, 0, Math.sin(0.1), Math.cos(0.1)
                        ]);
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
function vToGamma(V){
    if (V.length == 3)
    {
        return Math.pow((1 - (V[1] * V[1] + V[2] * V[2])/(c*c) ), -0.5);
    }
    if (V.length == 4)
    {
        return Math.pow((1 - (V[1] * V[1] + V[2] * V[2] + V[3] * V[3])/(c*c) ), -0.5);
    }
};

//Takes a momentum (0th element Energy) and re-generates the energy
//From the spacial elements.
genEnergy = function(P,c,m){
    if (P.length == 3)
    {
        P[0] = Math.pow((c * c + P[1] * P[1] + P[2] * P[2]), 0.5);
    }
    if (P.length == 4)
    {
        P[0] = Math.pow((c*c *  m*m + P[1] * P[1] + P[2] * P[2] + P[3] * P[3]), 0.5);
    }
 return P;
};

/*
 * mat3.multiplyVec3
 * Transforms a vec3 with the given matrix
 *
 * Copied from glMatrix mat4.multiplyVec3 function by Brandon Jones. 
 * Not sure why this does not exist. 
 * Check if there is an optimization somewhere?
 *
 * Params:
 * mat - mat3 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */


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
function cBoostMat(boostV,c) {
    var boostMagSq=boostV[1]*boostV[1]+boostV[2]*boostV[2];
	var gamma=vToGamma(boostV);
	return (mat4.create([gamma,            -boostV[1]*gamma,                            -boostV[2]*gamma, 0,
                         -boostV[1]*gamma, 1+(gamma-1)*boostV[1]*boostV[1]/boostMagSq, (gamma-1)*boostV[1]*boostV[2]/boostMagSq, 0,
                         -boostV[2]*gamma, (gamma-1)*boostV[1]*boostV[2]/boostMagSq,   1+(gamma-1)*boostV[2]*boostV[2]/boostMagSq, 0,
                        0, 0, 0, 1
                        ]));
};



/*The following are extensions to and copies of functions from the
 *glMatrix library for various purposes. As the copy of that library in this source is compressed
 * the original licence is below.
*/    
    /* 
     * glMatrix.js - High performance matrix and vector operations for WebGL
     * version 0.9.6
     */
    
    /*
     * Copyright (c) 2011 Brandon Jones
     *
     * This software is provided 'as-is', without any express or implied
     * warranty. In no event will the authors be held liable for any damages
     * arising from the use of this software.
     *
     * Permission is granted to anyone to use this software for any purpose,
     * including commercial applications, and to alter it and redistribute it
     * freely, subject to the following restrictions:
     *
     *    1. The origin of this software must not be misrepresented; you must not
     *    claim that you wrote the original software. If you use this software
     *    in a product, an acknowledgment in the product documentation would be
     *    appreciated but is not required.
     *
     *    2. Altered source versions must be plainly marked as such, and must not
     *    be misrepresented as being the original software.
     *
     *    3. This notice may not be removed or altered from any source
     *    distribution.
     */

mat3.multiplyVec3 = function(mat, vec, dest) {
	if(!dest) { dest = vec }
	
	var x = vec[0], y = vec[1], z = vec[2];
	
	dest[0] = mat[0]*x + mat[3]*y + mat[6]*z;
	dest[1] = mat[1]*x + mat[4]*y + mat[7]*z;
	dest[2] = mat[2]*x + mat[5]*y + mat[8]*z;
	
	return dest;
};

quat4.scale = function(vec, val, dest) {
        if(!dest || vec == dest) {
                vec[0] *= val;
                vec[1] *= val;
                vec[2] *= val;
                vec[3] *= val;
                return vec;
        }
        
        dest[0] = vec[0]*val;
        dest[1] = vec[1]*val;
        dest[2] = vec[2]*val;
        dest[3] = vec[3]*val;
        return dest;
};

quat4.add = function(vec, vec2, dest) {
        if(!dest || vec == dest) {
                vec[0] += vec2[0];
                vec[1] += vec2[1];
                vec[2] += vec2[2];
                vec[3] += vec2[3];
                return vec;
        }
        
        dest[0] = vec[0] + vec2[0];
        dest[1] = vec[1] + vec2[1];
        dest[2] = vec[2] + vec2[2];
        dest[3] = vec[3] + vec2[3];
        return dest;
};


quat4.subtract = function(vec, vec2, dest) {
        if(!dest || vec == dest) {
                vec[0] -= vec2[0];
                vec[1] -= vec2[1];
                vec[2] -= vec2[2];
                vec[3] -= vec2[3];
                return vec;
        }
        
        dest[0] = vec[0] - vec2[0];
        dest[1] = vec[1] - vec2[1];
        dest[2] = vec[2] - vec2[2];
        dest[3] = vec[3] - vec2[3];
        return dest;
};



//Projection of spacial elements of vec onto vec2.
vec3.spaceDot = function(vec, vec2)
{
    if (vec.length == 3)
    {
        return vec[1] * vec2[1] + vec[2] * vec2[2];
    }
    if (vec.length == 4)
    {
        return vec[1] * vec2[1] + vec[2] * vec2[2] + vec[3] * vec2[3];
    }
}


quat4.spaceDot = function(vec, vec2)
{
    if (vec.length == 3)
    {
        return vec[1] * vec2[1] + vec[2] * vec2[2];
    }
    if (vec.length == 4)
    {
        return vec[1] * vec2[1] + vec[2] * vec2[2] + vec[3] * vec2[3];
    }
}

