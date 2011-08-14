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

quat4.spaceTimeDot = function(vec, vec2) {
    return (-c*c * vec[0] * vec2[0]
                 + vec[1] * vec2[1]
                 + vec[2] * vec2[2]
                 + vec[3] * vec2[3]);
}


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
    return vec[1] * vec2[1] + vec[2] * vec2[2];
}


quat4.spaceDot = function(vec, vec2)
{
    return vec[1] * vec2[1] + vec[2] * vec2[2] + vec[3] * vec2[3];
}
