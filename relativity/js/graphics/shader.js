"use strict";


// 
// light = { x: x, y: y, z: z, t: t, vx: vx, vy: vy, vz: vz, vt: vt, type: 'bb|gaussian', param: temp|wavelength }
// Does the lighting for an object, with the light's position in the OBJECT's reference frame.

// Sorting function for two triangles.
// Is proportional to the z distance of the centroid.
var zOrder = function(a,b){
    return a[2] + a[5] + a[8] - b[2] - b[5] - b[8];
};


var sortAndDraw = function(context, triArr, endNum, dParams) {
    // Cache an array of references to elements of triArr.
    var cacheArr = triArr.slice(0,endNum),
        imageData;
    // Sort those references.
    cacheArr.sort(zOrder);
    // Modifying elements of cacheArr will still modify elements of triArr
    // But the reordering does not alter triArr.

    // TODO: Homogeneous CMBR can be implemented easily with a radial gradient.
    // If drawn first it will be behind everything

    // TODO: Section for background and far away objects. Anything less than 4px across
    // could be drawn with a fillRect w/ area proportional to luminous intensity 
    //  and sorted by color. This will be fast enough to do for as many such objects as we
    //  can track.

    switch(dParams.render){
        case 'smooth':
            drawTriSmooth(cacheArr, context, endum,
                    dParams.fz, dParams.ortho,
                    dParams.width, dParams.height);
            break;
        case 'guoraud':
            imageData = context.getImageData(0,0,dParams.width,dParams.height);
            drawTri(triArray,imageData,endNum,fz, ortho);
            ctx.putImageData(imageData, 0, 0);
            break;
        case 'textured':
            imageData = context.getImageData(0,0,dParams.width,dParams.height);
            if (ortho){
                drawTriTexOrtho(triArray,imageData,endNum,texture);
            } else {
                drawTriTex(triArray,imageData,endNum,fz,texture);
            }
            ctx.putImageData(imageData, 0, 0);
            break;
    }

   // TODO: Put text on from our labelqueue.
};

// Queue any labels and their coordinates 
// from an object while we interact with it
// so they can all be drawn in the proper order.
var queueLabels = function(object, labelQueue){

};

// Takes an object, does lighting and puts it into the drawing
// Queue.

var queueDraw = function(object, triArr, endNum, lParams) {

    var tempArr,
        i,j,k,triIdx,
        tri,ver,
        vertices = object.vertices,     // Cache vertices, triangles,
        triangles = object.triangles,   // Texture coords, and normals
        UVArr = object.UV,
        normals = object.normals,
        x,y,z,                          // Cache for vertex
        xn,yn,zn,zns,
        scol,ecol,
        slight = object.slight,         // Self light
        elights = object.elights,       // Self light

        doHeadlight = true,
        brightness = lParams.brightness,
        rgbgamma = lParams.rgbgamma,
        bfc = lParams.bfc,
        c = lParams.c,
        lightFuncS, lp,
        lum = slight.lum,
        g  = object.v[3],               // Gamma.
        vx = object.v[0]/g,             // 3-velocity
        vy = object.v[1]/g,
        vz = object.v[2]/g,
        dopplerFactor,
        r,rv,                           // Distance and radial v.
        lnorm,
        pow = Math.pow,                 // Cache some maths.
        sqrt = Math.sqrt,
        ecolors = [],                   // Cache for environmental effects.
        scolors = [];                   // Cache for self-effects.


    // Are we a black body, or monochromatic source?
    // TODO: Add other specra.
    // TODO: Support multiple self lights. Ie. something that emits many wavelengths.
   if (slight.wavelength) {
        lightFuncS = wavelengthToColor;
        lp = slight.wavelength;
    } else if (slight.temp) {
        lightFuncS = tempToColor;
        lp = slight.temp;
    }       

    for (i = vertices.length; i--;){

        // Cache position.
        x = vertices[i][0];
        y = vertices[i][1];
        z = vertices[i][2];
        // Cache normal.
        xn = normals[i][0];
        yn = normals[i][1];
        zn = normals[i][2];

        // TODO: Do environmental lighting.
        // For now it can just be 3d directional to give some sense of shape.
        // TODO: This is a memory leak.
        ecolors[i] = [0* 30 * xn, 0* 30 * xn, 0*30 * xn, 0];

        // Luminous lighting. Much less complicated.
        r = sqrt( x*x + y*y + z*z );
        rv = (vx * x + vy * y + vz * z) / r;
        dopplerFactor = 1 / ( 1 + (rv / c) ) / g;
        scol = lightFuncS(lp, rv, g, c);
        if ( doHeadlight ) {
            // Gamma and brightness correction.
            // Headlight effect is third power of doppler factor because we have already taken care
            // Not actually being 100% genuine with this because energy is proportional to frequency
            // and most of my equations are in terms of either energy or intensity, not photon number
            // TODO: Derive the Beaming equation to figure out  the general form of p in
            // S=S_0 * D^p
            lnorm = 255 * pow(scol[3] * lum * pow(dopplerFactor,3), rgbgamma) * brightness;
        } else {
            lnorm = 255 * pow(scol[3] * lum, rgbgamma) * brightness;
        }

        // TODO: Glare could be implemented here.
        // Keep track of the highest intensity then use it
        // to set the gamma/brightness along with a glare parameter which could
        // be displayed with a partial alpha fillRect()
        // This would have the effect of washing out the whole screen and having everything go dim
        // It's a good alternative to attempting to simulate bloom (filtering is not going to happen with the computational budget)
        if(!scolors[i]) { scolors[i] = [];}
        scolors[i][0] = scol[0] * lnorm;
        scolors[i][1] = scol[1] * lnorm;
        scolors[i][2] = scol[2] * lnorm;
    }
    // Iterate over all the triangles.
    triIdx = endNum + 1;  // Start just after the end of the array.
    for ( i = 0 ; i < triangles.length; i++) {
        if (!triArr[triIdx]){ 
            triArr[triIdx] = new Array(24);
        }
        // Cache things we'll be referring to a lot.
        tempArr = triArr[triIdx];
        tri = triangles[i];

        // Set sum of z normals.
        zns = 0;
        for (j=0 ; j<3;j++){

            zn = normals[tri[j]][2];
            // What's the total of the z normals on this triangle?
            // It represents the average, but all I'm interested in is
            // the sign, so no divide is necessary.
            zns += zn; 

            ver = vertices[tri[j]];
            scol = scolors[tri[j]];
            ecol = ecolors[tri[j]];

            // Altering the values in triArr[i] 
            // because that is what tempArr is right now.
            k = 3*j;
            tempArr[0 + k] = ver[0];
            tempArr[1 + k] = ver[1];
            tempArr[2 + k] = ver[2];

            // Set the colors.
            tempArr[ 9 + k] = scol[0] + ecol[0];  
            tempArr[10 + k] = scol[1] + ecol[1];
            tempArr[11 + k] = scol[2] + ecol[2];
            // Set the texture coordinates.
            k = 2*j;
            tempArr[18 + k] = UVArr[tri[j]][0];
            tempArr[19 + k] = UVArr[tri[j]][1];
        }
        // Back-face  and z culling
        if ( (!bfc || zns < 0)      &&  // If culling, is the normal negative?
             (  (tempArr[2] > 0) ||     // And is some part of the triangle
                (tempArr[5] > 0) ||     // In front of us.
                (tempArr[8] > 0)   ) ){
            // If so, move on to the next triangle.
            triIdx++;
            // Otherwise reuse this element of triArr.
        }
    }
    endNum = triIdx-1; // Might see about passing this in in an object so the function can alter it.
    // This whole section is much more c-like than the rest so it's not too bad stylistically.
    return triIdx - 1; // Set the end of the array to the last triangle we wanted to keep
};




