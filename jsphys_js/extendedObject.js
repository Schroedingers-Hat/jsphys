
/* Creates an extended object which will behave relativistically.
 * Materials - List of materials so spectrum can be defined
 * Shape - array of 3d points, stroked in order, note that straight lines
 * aren't invariant, so if you want an accurate shape, use lots of points.
 *
 * One can put parts of it at any time or velocity. Points have independant, but linked world lines.
 * When placing moving objects, the results will not necessarily be intuitive.
 * If the expected behavior is required, then boost it after placing it so that it is stationary.
 *
 * Cpu wise, these will be as expensive as an inertial object while they are in view for every point in them
 * When out of view they only cost as much as a single inertial object.
 *
 * Has a boundingBox to decide whether or not to render. Note that this does not
 * take relativistic effects into account. This is fine for contraction as the object
 * Will always be smaller, but behaves incorrectly for aberration (Object will appear
 * suddenly out of nowhere if extremely aberrated).
*/
function extendedObject(X, P, m, materials, shape)
{
    this.init = function()
    {
        this.isInteresting = true;
        this.shapePoints = new Array();
        this.COM = new inertialObject(X,P,1);
        this.COM.init();
        this.boundingBox = [0, 0, 0, 0, 0, 0];
        /* InertialObject is a bit heavy-weight for keeping track of
         * one point, need to learn how to do some real OO style inheritance
         * and overloading.
         * NB: Maybe use map here?
         * TODO: Multi-dimensional arrays.
         * TODO: Aberration and rotation for bounding box.
        */
        for (i=0; i < Math.floor(shape.length / 4); i++)  
        {
            if      (shape[4*i+1] < this.boundingBox[0]) this.boundingBox[0] = shape[4*i+1];
            else if (shape[4*i+1] > this.boundingBox[1]) this.boundingBox[1] = shape[4*i+1];

            if      (shape[4*i+2] < this.boundingBox[2]) this.boundingBox[2] = shape[4*i+2];
            else if (shape[4*i+2] > this.boundingBox[3]) this.boundingBox[3] = shape[4*i+2];

            if      (shape[4*i+3] < this.boundingBox[4]) this.boundingBox[4] = shape[4*i+3];
            else if (shape[4*i+3] > this.boundingBox[5]) this.boundingBox[5] = shape[4*i+3];

            this.shapePoints[i] = new inertialObject( quat4.create(shape.slice(4*i, 4*i + 4)),
                                                      quat4.create(P), 1);
            this.shapePoints[i].init();
//            this.shapePoints[i].X0 = quat4.add(this.shapePoints[i].X0, this.COM.X0);
        }
    }

    // Update the COM and the surrounding points.
    // This is the most braindead way of doing it, huge amounts of redundant
    // data/calculations, but it saves duplicating code.
    this.update = function()
    {
        this.COM.updateX0();
        // Make it interesting if it's in view, or if it was in view.
        // Could be other reasons, too.
        this.isInteresting = ( this.isInView2D() || this.wasInView2D() );
        if (this.isInteresting)
        {
            for (i = 0; i < this.shapePoints.length; i++)
            {
                this.shapePoints[i].updateX0();
            }
        }
    }

    // Put code to check if we need to render it here.
    this.wasInView2D = function()
    {
        return (showVisualPos &&
                ((this.COM.XView[1] - this.boundingBox[0]) / zoom < (HWIDTH + 10)    ||
                (this.COM.XView[2] - this.boundingBox[2]) / zoom < (HHEIGHT + 10)    ||
                (this.COM.XView[1] + this.boundingBox[1]) / zoom > (-HWIDTH - 10)    ||
                (this.COM.XView[2] + this.boundingBox[3]) / zoom > (-HHEIGHT - 10) ) &&
                (Math.abs(this.boundingBox[0] - this.boundingBox[1]) / zoom > 0.3    ||
                Math.abs(this.boundingBox[2] - this.boundingBox[3]) / zoom > 0.3)
               );

    }


    this.isInView2D = function()
    {
        return (showVisualPos &&
                ((this.COM.X0[1] - this.boundingBox[0]) / zoom < (HWIDTH + 10)    ||
                (this.COM.X0[2] - this.boundingBox[2]) / zoom < (HHEIGHT + 10)    ||
                (this.COM.X0[1] + this.boundingBox[1]) / zoom > (-HWIDTH - 10)    ||
                (this.COM.X0[2] + this.boundingBox[3]) / zoom > (-HHEIGHT - 10) ) &&
                (Math.abs(this.boundingBox[0] - this.boundingBox[1]) / zoom > 0.3 ||
                Math.abs(this.boundingBox[2] - this.boundingBox[3]) / zoom > 0.3)
               );
    }

    // This is the part that's harder to do with relative vectors.
    // Working out how to do this efficiently will remove the redundancy.
    this.changeFrame = function(translation, rotation)
    {
        this.COM.changeFrame(translation, rotation);
        for (i = 0; i < this.shapePoints.length; i++)
        {
            this.shapePoints[i].changeFrame(translation,rotation);
        }
    }

    this.drawNow = function()
    {
        if (this.isInteresting)
        {
            g.fillStyle = "#0f0";
            g.beginPath();
            g.moveTo( (this.shapePoints[0].X0[1]/ zoom) +HWIDTH, 
                      (this.shapePoints[0].X0[2]) / zoom + HHEIGHT);
            for (i=0; i < (this.shapePoints.length); i++)
            {
                g.lineTo( (this.shapePoints[i].X0[1]) / zoom + HWIDTH, 
                          (this.shapePoints[i].X0[2]) / zoom + HHEIGHT);
            }
            g.fill();            
        }
    }


    this.drawPast = function()
    {
        if (this.isInteresting)
        {
            g.fillStyle = "#f0f";
            g.beginPath();
            g.moveTo( (this.shapePoints[0].XView[1]/ zoom) +HWIDTH, 
                      (this.shapePoints[0].XView[2]) / zoom + HHEIGHT);
            for (i=0; i < (this.shapePoints.length); i++)
            {
                g.lineTo( (this.shapePoints[i].XView[1]) / zoom + HWIDTH, 
                          (this.shapePoints[i].XView[2]) / zoom + HHEIGHT);
            }
            g.fill();            
        }
    }


}
