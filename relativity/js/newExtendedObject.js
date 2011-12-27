"use strict";

var findBB = function(vertices, boundingBox, boundingBoxIdx) {
};


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
 


function newExtendedObject(X, V, options, appearance, constants){

    this.options = options;

    this.constants = constants;
    /*
     * Quantities important for the particle-model of the physics.
     * nX, pX : Four positions as projected on to the present and 
     *   light cone of the local coordinate system.
     * V: Four velocity
     * m: mass
     * iX, eX: Four positions of creation and destruction events. in global frame
     * riX, reX: Same in rotated frame
     *   Object assumed to be created at position given if iX is omitted
     * i/n/pTau initial, current and light cone proper times.
     */
    this.COM = {
        nX: quat4.create(X),    // Position of future light cone intersection in current coords.
        pX: quat4.create(),     // Ditto for past cone.
        V: quat4.create(V),     // Un-transformed velocity.
        rV: quat4.create(V),    // Boosted/rotated V
        m: (options.m) ? options.m : 1,
        iX: quat4.create((options.Xi) ? options.Xi : X),
        eX: quat4.create((options.Xe) ? options.Xe : null),
        riX: quat4.create((options.Xi) ? options.Xi : X),       // Initial and final events in rotated/boosted frame
        reX: quat4.create((options.Xe) ? options.Xe : null),
        iTau: (options.initialTau) ? options.initialTau : 0,    // Proper time of creation event, present and past-cone interaction.
        nTau: (options.initialTau) ? options.initialTau : 0,
        pTau: 0
        // Object with more than two of V, X, iX, and Xe defined will be over-determined.
        // TODO: Throw some kind of error, and choose a default case.
    };
    // Vertices as displacements from the COM of the object.
//    this.sVert = vertices;
    this.sVert = appearance.vertices;
    this.appearance = appearance;

    this.appearance.slight.temp = options.temp;
    this.appearance.slight.wavelength = options.wavelength;
    this.appearance.slight.lum =  options.lum;
    this.appearance.v = V;
    /*
     * Appearance should be something along the lines of:
     * {
     *   UV: appearance.UV,
     *   triangles: appearance.triangles,
     *   slight: appearance.slight,
     *   vertices: reference to set of vertices that is currently being drawn (past,present etc).
     *   v: reference to relevant velocity
     *   normals: surface normals of the object in its own frame, per vector as we're doing guoraud shading.
     *  };
     *  and slight will be something like:
     *  slight : [{ temp : 9000, wavelength : 530e-9, lum : 1 }],
     *  where either temp or wavelength is omitted in each element.
    */


    // Vertices in local coordinate system. 
    // At the present (n, for now)
    // And past (p)

    this.nVert = []; 
    this.pVert = [];
    this.fVert = [];
    // Sacrifice memory (we have plenty) for cpu cycles (not so plentiful).
    // iVert is the vertices in the global coordinate system as they are defined in the demo.
    // rVert is the vertices in the boosted/rotated but not translated coordinate system.
    // This way boosts/rotations only need to be calculated on frame change.
    this.iVert = [];
    this.rVert = [];

    // Position Left, right, top, bottom, forward and back -most edges
    // of the object in the past present in future.
    this.pBB = [];
    this.nBB = [];
    this.fBB = [];
    // Indeces of vertices that apply to said points.
    this.iBB= [];

    // The initial boost required to map the rest shape onto the 
    // current frame.
    var initialBoost = cBoostMat([-V[0],
                                  -V[1],
                                  -V[2],
                                   V[3]], this.constants.c);

    // Map the shape points into the starting reference frame and compute the
    // bounding box as we go.
    var i;
    for (i = 0; i < this.sVert.length; i++) {

        // Map vertex onto initial frame.
        // Create new quat4 to ensure correct data type to deal with rounding error.
        // TODO: Check to see if this redundant after checking use cases.
        mat4.multiplyVec4(initialBoost,this.sVert[i]);
        this.iVert[i] = [this.sVert[i][0] + X[0],
                         this.sVert[i][1] + X[1],
                         this.sVert[i][2] + X[2],
                         this.sVert[i][3] + X[3]];

        this.rVert[i] = quat4.create(this.iVert[i]);
        // Do we even want to track the whole thing on the future light cone?
        this.fVert[i] = quat4.create();
        this.pVert[i] = quat4.create();
        this.nVert[i] = quat4.create();
    }
    // If it's interesting we care about drawing it etc.
    this.interesting = true;
    // If it's bigger than a threshold size in pixels,
    // we want to draw it properly, along with finding all the indeces
    // otherwise a splodge will do.
    this.isBig = true;
    this.wasBig = true;


    this.appearance.vertices =  this.iVert;
}


newExtendedObject.prototype = {
    // Takes a displacement of local coordinates from the origin in rotated/boosted
    //  coordinates.
    // Translates present/past pts to the correct position in local coordinates.
    // This is as efficient as using translations from local coordinates, 
    // but does not suffer from cumulative round-off error.

    update : function(displacement, params) {
        // Find the COM, present, future, and past.
        
    
        // Find out if we care about anything other than the COM.
        // Reasons may include extremes of distance, timing (did it
        // suddenly come into existence etc), settings
        this.interesting = this.isInteresting(params);
        var isInView = true,
            wasInView = true,
            isBig = true,
            wasBig = true;
    
        if (this.interesting){
            // If it's interesting, we'll update the bounding boxes and think about
            // drawing it.

            // Find bounding boxes, present, future, and past.
            findBB(this.nVert, this.nBB, this.iBB);
            findBB(this.pVert, this.pBB, this.iBB);
            findBB(this.fVert, this.fBB, this.iBB);


            // Find out if we need to draw it properly, or just update the
            // bounding box.
            if ( this.doPresent(params) && isInView ){
                if (isBig) {
                    // Update all the vertices and draw the whole thing.
                } else { 
                    // Draw a splodge
                }
            }
            if ( this.doPast(params) && wasInView ){
                if (wasBig) {
                    // Update all the vertices and draw the whole thing.
                } else { 
                    // Draw a splodge
                }
            }
        }
    },
    // changeFrame:
    // takes a transformation from global coordinates, updates rotated/boosted
    // coordinates to be correct from new frame.
    changeFrame: function(transform) {
        return;    
    },
    isInteresting: function(){
        return true;
    },
    doPresent: function() {
        // Check everything necessary to find out if we're updating/drawing
        // The present vertices.
        return true;
    },
    doPast: function() {
        // Check everything necessary to find out if we're updating/drawing
        // The past vertices.
        return true;
    }

};