var drawTriSmooth = function(triArray,ctx,endNum,fz,ortho,width,height){
    var i,j,k,l,
        x0,y0,z0,
        x1,y1,z1,
        x2,y2,z2,

        dx01,dy01,dr01,
        dx02,dy02,dr02,
        dx12,dy12,dr12,

        r0,g0,b0,
        rp,gp,bp,
       
        tempArr,
        round = Math.round; 

    // Doesn't matter which end we start from.
    for ( i = endNum+1; i--; ) {
        tempArr = triArray[i];
        if ( tempArr[2] <= 0 || tempArr[5] <= 0 || tempArr[8] <= 0 ){
            if ( i-- ){ return; }
        }
        j = 0; 
        k = 1;
        l = 2;
        // If we're using an orthographic projection 
        // Such as a 2d gods' eye view, then ignore focal
        // length and zoom.
        if (ortho) {
            // Sort the indeces by size of the relevant y component.
            // Could do it with a temp variable, but there is a
            // threshold for number of local variables
            //  where the scope resolution becomes incredibly slow.
            if ( tempArr[1 + 3 * j] > tempArr[1 + 3 * k] ) {
                k = (j += k -= j) - k;
            }
            if ( tempArr[1 + 3 * k] > tempArr[1 + 3 * l] ) {
                l = (k += l -= k) - l;
            }       
            if ( tempArr[1 + 3 * j] > tempArr[1 + 3 * k] ) {
                k = (j += k -= j) - k;
            }       
            z0 = tempArr[ 2 + j * 3];
            x0 = tempArr[ 0 + j * 3] + width / 2;
            y0 = tempArr[ 1 + j * 3] + height / 2;

            z1 = tempArr[ 2 + k * 3];
            x1 = tempArr[ 0 + k * 3] + width / 2;
            y1 = tempArr[ 1 + k * 3] + height / 2;

            z2 = tempArr[ 2 + l * 3];
            x2 = tempArr[ 0 + l * 3] + width / 2;
            y2 = tempArr[ 1 + l * 3] + height / 2;
        } else {
            // Sort the indeces by size of the relevant y component.
            // Could do it with a temp variable, but there is a
            // threshold for number of local variables
            //  where the scope resolution becomes incredibly slow.
            if ( tempArr[1 + 3 * j] / tempArr[2 + 3 * j] > 
                    tempArr[1 + 3 * k] / tempArr[2 + 3 * k] ) {
                k = (j += k -= j) - k;
            }
            if ( tempArr[1 + 3 * k] /tempArr[2 + 3 * k] > 
                    tempArr[1 + 3 * l] / tempArr[2 + 3 * l] ) {
                l = (k += l -= k) - l;
            }       
            if ( tempArr[1 + 3 * j] / tempArr[2 + 3 * j] > 
                    tempArr[1 + 3 * k] / tempArr[2 + 3 * k] ) {
                k = (j += k -= j) - k;
            }       
            z0 = tempArr[ 2 + j * 3];
            x0 = tempArr[ 0 + j * 3]*fz/z0 + width / 2;
            y0 = tempArr[ 1 + j * 3]*fz/z0 + height / 2;

            z1 = tempArr[ 2 + k * 3];
            x1 = tempArr[ 0 + k * 3]*fz/z1 + width / 2;
            y1 = tempArr[ 1 + k * 3]*fz/z1 + height / 2;

            z2 = tempArr[ 2 + l * 3];
            x2 = tempArr[ 0 + l * 3]*fz/z2 + width / 2;
            y2 = tempArr[ 1 + l * 3]*fz/z2 + height / 2;
        }

        r0 = round((tempArr[  9 + j * 3] + tempArr[  9 + k * 3] + tempArr[  9 + l * 3])/3);
        g0 = round((tempArr[ 10 + j * 3] + tempArr[ 10 + k * 3] + tempArr[ 10 + l * 3])/3);
        b0 = round((tempArr[ 11 + j * 3] + tempArr[ 11 + k * 3] + tempArr[ 11 + l * 3])/3);

        if ( r0 !== rp || gp !== g0 || bp !== b0){ 
            ctx.fillStyle = 'rgba(' + r0 + ',' +  b0 + ',' + g0 + ',' + '1)';
        }

        rp = r0;
        gp = g0;
        bp = b0;

        // Overdraw.

        dx01 = ( (x0 < x1) ? -1 : ( (x0 > x1) ? +1 : 0 ) );
        dx02 = ( (x0 < x2) ? -1 : ( (x0 > x2) ? +1 : 0 ) );
        dx12 = ( (x1 < x2) ? -1 : ( (x1 > x2) ? +1 : 1 ) );

        dy01 = ( (y0 < y1) ? -1 : ( (y0 > y1) ? +1 : 0 ) );
        dy02 = ( (y0 < y2) ? -1 : ( (y0 > y2) ? +1 : 0 ) );
        dy12 = ( (y1 < y2) ? -1 : ( (y1 > y2) ? +1 : 1 ) );

        x0 +=  dx01 + dx02;
        x1 += -dx01 + dx12;
        x2 += -dx12 - dx02;

        y0 +=  dy01 + dy02;
        y1 += -dy01 + dy12;
        y2 += -dy12 - dy02;


        ctx.beginPath();
        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.fill();
    }
};


