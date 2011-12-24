"use strict";

/* 
 * Extended object
 *
 * A rigid, non-rotating body. 
 * Doppler effect, aberration, lorentz transforms all work correctly
 * Headlight effect, and luminosity of black bodies still have some issues.
 * Primarily due to rather extreme dynamic range compression required to
 * do non over/under exposed lighting.
 *
 * Takes:
 * X: Four position, in metres.
 * V: Four velocity dX/dtau in m/s
 * options: Includes labels, various flags about relevant info etc
 * vertices: the position of the vertices relative to the position of the
 *   centre of mass
 * appearance: List of triangles, texture coordinates, lighting info
 * constants: a _reference_ to a set global constants. Values will change,
 *   updating c etc.
 */
 


function newExtendedObject(X, V, options, vertices, appearance, constants){

    this.options = options;

    /*
     * Quantities important for the particle-model of the physics.
     * nX, pX : Four positions as projected on to the present and 
     *   light cone of the local coordinate system.
     * V: Four velocity
     * m: mass
     * iX, eX: Four positions of creation and destruction events.
     *   Object assumed to be created at position given if iX is omitted
     * i/n/pTau initial, current and light cone proper times.
     */
    this.COM = {
        nX: quat4.create(X),
        pX: quat4.create(),
        V: quat4.create(V),
        m: (options.m) ? options.m : 1,
        iX: quat4.create((options.Xi) ? options.Xi : X),
        eX: quat4.create((options.Xe) ? options.Xe : null),
        iTau: (options.initialTau) ? options.initialTau : 0,
        nTau: (options.initialTau) ? options.initialTau : 0,
        pTau: 0
    };
    // Vertices as displacements from the COM of the object.
    this.sVert = vertices;

    this.appearance = appearance;
    
    /*
     * Something along the lines of:
     * {
     *   UV: appearance.UV,
     *   triangles: appearance.triangles,
     *   slight: appearance.slight,
     *  };
     *  and slight will be something like:
     *  slight : [{ temp : 9000, wavelength : 530e-9, lum : 1 }],
     *  where either temp or wavelength is omitted in each element.
    */


    // Vertices in local coordinate system. 
    // At the present (n, for now)
    // And past (p)
    this.iVert = [];
    this.nVert = []; 
    this.pVert = [];

    // Position Left, right, top, bottom, forward and back -most edges
    // of the object in the past present in future.
    this.boundingBoxP = [];
    this.boundingBoxN = [];
    this.boundingBoxF = [];
    // Indeces of vertices that apply to said points.
    this.boundingBoxI= [];

    // The initial boost required to map the rest shape onto the 
    // current frame.
    var initialBoost = cBoostMat([-V[0],
                                  -V[1],
                                  -V[2],
                                   V[3]], c);

    // Map the shape points into the starting reference frame and compute the
    // bounding box as we go.
    var i;
    for (i = 0; i < this.sVert.length; i++) {
        // Map vertex onto initial frame.
        // Create new quat4 to ensure correct data type to deal with rounding error.
        // TODO: Check to see if this redundant after checking use cases.
        this.sVert[i] = quat4.create(mat4.multiplyVec4(initialBoost,this.sVert[i]));
        // Do we even want to track the whole thing on the future light cone?
        this.pVert = quat4.create();
        this.nVert = quat4.create();
    }

}

newExtendedObject.prototype.update = function(displacement, params) {
    // Find the COM, present, future, and past.
    
    // Find bounding boxes, present, future, and past.

    // Find out if we care about anything other than the COM.
    var interesting = this.isInteresting(params);
    // Find out if we need to draw it properly, or just update the
    // bounding box.
    var isBig = this.isBig(params);

    

};
