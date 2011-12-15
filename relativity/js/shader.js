"use strict";

// A polygon shader to replace the in-built draw methods.
// Can't say more about how it works because I don't know yet.
// Many thanks to the authors of jsc3d and pre3d, and k3d for inspiration.

function Renderer(scene, context){
    this.tris = [];
    
}

// Draw shaded triangle.
// Takes an array of triangles, each an array of 3 arrays of numbers in format x y r g b
// sends output to an imageData which must be provided.


var drawTri = function(triArray, imageData) {

    var i, j, idx, lineW, midFrac;
    var xlR;         // Rounded left point for scanline
    var xl,xr;       // Left and right points for a scanline.
    var xm,ym;       // Mid-point for vertically longest line on triangle.
    var xgl,xgr,xgt; // Gradients for lines running down left and right of triangle.
    var line;        // Current scanline, measured from top of half-triangle.
    var rm,gm,bm;    // Mid point colors.
    var rc,gc,bc;    // Working colors.
    var rl,gl,bl;    // Left and right colors.
    var rr,gr,br;
    var grl,ggl,gbl; // Left and right border color gradients
    var grr,ggr,gbr;
    var grh,ggh,gbh; // Scanline color gradient.

    var width = imageData.width; // Set image width here.

    // Cache for one triangle.
    var x0, y0,x1, y1, x2, y2, r0, g0, b0, r1, g1, b1, r2, g2, b2;
    var sortfunc = function(a,b){
        return a[1] - b[1];
    };
        console.time("foo");
    for ( j = 0; j < triArray.length; j++ ) {
        triArray[j].sort(sortfunc);
        x0 = triArray[j][0][0];
        y0 = triArray[j][0][1];
        x1 = triArray[j][1][0];
        y1 = triArray[j][1][1];
        x2 = triArray[j][2][0];
        y2 = triArray[j][2][1];

        r0 = triArray[j][0][2];
        g0 = triArray[j][0][3];
        b0 = triArray[j][0][4];


        r1 = triArray[j][1][2];
        g1 = triArray[j][1][3];
        b1 = triArray[j][1][4];

        r2 = triArray[j][2][2];
        g2 = triArray[j][2][3];
        b2 = triArray[j][2][4];
        // Might add another layer of loop here, and loop over a collection of triangles.
        // Save reallocating all this memory.
    
    
        // Draw the top half of the triangle if we have one.
        if ( y0 !== y1  && y2 !== y0 || true) {
            if ( false && y1 === y2 ) {
                // We don't want a mid-point if the bottom of the triangle is flat.
                xm = x2;
                ym = y2;
     
                rm = r2;
                gm = g2;
                bm = b2;
            } else {
                // Find mid-point.
                midFrac = (y1 - y0) / (y2 - y0);
                xm = midFrac * (x2 - x0) + x0;
                ym = y1;
                // Find color at mid-point.
                rm = (r0 + r2) / 2;
    
                rm = midFrac * (r2 - r0) + r0;
                gm = midFrac * (g2 - g0) + g0;
                bm = midFrac * (b2 - b0) + b0;
            }
            xl = Math.round(x0);
            xr = Math.round(x0); // Left point is right point at tip.
    
            // Initial color is vertex color.
            rc = r0;
            gc = g0;
            bc = b0;
            rl = r0;
            gl = g0;
            bl = b0;
            rr = r0;
            gr = g0;
            br = b0;
    
            xgl = (x1 - x0) / (y1 - y0); // Gradient left
            xgr = (xm - x0) / (ym - y0); // Gradient right
    
            grh = 0; // Not actually changing color on the first line
            ggh = 0;
            gbh = 0;
    
            if (xgl > xgr) {
                // Swap the left and right gradients if left is not smaller than right.
                // NB: Not needed for xl and xr as they are the same for now.
                xgt = xgr;
                xgr = xgl;
                xgl = xgt;
    
                grr = (r1 - r0) / (y1 - y0); // Red gradient right line.
                ggr = (g1 - g0) / (y1 - y0); // Green gradient right line.
                gbr = (b1 - b0) / (y1 - y0); // Blue gradient right line.
        
                grl = (r0 - rm) / (y0 - ym); // Red gradient left line.
                ggl = (g0 - gm) / (y0 - ym); // Green gradient left line.
                gbl = (b0 - bm) / (y0 - ym); // Blue gradient left line.
    
            } else {
    
                grl = (r1 - r0) / (y1 - y0); // Red gradient left line.
                ggl = (g1 - g0) / (y1 - y0); // Green gradient left line.
                gbl = (b1 - b0) / (y1 - y0); // Blue gradient left line.
        
                grr = (r0 - rm) / (y0 - ym); // Red gradient right line.
                ggr = (g0 - gm) / (y0 - ym); // Green gradient right line.
                gbr = (b0 - bm) / (y0 - ym); // Blue gradient right line.
    
            }
            line = Math.round(y0);
            lineW = 0;
            while ( line < ym ) {
    
                xlR = Math.floor(xl);
                // Reversed loop not needed for modern implementations, but
                // conceptually easier in this case.
                // Decided to overdraw slightly, to avoid black lines.
                for ( i = Math.ceil(lineW) ; i >= 0 ; i-- ) {
                    idx = 4*width*line + 4*xlR;
                    if (idx < imageData.data.length  && xlR < width && xlR > 0){
                    imageData.data[idx + 0] = rc;
                    imageData.data[idx + 1] = gc;
                    imageData.data[idx + 2] = bc;
                    imageData.data[idx + 3] = 255;
                    }
                    xlR++;
                    rc += grh;
                    gc += ggh;
                    bc += gbh;
                    // DRAW A PIXEL 
                }
                line++; // Go to next line.
                xl += xgl;
                xr += xgr;
                lineW = xr - xl; // Calculate new line width.
    
                // Increment end colors.
                rl += grl;
                gl += ggl;
                bl += gbl;
                rr += grr;
                gr += ggr;
                br += gbr;
    
                // Calculate new scanline gradient.
                grh = (rr - rl) / lineW;
                gbh = (br - bl) / lineW;
                ggh = (gr - gl) / lineW;
                // Set current color.
                rc = rl;
                gc = gl;
                bc = bl;
                
            }
        }
    
    
    
    
        // Draw the bottom part of the triangle if we have one.
        if ( y1 !== y2  && y2 != y0 || true) {
            if ( false &&y0 === y1 ) {
                // We don't want a mid-point if the top of the triangle is flat.
                xm = x1;
                ym = y1;
     
                rm = r1;
                gm = g1;
                bm = b1;
            } else {
                // TODO: If the triangle has both parts, his is all redundant. Eliminate it.
                // Find mid-point.
                midFrac = (y1 - y0) / (y2 - y0);
                xm = midFrac * (x2 - x0) + x0;
                ym = y1;
                // Find color at mid-point.
                rm = (r0 + r2) / 2;
    
                rm = midFrac * (r2 - r0) + r0;
                gm = midFrac * (g2 - g0) + g0;
                bm = midFrac * (b2 - b0) + b0;
            }
    
            if ( xm < x1 ) { 
                xl = Math.round(xm);
                xr = Math.round(x1);
                xgl = (x2 - xm) / (y2 - ym); // Gradient left
                xgr = (x2 - x1) / (y2 - y1); // Gradient right
    
                // Initial and left and right colors depend on which vertex is left.
                rc = rm;
                gc = gm;
                bc = bm;
                rl = rm;
                gl = gm;
                bl = bm;
                rr = r1;
                gr = g1;
                br = b1;
    
                grr = (r2 - r1) / (y2 - y1); // Red gradient right line.
                ggr = (g2 - g1) / (y2 - y1); // Green gradient right line.
                gbr = (b2 - b1) / (y2 - y1); // Blue gradient right line.
    
                grl = (r2 - rm) / (y2 - ym); // Red gradient left line.
                ggl = (g2 - gm) / (y2 - ym); // Green gradient left line.
                gbl = (b2 - bm) / (y2 - ym); // Blue gradient left line.
    
            } else {
                // Switch left and right.
                xr = Math.round(xm);
                xl = Math.round(x1);
                xgr = (x2 - xm) / (y2 - ym); // Gradient left
                xgl = (x2 - x1) / (y2 - y1); // Gradient right
    
                // Initial and left and right colors depend on which vertex is left.
                rc = r1;
                gc = g1;
                bc = b1;
                rl = r1;
                gl = g1;
                bl = b1;
                rr = rm;
                gr = gm;
                br = bm;
    
                grl = (r2 - r1) / (y2 - y1); // Red gradient right line.
                ggl = (g2 - g1) / (y2 - y1); // Green gradient right line.
                gbl = (b2 - b1) / (y2 - y1); // Blue gradient right line.
    
                grr = (r2 - rm) / (y2 - ym); // Red gradient left line.
                ggr = (g2 - gm) / (y2 - ym); // Green gradient left line.
                gbr = (b2 - bm) / (y2 - ym); // Blue gradient left line.
    
            }
            grh = (rr - rl) / (xr - xl);
            ggh = (gr - gl) / (xr - xl);
            gbh = (br - bl) / (xr - xl);
            line = Math.round(y1);
            lineW = xr - xl;
            while ( line < y2 ) {
                if ( lineW > 200 ) { 
                    console.log(triArray[j]);
                }
                xlR = Math.floor(xl);
                // Reversed loop not needed for modern implementations, but
                // conceptually easier in this case.
                // Decided to overdraw slightly, to avoid black lines.
                for ( i = Math.ceil(lineW) ; i >= 0 ; i-- ) {
                    idx = 4*width*line + 4*xlR;
                    if (idx < imageData.data.length  && xlR < width && xlR > 0){
                    imageData.data[idx + 0] = rc;
                    imageData.data[idx + 1] = gc;
                    imageData.data[idx + 2] = bc;
                    imageData.data[idx + 3] = 255;
                    }
                    xlR++;
                    rc += grh;
                    gc += ggh;
                    bc += gbh;
                    // DRAW A PIXEL 
                }
                line++; // Go to next line.
                xl += xgl;
                xr += xgr;
                lineW = xr - xl; // Calculate new line width.
    
                // Increment end colors.
                rl += grl;
                gl += ggl;
                bl += gbl;
                rr += grr;
                gr += ggr;
                br += gbr;
    
                // Calculate new scanline gradient.
                grh = (rr - rl) / lineW;
                gbh = (br - bl) / lineW;
                ggh = (gr - gl) / lineW;
                // Set current color.
                rc = rl;
                gc = gl;
                bc = bl;
                
            }
        }
         
    }

        console.timeEnd("foo");
};