// Rationale between a lot of the strange shit in this function:
// 1) It needed to be fast to come anywhere near native methods.
// 2) I never thought I'd have to conserve memory, but there seems to be
// some limit on the number of local variables before something goes woolooloo
// with the scope chain. 
// 3) OCD
// 4) Learning about scope.

var drawTri = function(triArray,imageData,endNum,fz, ortho) {

        // Define variables from most used to least used.
    var rc, gc, bc,                 // Working colors for one scanline
        grh, ggh, gbh,              // Working color gradients
        data   = imageData.data,    

        // Miscellaneous indeces. Also used as temp vars.
        i,j,k,l,m,

        // Properties from our canvas image data.
        width  = imageData.width,
        height = imageData.height,

        max   = Math.max,
        round = Math.round,
        floor = Math.floor, 
        // Gradients:
        xgl,xgr,                    // Position gradient.
        // Color gradients
        grl,ggl,gbl,                // Left border
        grr,ggr,gbr,                // Right border

        lineW,                      // Width of working line
        xl,xr,                      // Left and right points of scanline
        xs,xe,                      // Start and end of scanline, only differ from xl,xr if triangle is hanging off of the screen.
        ys,ye, 
        xm,                         // Mid-point x axis, the equiv value
                                    // For y is just y1.

        fm,                         // Fraction of triangle the 'mid-point' is

        // Colors, rgb
        rm,gm,bm,                   // Mid-point
        rl,gl,bl,                   // Left border
        rr,gr,br,                    // Right border

        // Cache for one triangle because triArray[j][i] is very slow.
        // Seems somewhat silly, but it save a lot of time shuffling
        // Variables around re. sorting for the completely flat case.
        tempArr,    

        // Even more cache for one triangle because tempArr[] is still slow.
        x0,y0,z0,
        x1,y1,z1,
        x2,y2,z2,
        r0,g0,b0,
        r1,g1,b1,
        r2,g2,b2;
    // Doesn't matter which end we start from.
    for ( i = endNum+1; i--; ) {
        tempArr = triArray[i];
        if ( tempArr[2] <= 0 || tempArr[5] <= 0 || tempArr[8] <= 0 ){
            if ( i-- ){ return; }
        }

        j = 0; 
        k = 1;
        l = 2;



        // If we're using an orthographic projection 
        // Such as a 2d gods' eye view, then ignore focal
        // length and zoom.
        if (ortho) {
            // Sort the indeces by size of the relevant y component.
            // Could do it with a temp variable, but there is a
            // threshold for number of local variables
            //  where the scope resolution becomes incredibly slow.
            if ( tempArr[1 + 3 * j] > tempArr[1 + 3 * k] ) {
                k = (j += k -= j) - k;
            }
            if ( tempArr[1 + 3 * k] > tempArr[1 + 3 * l] ) {
                l = (k += l -= k) - l;
            }       
            if ( tempArr[1 + 3 * j] > tempArr[1 + 3 * k] ) {
                k = (j += k -= j) - k;
            }       
            z0 = tempArr[ 2 + j * 3];
            x0 = tempArr[ 0 + j * 3] + width / 2;
            y0 = tempArr[ 1 + j * 3] + height / 2;

            z1 = tempArr[ 2 + k * 3];
            x1 = tempArr[ 0 + k * 3] + width / 2;
            y1 = tempArr[ 1 + k * 3] + height / 2;

            z2 = tempArr[ 2 + l * 3];
            x2 = tempArr[ 0 + l * 3] + width / 2;
            y2 = tempArr[ 1 + l * 3] + height / 2;
        } else {
            // Sort the indeces by size of the relevant y component.
            // Could do it with a temp variable, but there is a
            // threshold for number of local variables
            //  where the scope resolution becomes incredibly slow.
            if ( tempArr[1 + 3 * j] / tempArr[2 + 3 * j] > 
                    tempArr[1 + 3 * k] / tempArr[2 + 3 * k] ) {
                k = (j += k -= j) - k;
            }
            if ( tempArr[1 + 3 * k] /tempArr[2 + 3 * k] > 
                    tempArr[1 + 3 * l] / tempArr[2 + 3 * l] ) {
                l = (k += l -= k) - l;
            }       
            if ( tempArr[1 + 3 * j] / tempArr[2 + 3 * j] > 
                    tempArr[1 + 3 * k] / tempArr[2 + 3 * k] ) {
                k = (j += k -= j) - k;
            }       
            z0 = tempArr[ 2 + j * 3];
            x0 = tempArr[ 0 + j * 3]*fz/z0 + width / 2;
            y0 = tempArr[ 1 + j * 3]*fz/z0 + height / 2;

            z1 = tempArr[ 2 + k * 3];
            x1 = tempArr[ 0 + k * 3]*fz/z1 + width / 2;
            y1 = tempArr[ 1 + k * 3]*fz/z1 + height / 2;

            z2 = tempArr[ 2 + l * 3];
            x2 = tempArr[ 0 + l * 3]*fz/z2 + width / 2;
            y2 = tempArr[ 1 + l * 3]*fz/z2 + height / 2;
        }
        r0 = tempArr[  9 + j * 3];
        g0 = tempArr[ 10 + j * 3];
        b0 = tempArr[ 11 + j * 3];


        r1 = tempArr[  9 + k * 3];
        g1 = tempArr[ 10 + k * 3];
        b1 = tempArr[ 11 + k * 3];

        r2 = tempArr[  9 + l * 3];
        g2 = tempArr[ 10 + l * 3];
        b2 = tempArr[ 11 + l * 3]; 

        // Start drawing top part of triangle.

        // We're safe from divide by zero here because
        // the y values are sorted, and if y1=y0 we won't
        // attempt to do anything before recalculating fm.

        // How far down is our 'mid-point'?
        fm = (y1 - y0) / (y2 - y0); 
        // Where is that along the x edge?
        xm = (fm * (x2 - x0) + x0);

        // Does the top-triangle exist and is some part of it on the screen?
        y0--;
        y1++;
        if( ( ( y0 <= height ) ||
              ( y1 >= 0 )   )&&
            ( ( x0 >= 0 || x0 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x1 >= 0 || x1 <= width )    )&& 
            (y0 < y1))
        {
            // What color is our mid-point?
            rm = fm * (r2 - r0) + r0;
            gm = fm * (g2 - g0) + g0;
            bm = fm * (b2 - b0) + b0;



            // Is 1 the left point?
            if( x1 < xm ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xgl = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgr = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grl = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggl = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbl = (b1 -  b0) / (y1 - y0); // etc.

                grr = (rm -  r0) / (y1 - y0);
                ggr = (gm -  g0) / (y1 - y0);
                gbr = (bm -  b0) / (y1 - y0);
            } else {
                // If not, swap them all.
                xgr = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgl = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grr = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggr = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbr = (b1 -  b0) / (y1 - y0); // etc.

                grl = (rm -  r0) / (y1 - y0);
                ggl = (gm -  g0) / (y1 - y0);
                gbl = (bm -  b0) / (y1 - y0);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y1 < 0 || y0 > height) {
                ye = ys = 0;
            } else {
                if (y0 >=0){
                    ys = y0;
                } else{
                    ys = 0;
                }
                if ( y1 < height ) {
                    ye = y1;
                } else { 
                    ye = height;
                }
            }
            k = ys - y0;
            xl = x0 +  xgl * k;
            xr = x0 + xgr * k;
            rl = r0 + grl * k;
            gl = g0 + ggl * k;
            bl = b0 + gbl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            rr = r0 + grr * k;
            gr = g0 + ggr * k;
            br = b0 + gbr * k;
    
    
    
    
    drawHalfTri(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       data,lineW,round,floor);

        }

        y1--;
        y1--;
        y2++;
        if( ( ( y1 <= height ) ||
              ( y2 >= 0 )   )&&
            ( ( x1 >= 0 || x1 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x2 >= 0 || x2 <= width )    )&& 
            (y1 < y2))
        {
            // What color is our mid-point?
            rm = fm * (r2 - r0) + r0;
            gm = fm * (g2 - g0) + g0;
            bm = fm * (b2 - b0) + b0;



            // Is 1 the left point?
            if( xm < x1 ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xl = xm;
                xr = x1;

                rl = rm;
                gl = gm;
                bl = bm;

                rr = r1;
                gr = g1;
                br = b1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                grl = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggl = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbl = (b2 -  bm) / (y2 - y1); // etc.

                grr = (r2 -  r1) / (y2 - y1);
                ggr = (g2 -  g1) / (y2 - y1);
                gbr = (b2 -  b1) / (y2 - y1);
            } else {
                // If not, swap them all.
                xl = x1;
                xr = xm;

                rr = rm;
                gr = gm;
                br = bm;

                rl = r1;
                gl = g1;
                bl = b1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                grr = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggr = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbr = (b2 -  bm) / (y2 - y1); // etc.

                grl = (r2 -  r1) / (y2 - y1);
                ggl = (g2 -  g1) / (y2 - y1);
                gbl = (b2 -  b1) / (y2 - y1);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y2 < 0 || y1 > height) {
                ye = ys = 0;
            } else {
                if (y1 >=0){
                    ys = y1;
                } else{
                    ys = 0;
                }
                if ( y2 < height ) {
                    ye = y2;
                } else { 
                    ye = height;
                }
            }
            k = ys - y1;
            xl += xgl * k;
            xr += xgr * k;
            rl += grl * k;
            gl += ggl * k;
            bl += gbl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            rr += grr * k;
            gr += ggr * k;
            br += gbr * k;
    
    
    drawHalfTri(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       data,lineW,round,floor);
    


        }
    // End full-tri loop
    }


};

var drawHalfTri = function(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       data,lineW,round,floor){
            xl--;
            xr++; 
    
            l = 4*width*floor(ys);
            j = floor(ye - ys);
            while (j--){
                // How wide is the current line?
                lineW = xr - xl;
                // Set current color.
    
                // Calculate new scanline gradient.
                // Only thing that's not linear.
                grh = (rr - rl) / lineW;
                gbh = (br - bl) / lineW;
                ggh = (gr - gl) / lineW;
                if (xr < 0 || xl > width) {
                    xe = xs = 0;
                } else {
                    if (xl >=0){
                        xs = xl;
                    } else{
                        xs = 0;
                    }
                    if ( xr < width ) {
                        xe = xr;
                    } else { 
                        xe = width;
                    }
                }
                rc = rl + grh * (xs - xl);
                gc = gl + ggh * (xs - xl);
                bc = bl + gbh * (xs - xl);
    
                m = (l + 4*round(xs)); // Index relating position and data[].
                // Duff's device
    
                k = round(xe - xs);
                while(k--){
                    // DRAW A PIXEL
                    // Compound statements are faster. 
                    // I'm assuming it only does the scope resolution once. 
                    (data[m++] = rc, data[m++] = gc, data[m++] = bc, data[m++] = 255,rc += grh,gc += ggh,bc += gbh);
                }
    

    
                l += 4 * width; // Move to next line.
                xl += xgl; // Increment left and right edges.
                xr += xgr;
    
                // Increment end colors.
                rl += grl;
                gl += ggl;
                bl += gbl;
                rr += grr;
                gr += ggr;
                br += gbr;
    
            // End half-tri loop.
            }
       }




// TODO: Sort out how this works when orthographic projection is involved

var drawTriTex = function(triArray,imageData,endNum,fz,texture) {

        // Define variables from most used to least used.
    var rc, gc, bc,                 // Working colors for one scanline
        grh, ggh, gbh,              // Working color gradients
        data   = imageData.data,    
        tdata  = texture.data,
        twidth = texture.width,
        // Miscellaneous indeces. Also used as temp vars.
        i,j,k,l,m,

        // Properties from our canvas image data.
        width  = imageData.width,
        height = imageData.height,

        max   = Math.max,
        round = Math.round,
        floor = Math.floor, 
        // Gradients:
        xgl,xgr,                    // Position gradient.
        // Color gradients
        grl,ggl,gbl,                // Left border
        grr,ggr,gbr,                // Right border

        lineW,                      // Width of working line
        xl,xr,                      // Left and right points of scanline
        xs,xe,                      // Start and end of scanline, only differ from xl,xr if triangle is hanging off of the screen.
        ys,ye, 
        xm,                         // Mid-point x axis, the equiv value
                                    // For y is just y1.

        fm,                         // Fraction of triangle the 'mid-point' is

        // Colors, rgb
        rm,gm,bm,                   // Mid-point
        rl,gl,bl,                   // Left border
        rr,gr,br,                    // Right border

        uc,vc,
        ul,ur,                      // Texture coordinates.
        vl,vr,
        gul,gur,                    // Texture coordinate gradients.
        gvl,gvr,
        guh,gvh,
        vm,um,

        zc,zl,zr,gzl,gzr,gzh,zm,
        // Cache for one triangle because triArray[j][i] is very slow.
        // Seems somewhat silly, but it save a lot of time shuffling
        // Variables around re. sorting for the completely flat case.
        tempArr,    

        // Even more cache for one triangle because tempArr[] is still slow.
        x0,y0,z0,
        x1,y1,z1,
        x2,y2,z2,
        r0,g0,b0,
        r1,g1,b1,
        r2,g2,b2,
        u0,v0,
        u1,v1,
        u2,v2;
    // Doesn't matter which end we start from.
    for ( i = endNum+1; i--; ) {
        tempArr = triArray[i];
        if ( tempArr[2] <= 0 || tempArr[5] <= 0 || tempArr[8] <= 0 ){
            if ( i-- ){ return; }
        }
        j = 0; 
        k = 1;
        l = 2;

        // Sort the indeces by size of the relevant y component.
        // Could do it with a temp variable, but there is a
        // threshold for number of local variables
        //  where the scope resolution becomes incredibly slow.
        if ( tempArr[1 + 3 * j]/tempArr[2 + 3*j] > tempArr[1 + 3 * k]/tempArr[2 + 3*k] ) {
            k = (j += k -= j) - k;
        }
        if ( tempArr[1 + 3 * k]/tempArr[2 + 3*k] > tempArr[1 + 3 * l]/tempArr[2 + 3*l] ) {
            l = (k += l -= k) - l;
        }       
        if ( tempArr[1 + 3 * j]/tempArr[2 + 3*j] > tempArr[1 + 3 * k]/tempArr[2 + 3*k] ) {
            k = (j += k -= j) - k;
        }

        z0 = tempArr[ 2 + j * 3];
        x0 = tempArr[ 0 + j * 3]*fz/z0 + width / 2;
        y0 = tempArr[ 1 + j * 3]*fz/z0 + height / 2;

        z1 = tempArr[ 2 + k * 3];
        x1 = tempArr[ 0 + k * 3]*fz/z1 + width / 2;
        y1 = tempArr[ 1 + k * 3]*fz/z1 + height / 2;

        z2 = tempArr[ 2 + l * 3];
        x2 = tempArr[ 0 + l * 3]*fz/z2 + width / 2;
        y2 = tempArr[ 1 + l * 3]*fz/z2 + height / 2;

        r0 = tempArr[ 9  + j * 3];
        g0 = tempArr[ 10 + j * 3];
        b0 = tempArr[ 11 + j * 3];
        z0 = 1/z0;
        z1 = 1/z1;
        z2 = 1/z2;

        r1 = tempArr[ 9  + k * 3];
        g1 = tempArr[ 10 + k * 3];
        b1 = tempArr[ 11 + k * 3];

        r2 = tempArr[ 9  + l * 3];
        g2 = tempArr[ 10 + l * 3];
        b2 = tempArr[ 11 + l * 3]; 

        u0 = tempArr[ 18 + j * 2]*z0;
        v0 = tempArr[ 19 + j * 2]*z0;
        u1 = tempArr[ 18 + k * 2]*z1;
        v1 = tempArr[ 19 + k * 2]*z1;
        u2 = tempArr[ 18 + l * 2]*z2;
        v2 = tempArr[ 19 + l * 2]*z2;
        // Start drawing top part of triangle.

        // We're safe from divide by zero here because
        // the y values are sorted, and if y1=y0 we won't
        // attempt to do anything before recalculating fm.

        // How far down is our 'mid-point'?
        fm = (y1 - y0) / (y2 - y0);

        // Where is that along the x edge?
        xm = (fm * (x2 - x0) + x0);
        // What color is our mid-point?
        rm = fm * (r2 - r0) + r0;
        gm = fm * (g2 - g0) + g0;
        bm = fm * (b2 - b0) + b0;

        um = fm * (u2 - u0) + u0;
        vm = fm * (v2 - v0) + v0;

        zm = fm * (z2 - z0) + z0;

        // Does the top-triangle exist and is some part of it on the screen?
        y0--;
        y1++;
        if( ( ( y0 <= height ) ||
              ( y1 >= 0 )   )&&
            ( ( x0 >= 0 || x0 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x1 >= 0 || x1 <= width )    )&& 
            (y0 !== y1))
        {

            // Is 1 the left point?
            if( x1 < xm ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xgl = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgr = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grl = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggl = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbl = (b1 -  b0) / (y1 - y0); // etc.

                grr = (rm -  r0) / (y1 - y0);
                ggr = (gm -  g0) / (y1 - y0);
                gbr = (bm -  b0) / (y1 - y0);

                gul = (u1 - u0) / (y1 - y0);
                gvl = (v1 - v0) / (y1 - y0);

                gur = (um - u0) / (y1 - y0);
                gvr = (vm - v0) / (y1 - y0);

                gzl = (z1 - z0) / (y1 - y0);
                gzr = (zm - z0) / (y1 - y0);

            } else {
                // If not, swap them all.
                xgr = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgl = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grr = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggr = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbr = (b1 -  b0) / (y1 - y0); // etc.

                grl = (rm -  r0) / (y1 - y0);
                ggl = (gm -  g0) / (y1 - y0);
                gbl = (bm -  b0) / (y1 - y0);

                gur = (u1 - u0) / (y1 - y0);
                gvr = (v1 - v0) / (y1 - y0);

                gul = (um - u0) / (y1 - y0);
                gvl = (vm - v0) / (y1 - y0);

                gzr = (z1 - z0) / (y1 - y0);
                gzl = (zm - z0) / (y1 - y0);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y1 < 0 || y0 > height) {
                ye = ys = 0;
            } else {
                if (y0 >=0){
                    ys = y0;
                } else{
                    ys = 0;
                }
                if ( y1 < height ) {
                    ye = y1;
                } else { 
                    ye = height;
                }
            }
            k = ys - y0;
            xl = x0 + xgl * k;
            xr = x0 + xgr * k;
            rl = r0 + grl * k;
            gl = g0 + ggl * k;
            bl = b0 + gbl * k;
            ul = u0 + gul * k;
            vl = v0 + gvl * k;
            zl = z0 + gzl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            uc = ul;
            vc = vl;
            zc = zl;
            rr = r0 + grr * k;
            gr = g0 + ggr * k;
            br = b0 + gbr * k;
            ur = u0 + gur * k;
            vr = v0 + gvr * k;   
            zr = z0 + gzr * k;
    
    
    
            drawHalfTriTex(j,k,l,m,xr,xl,xs,xe,ys,ye,xgl,xgr,zc,zl,zr,gzl,gzr,width,rc,rl,rr,bc,bl,br,gc,gl,gr,grh,gbh,ggh,grl,grr,ggl,ggr,gbl,gbr,uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,data,lineW,round,floor,tdata,twidth);
            y2++;
            y1--;
            y1--;   
    

        }


        if( ( ( y1 <= height ) ||
              ( y2 >= 0 )   )&&
            ( ( x1 >= 0 || x1 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x2 >= 0 || x2 <= width )    )&& 
            (y1 !== y2))
        {

            // Is 1 the left point?
            if( xm < x1 ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xl = xm;
                xr = x1;

                zl = zm;
                zr = z1;

                rl = rm;
                gl = gm;
                bl = bm;

                rr = r1;
                gr = g1;
                br = b1;

                ul = um;
                vl = vm;

                ur = u1;
                vr = v1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                gzl = (z2 - zl) / (y2 - y1);
                gzr = (z2 - zr) / (y2 - y1);

                grl = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggl = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbl = (b2 -  bm) / (y2 - y1); // etc.

                grr = (r2 -  r1) / (y2 - y1);
                ggr = (g2 -  g1) / (y2 - y1);
                gbr = (b2 -  b1) / (y2 - y1);

                gul = (u2 - um) / (y2 - y1);
                gvl = (v2 - vm) / (y2 - y1);

                gur = (u2 - u1) / (y2 - y1);
                gvr = (v2 - v1) / (y2 - y1);


            } else {
                // If not, swap them all.
                xl = x1;
                xr = xm;

                zl = z1;
                zr = zm;

                rr = rm;
                gr = gm;
                br = bm;

                rl = r1;
                gl = g1;
                bl = b1;

                ur = um;
                vr = vm;

                ul = u1;
                vl = v1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                gzl = (z2 - zl) / (y2 - y1);
                gzr = (z2 - zr) / (y2 - y1);

                grr = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggr = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbr = (b2 -  bm) / (y2 - y1); // etc.

                grl = (r2 -  r1) / (y2 - y1);
                ggl = (g2 -  g1) / (y2 - y1);
                gbl = (b2 -  b1) / (y2 - y1);

                gur = (u2 - um) / (y2 - y1);
                gvr = (v2 - vm) / (y2 - y1);

                gul = (u2 - u1) / (y2 - y1);
                gvl = (v2 - v1) / (y2 - y1);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y2 < 0 || y1 > height) {
                ye = ys = 0;
            } else {
                if (y1 > 0){
                    ys = y1;
                } else{
                    ys = 0;
                }
                if ( y2 < height ) {
                    ye = y2;
                } else { 
                    ye = height;
                }
            }
            k = ys - y1;
            xl += xgl * k;
            xr += xgr * k;
            rl += grl * k;
            gl += ggl * k;
            bl += gbl * k;
            zl += gzl * k;

            ul += gul * k;
            vl += gvl * k;

            uc = ul;
            vc = vl;

            zc = zl;

            rc = rl;
            gc = gl;
            bc = bl;
            
            zr += gzr * k;

            ur += gur * k;
            vr += gvr * k;

            rr += grr * k;
            gr += ggr * k;
            br += gbr * k;
    
            drawHalfTriTex(j,k,l,m,xr,xl,xs,xe,ys,ye,xgl,xgr,zc,zl,zr,gzl,gzr,width,rc,rl,rr,bc,bl,br,gc,gl,gr,grh,gbh,ggh,grl,grr,ggl,ggr,gbl,gbr,uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,data,lineW,round,floor,tdata,twidth);
   
        }
    // End full-tri loop
    }


};

// Draws half a triangle with colored lighting and texture.
var drawHalfTriTex = function(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       zc,zl,zr,gzl,gzr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,
       data,lineW,round,floor,tdata,twidth){
    var guh,gvh,gzh,ti,val;
    xl--;
    xr++;
    l = 4*width*round(ys);
    j = round(ye - ys);
    while (j--){
        // How wide is the current line?
        lineW = xr - xl;
        // Set current color.

        // Calculate new scanline gradient.
        // Only thing that's not linear.
        grh = (rr - rl) / lineW;
        gbh = (br - bl) / lineW;
        ggh = (gr - gl) / lineW;
        guh = (ur - ul) / lineW;
        gvh = (vr - vl) / lineW;
        gzh = (zr - zl) / lineW;

        if (xr < 0 || xl > width) {
            xe = xs = 0;
        } else {
            if (xl >=0){
                xs = xl;
            } else{
                xs = 0;
            }
            if ( xr < width ) {
                xe = xr;
            } else { 
                xe = width;
            }
        }
        rc = rl + grh * (xs - xl);
        gc = gl + ggh * (xs - xl);
        bc = bl + gbh * (xs - xl);
        uc = ul + guh * (xs - xl);
        vc = vl + gvh * (xs - xl);

        zc = zl + gzh * (xs - xl);

        m = (l + 4*floor(xs)); // Index relating position and data[].
        // Duff's device

        k = round(xe - xs);
        while(k--){
            // DRAW A PIXEL
            // Compound statements are faster. I'm assuming it only does the scope resolution once.
            ti =  4*((uc/zc|0)+width*(vc/zc|0)),
            val = tdata[ti] / 255,
            (data[m++] = rc * val, data[m++] = gc * val, data[m++] = bc * val, data[m++] = 255,rc += grh,gc += ggh,bc += gbh, uc += guh, vc += gvh, zc += gzh);
        }



        l += 4 * width; // Move to next line.
        xl += xgl; // Increment left and right edges.
        xr += xgr;

        zl += gzl;
        zr += gzr;
        // Increment end colors.
        rl += grl;
        gl += ggl;
        bl += gbl;
        ul += gul;
        vl += gvl;

        rr += grr;
        gr += ggr;
        br += gbr;
        ur += gur;
        vr += gvr;

    // End half-tri loop.
    }

}



var drawTriTexOrtho = function(triArray,imageData,endNum,texture) {

        // Define variables from most used to least used.
    var rc, gc, bc,                 // Working colors for one scanline
        grh, ggh, gbh,              // Working color gradients
        data   = imageData.data,    
        tdata  = texture.data,
        twidth = texture.width,
        // Miscellaneous indeces. Also used as temp vars.
        i,j,k,l,m,

        // Properties from our canvas image data.
        width  = imageData.width,
        height = imageData.height,

        max   = Math.max,
        round = Math.round,
        floor = Math.floor, 
        // Gradients:
        xgl,xgr,                    // Position gradient.
        // Color gradients
        grl,ggl,gbl,                // Left border
        grr,ggr,gbr,                // Right border

        lineW,                      // Width of working line
        xl,xr,                      // Left and right points of scanline
        xs,xe,                      // Start and end of scanline, only differ from xl,xr if triangle is hanging off of the screen.
        ys,ye, 
        xm,                         // Mid-point x axis, the equiv value
                                    // For y is just y1.

        fm,                         // Fraction of triangle the 'mid-point' is

        // Colors, rgb
        rm,gm,bm,                   // Mid-point
        rl,gl,bl,                   // Left border
        rr,gr,br,                    // Right border

        uc,vc,
        ul,ur,                      // Texture coordinates.
        vl,vr,
        gul,gur,                    // Texture coordinate gradients.
        gvl,gvr,
        guh,gvh,
        vm,um,

        // Cache for one triangle because triArray[j][i] is very slow.
        // Seems somewhat silly, but it save a lot of time shuffling
        // Variables around re. sorting for the completely flat case.
        tempArr,    

        // Even more cache for one triangle because tempArr[] is still slow.
        x0,y0,z0,
        x1,y1,z1,
        x2,y2,z2,
        r0,g0,b0,
        r1,g1,b1,
        r2,g2,b2,
        u0,v0,
        u1,v1,
        u2,v2;
    // Doesn't matter which end we start from.
    for ( i = endNum+1; i--; ) {
        tempArr = triArray[i];
        if ( tempArr[2] <= 0 || tempArr[5] <= 0 || tempArr[8] <= 0 ){
            if ( i-- ){ return; }
        }
        j = 0; 
        k = 1;
        l = 2;

        // Sort the indeces by size of the relevant y component.
        // Could do it with a temp variable, but there is a
        // threshold for number of local variables
        //  where the scope resolution becomes incredibly slow.
        if ( tempArr[1 + 3 * j] > tempArr[1 + 3 * k] ) {
            k = (j += k -= j) - k;
        }
        if ( tempArr[1 + 3 * k] > tempArr[1 + 3 * l] ) {
            l = (k += l -= k) - l;
        }       
        if ( tempArr[1 + 3 * j] > tempArr[1 + 3 * k] ) {
            k = (j += k -= j) - k;
        }

        z0 = tempArr[ 2 + j * 3];
        x0 = tempArr[ 0 + j * 3] + width / 2;
        y0 = tempArr[ 1 + j * 3] + height / 2;

        z1 = tempArr[ 2 + k * 3];
        x1 = tempArr[ 0 + k * 3] + width / 2;
        y1 = tempArr[ 1 + k * 3] + height / 2;

        z2 = tempArr[ 2 + l * 3];
        x2 = tempArr[ 0 + l * 3] + width / 2;
        y2 = tempArr[ 1 + l * 3] + height / 2;

        r0 = tempArr[ 9  + j * 3];
        g0 = tempArr[ 10 + j * 3];
        b0 = tempArr[ 11 + j * 3];

        r1 = tempArr[ 9  + k * 3];
        g1 = tempArr[ 10 + k * 3];
        b1 = tempArr[ 11 + k * 3];

        r2 = tempArr[ 9  + l * 3];
        g2 = tempArr[ 10 + l * 3];
        b2 = tempArr[ 11 + l * 3]; 

        u0 = tempArr[ 18 + j * 2];
        v0 = tempArr[ 19 + j * 2];
        u1 = tempArr[ 18 + k * 2];
        v1 = tempArr[ 19 + k * 2];
        u2 = tempArr[ 18 + l * 2];
        v2 = tempArr[ 19 + l * 2];
        // Start drawing top part of triangle.

        // We're safe from divide by zero here because
        // the y values are sorted, and if y1=y0 we won't
        // attempt to do anything before recalculating fm.

        // How far down is our 'mid-point'?
        fm = (y1 - y0) / (y2 - y0);

        // Where is that along the x edge?
        xm = (fm * (x2 - x0) + x0);
        // What color is our mid-point?
        rm = fm * (r2 - r0) + r0;
        gm = fm * (g2 - g0) + g0;
        bm = fm * (b2 - b0) + b0;

        um = fm * (u2 - u0) + u0;
        vm = fm * (v2 - v0) + v0;

        // Does the top-triangle exist and is some part of it on the screen?
        y0--;
        y1++;
        if( ( ( y0 <= height ) ||
              ( y1 >= 0 )   )&&
            ( ( x0 >= 0 || x0 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x1 >= 0 || x1 <= width )    )&& 
            (y0 !== y1))
        {

            // Is 1 the left point?
            if( x1 < xm ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xgl = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgr = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grl = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggl = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbl = (b1 -  b0) / (y1 - y0); // etc.

                grr = (rm -  r0) / (y1 - y0);
                ggr = (gm -  g0) / (y1 - y0);
                gbr = (bm -  b0) / (y1 - y0);

                gul = (u1 - u0) / (y1 - y0);
                gvl = (v1 - v0) / (y1 - y0);

                gur = (um - u0) / (y1 - y0);
                gvr = (vm - v0) / (y1 - y0);


            } else {
                // If not, swap them all.
                xgr = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgl = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grr = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggr = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbr = (b1 -  b0) / (y1 - y0); // etc.

                grl = (rm -  r0) / (y1 - y0);
                ggl = (gm -  g0) / (y1 - y0);
                gbl = (bm -  b0) / (y1 - y0);

                gur = (u1 - u0) / (y1 - y0);
                gvr = (v1 - v0) / (y1 - y0);

                gul = (um - u0) / (y1 - y0);
                gvl = (vm - v0) / (y1 - y0);

            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y1 < 0 || y0 > height) {
                ye = ys = 0;
            } else {
                if (y0 >=0){
                    ys = y0;
                } else{
                    ys = 0;
                }
                if ( y1 < height ) {
                    ye = y1;
                } else { 
                    ye = height;
                }
            }
            k = ys - y0;
            xl = x0 + xgl * k;
            xr = x0 + xgr * k;
            rl = r0 + grl * k;
            gl = g0 + ggl * k;
            bl = b0 + gbl * k;
            ul = u0 + gul * k;
            vl = v0 + gvl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            uc = ul;
            vc = vl;
            rr = r0 + grr * k;
            gr = g0 + ggr * k;
            br = b0 + gbr * k;
            ur = u0 + gur * k;
            vr = v0 + gvr * k;   
    
    
    
            drawHalfTriTexOrtho(j,k,l,m,xr,xl,xs,xe,ys,ye,xgl,xgr,width,rc,rl,rr,bc,bl,br,gc,gl,gr,grh,gbh,ggh,grl,grr,ggl,ggr,gbl,gbr,uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,data,lineW,round,floor,tdata,twidth);
            y2++;
            y1--;
            y1--;   
    

        }


        if( ( ( y1 <= height ) ||
              ( y2 >= 0 )   )&&
            ( ( x1 >= 0 || x1 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x2 >= 0 || x2 <= width )    )&& 
            (y1 !== y2))
        {

            // Is 1 the left point?
            if( xm < x1 ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xl = xm;
                xr = x1;


                rl = rm;
                gl = gm;
                bl = bm;

                rr = r1;
                gr = g1;
                br = b1;

                ul = um;
                vl = vm;

                ur = u1;
                vr = v1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                grl = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggl = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbl = (b2 -  bm) / (y2 - y1); // etc.

                grr = (r2 -  r1) / (y2 - y1);
                ggr = (g2 -  g1) / (y2 - y1);
                gbr = (b2 -  b1) / (y2 - y1);

                gul = (u2 - um) / (y2 - y1);
                gvl = (v2 - vm) / (y2 - y1);

                gur = (u2 - u1) / (y2 - y1);
                gvr = (v2 - v1) / (y2 - y1);


            } else {
                // If not, swap them all.
                xl = x1;
                xr = xm;

                rr = rm;
                gr = gm;
                br = bm;

                rl = r1;
                gl = g1;
                bl = b1;

                ur = um;
                vr = vm;

                ul = u1;
                vl = v1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                grr = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggr = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbr = (b2 -  bm) / (y2 - y1); // etc.

                grl = (r2 -  r1) / (y2 - y1);
                ggl = (g2 -  g1) / (y2 - y1);
                gbl = (b2 -  b1) / (y2 - y1);

                gur = (u2 - um) / (y2 - y1);
                gvr = (v2 - vm) / (y2 - y1);

                gul = (u2 - u1) / (y2 - y1);
                gvl = (v2 - v1) / (y2 - y1);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y2 < 0 || y1 > height) {
                ye = ys = 0;
            } else {
                if (y1 > 0){
                    ys = y1;
                } else{
                    ys = 0;
                }
                if ( y2 < height ) {
                    ye = y2;
                } else { 
                    ye = height;
                }
            }
            k = ys - y1;
            xl += xgl * k;
            xr += xgr * k;
            rl += grl * k;
            gl += ggl * k;
            bl += gbl * k;

            ul += gul * k;
            vl += gvl * k;

            uc = ul;
            vc = vl;

            rc = rl;
            gc = gl;
            bc = bl;
            
            ur += gur * k;
            vr += gvr * k;

            rr += grr * k;
            gr += ggr * k;
            br += gbr * k;
    
            drawHalfTriTexOrtho(j,k,l,m,xr,xl,xs,xe,ys,ye,xgl,xgr,width,rc,rl,rr,bc,bl,br,gc,gl,gr,grh,gbh,ggh,grl,grr,ggl,ggr,gbl,gbr,uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,data,lineW,round,floor,tdata,twidth);
   
        }
    // End full-tri loop
    }


};

// Draws half a triangle with colored lighting and texture.
var drawHalfTriTexOrtho = function(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,
       data,lineW,round,floor,tdata,twidth){
    var guh,gvh,ti,val;
    xl--;
    xr++;
    l = 4*width*round(ys);
    j = round(ye - ys);
    while (j--){
        // How wide is the current line?
        lineW = xr - xl;
        // Set current color.

        // Calculate new scanline gradient.
        // Only thing that's not linear.
        grh = (rr - rl) / lineW;
        gbh = (br - bl) / lineW;
        ggh = (gr - gl) / lineW;
        guh = (ur - ul) / lineW;
        gvh = (vr - vl) / lineW;

        if (xr < 0 || xl > width) {
            xe = xs = 0;
        } else {
            if (xl >=0){
                xs = xl;
            } else{
                xs = 0;
            }
            if ( xr < width ) {
                xe = xr;
            } else { 
                xe = width;
            }
        }
        rc = rl + grh * (xs - xl);
        gc = gl + ggh * (xs - xl);
        bc = bl + gbh * (xs - xl);
        uc = ul + guh * (xs - xl);
        vc = vl + gvh * (xs - xl);

        m = (l + 4*floor(xs)); // Index relating position and data[].
        // Duff's device

        k = round(xe - xs);
        while(k--){
            // DRAW A PIXEL
            // Compound statements are faster. I'm assuming it only does the scope resolution once.
            ti =  4*((uc|0)+width*(vc|0)),
            val = tdata[ti] / 255,
            (data[m++] = rc * val, data[m++] = gc * val, data[m++] = bc * val, data[m++] = 255,rc += grh,gc += ggh,bc += gbh, uc += guh, vc += gvh);
        }



        l += 4 * width; // Move to next line.
        xl += xgl; // Increment left and right edges.
        xr += xgr;

        // Increment end colors.
        rl += grl;
        gl += ggl;
        bl += gbl;
        ul += gul;
        vl += gvl;

        rr += grr;
        gr += ggr;
        br += gbr;
        ur += gur;
        vr += gvr;

    // End half-tri loop.
    }

}
window['drawTriTex'] = drawTriTex;
window['sortAndDraw'] = sortAndDraw;
window['queueDraw'] = queueDraw;
