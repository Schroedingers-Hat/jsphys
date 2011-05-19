function dopplerShiftColor(colorTemp, velocity, gamma)
{
    // Assuming this is accurate for transverse doppler, too.
    var dopplerFactor = 1/(1+(velocity/c))/gamma;
    return colorTemp * dopplerFactor;
}

function tempToColor(colorTemp)
{
    if (!tempToColor.cache)
        tempToColor.cache = {};
    
    var roundedTemp = (Math.round(colorTemp / 100) * 100);
    
    if (!(roundedTemp.toString() in tempToColor.cache))
    {
        var xyz = spectrum_to_xyz(bb_spectrum(colorTemp));
        var rgb = constrain_rgb(xyz_to_rgb(xyz[0], xyz[1], xyz[2]));
        // rgb = norm_rgb(rgb[0], rgb[1], rgb[2]);
    
        var color = "#" + padRGB(Math.floor(rgb[0] * 255).toString(16)) + 
                     padRGB(Math.floor(rgb[1] * 255).toString(16)) +
                     padRGB(Math.floor(rgb[2] * 255).toString(16));
        tempToColor.cache[roundedTemp.toString()] = color;
    }
    
    return tempToColor.cache[roundedTemp.toString()];
}

/**
 * RGB colors are in the form RRGGBB. If a color component only takes 1
 * digit to represent, pad it with a leading zero, or we'll end up with
 * RGGB or something.
 */
function padRGB(color)
{
    if (color.length < 2)
        color = "0" + color;
    
    return color;
}

/**
 * Code that follows is ported from specrend.c, by John Walker, released in
 * the public domain. For more information, see:
 * http://www.fourmilab.ch/documents/specrend/
 */

/*                             XYZ_TO_RGB

    Given an additive tricolour system CS, defined by the CIE x
    and y chromaticities of its three primaries (z is derived
    trivially as 1-(x+y)), and a desired chromaticity (XC, YC,
    ZC) in CIE space, determine the contribution of each
    primary in a linear combination which sums to the desired
    chromaticity.  If the  requested chromaticity falls outside
    the Maxwell triangle (colour gamut) formed by the three
    primaries, one of the r, g, or b weights will be negative. 

    Caller can use constrain_rgb() to desaturate an
    outside-gamut colour to the closest representation within
    the available gamut and/or norm_rgb to normalise the RGB
    components so the largest nonzero component has value 1.
    
*/
function xyz_to_rgb(xc, yc, zc)
{
    // HDTV/sRGB color space
    var cs = { "red":   {"x": 0.670, "y": 0.330, "z": 0},
               "green": {"x": 0.210, "y": 0.710, "z": 0.080},
               "blue":  {"x": 0.150, "y": 0.060, "z": 0.790},
               "white": {"x": 0.3127, "y": 0.3291, "z": 0.3582} };
    
    /* xyz -> rgb matrix, before scaling to white. */
    
    var rx = (cs.green.y * cs.blue.z) - (cs.blue.y * cs.green.z);
    var ry = (cs.blue.x * cs.green.z) - (cs.green.x * cs.blue.z);
    var rz = (cs.green.x * cs.blue.y) - (cs.blue.x * cs.green.y);
    
    var gx = (cs.blue.y * cs.red.z) - (cs.red.y * cs.blue.z);
    var gy = (cs.red.x * cs.blue.z) - (cs.blue.x * cs.red.z);
    var gz = (cs.blue.x * cs.red.y) - (cs.red.x * cs.blue.y);
    
    var bx = (cs.red.y * cs.green.z) - (cs.green.y * cs.red.z);
    var by = (cs.green.x * cs.red.z) - (cs.red.x * cs.green.z);
    var bz = (cs.red.x * cs.green.y) - (cs.green.x * cs.red.y);

    /* White scaling factors.
       Dividing by yw scales the white luminance to unity, as conventional. */
       
    var rw = ((rx * cs.white.x) + (ry * cs.white.y) + (rz * cs.white.z)) / cs.white.y;
    var gw = ((gx * cs.white.x) + (gy * cs.white.y) + (gz * cs.white.z)) / cs.white.y;
    var bw = ((bx * cs.white.x) + (by * cs.white.y) + (bz * cs.white.z)) / cs.white.y;

    /* xyz -> rgb matrix, correctly scaled to white. */
    
    rx = rx / rw;  ry = ry / rw;  rz = rz / rw;
    gx = gx / gw;  gy = gy / gw;  gz = gz / gw;
    bx = bx / bw;  by = by / bw;  bz = bz / bw;

    /* rgb of the desired point */
    
    var r = (rx * xc) + (ry * yc) + (rz * zc);
    var g = (gx * xc) + (gy * yc) + (gz * zc);
    var b = (bx * xc) + (by * yc) + (bz * zc);
    
    return [r, g, b];
}

/*                          CONSTRAIN_RGB

    If the requested RGB shade contains a negative weight for
    one of the primaries, it lies outside the colour gamut 
    accessible from the given triple of primaries.  Desaturate
    it by adding white, equal quantities of R, G, and B, enough
    to make RGB all positive.
    
*/
function constrain_rgb(rgb)
{
    var w;
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    
    /* Amount of white needed is w = - min(0, *r, *g, *b) */
    
    w = (0 < r) ? 0 : r;
    w = (w < g) ? w : g;
    w = (w < b) ? w : b;
    w = -w;

    /* Add just enough white to make r, g, b all positive. */
    
    if (w > 0) {
        r += w;  g += w; b += w;
    }
    return [r, g, b];
}

/*  	    	    	    NORM_RGB

    Normalise RGB components so the most intense (unless all
    are zero) has a value of 1.
    
*/
function norm_rgb(r, g, b)
{
    var greatest = Math.max(r, Math.max(g, b));
    
    if (greatest > 0) {
    	r /= greatest;
	    g /= greatest;
    	b /= greatest;
    }
    return [r, g, b];
}

/*                          SPECTRUM_TO_XYZ

    Calculate the CIE X, Y, and Z coordinates corresponding to
    a light source with spectral distribution given by  the
    function SPEC_INTENS, which is called with a series of
    wavelengths between 380 and 780 nm (the argument is 
    expressed in meters), which returns emittance at  that
    wavelength in arbitrary units.  The chromaticity
    coordinates of the spectrum are returned in the x, y, and z
    arguments which respect the identity:

            x + y + z = 1.
*/
function spectrum_to_xyz(spectrum)
{
    var i;
    var lambda, X = 0, Y = 0, Z = 0, XYZ;

    /* CIE colour matching functions xBar, yBar, and zBar for
       wavelengths from 380 through 780 nanometers, every 5
       nanometers.  For a wavelength lambda in this range:

            cie_colour_match[(lambda - 380) / 5][0] = xBar
            cie_colour_match[(lambda - 380) / 5][1] = yBar
            cie_colour_match[(lambda - 380) / 5][2] = zBar

	To save memory, this table can be declared as floats
	rather than doubles; (IEEE) float has enough 
	significant bits to represent the values. It's declared
	as a double here to avoid warnings about "conversion
	between floating-point types" from certain persnickety
	compilers. */

    var cie_colour_match = [
        [0.0014,0.0000,0.0065], [0.0022,0.0001,0.0105], [0.0042,0.0001,0.0201],
        [0.0076,0.0002,0.0362], [0.0143,0.0004,0.0679], [0.0232,0.0006,0.1102],
        [0.0435,0.0012,0.2074], [0.0776,0.0022,0.3713], [0.1344,0.0040,0.6456],
        [0.2148,0.0073,1.0391], [0.2839,0.0116,1.3856], [0.3285,0.0168,1.6230],
        [0.3483,0.0230,1.7471], [0.3481,0.0298,1.7826], [0.3362,0.0380,1.7721],
        [0.3187,0.0480,1.7441], [0.2908,0.0600,1.6692], [0.2511,0.0739,1.5281],
        [0.1954,0.0910,1.2876], [0.1421,0.1126,1.0419], [0.0956,0.1390,0.8130],
        [0.0580,0.1693,0.6162], [0.0320,0.2080,0.4652], [0.0147,0.2586,0.3533],
        [0.0049,0.3230,0.2720], [0.0024,0.4073,0.2123], [0.0093,0.5030,0.1582],
        [0.0291,0.6082,0.1117], [0.0633,0.7100,0.0782], [0.1096,0.7932,0.0573],
        [0.1655,0.8620,0.0422], [0.2257,0.9149,0.0298], [0.2904,0.9540,0.0203],
        [0.3597,0.9803,0.0134], [0.4334,0.9950,0.0087], [0.5121,1.0000,0.0057],
        [0.5945,0.9950,0.0039], [0.6784,0.9786,0.0027], [0.7621,0.9520,0.0021],
        [0.8425,0.9154,0.0018], [0.9163,0.8700,0.0017], [0.9786,0.8163,0.0014],
        [1.0263,0.7570,0.0011], [1.0567,0.6949,0.0010], [1.0622,0.6310,0.0008],
        [1.0456,0.5668,0.0006], [1.0026,0.5030,0.0003], [0.9384,0.4412,0.0002],
        [0.8544,0.3810,0.0002], [0.7514,0.3210,0.0001], [0.6424,0.2650,0.0000],
        [0.5419,0.2170,0.0000], [0.4479,0.1750,0.0000], [0.3608,0.1382,0.0000],
        [0.2835,0.1070,0.0000], [0.2187,0.0816,0.0000], [0.1649,0.0610,0.0000],
        [0.1212,0.0446,0.0000], [0.0874,0.0320,0.0000], [0.0636,0.0232,0.0000],
        [0.0468,0.0170,0.0000], [0.0329,0.0119,0.0000], [0.0227,0.0082,0.0000],
        [0.0158,0.0057,0.0000], [0.0114,0.0041,0.0000], [0.0081,0.0029,0.0000],
        [0.0058,0.0021,0.0000], [0.0041,0.0015,0.0000], [0.0029,0.0010,0.0000],
        [0.0020,0.0007,0.0000], [0.0014,0.0005,0.0000], [0.0010,0.0004,0.0000],
        [0.0007,0.0002,0.0000], [0.0005,0.0002,0.0000], [0.0003,0.0001,0.0000],
        [0.0002,0.0001,0.0000], [0.0002,0.0001,0.0000], [0.0001,0.0000,0.0000],
        [0.0001,0.0000,0.0000], [0.0001,0.0000,0.0000], [0.0000,0.0000,0.0000]
    ];

    for (i = 0, lambda = 380; lambda < 780.1; i++, lambda += 5) {
        var Me;

        Me = spectrum(lambda);
        X += Me * cie_colour_match[i][0];
        Y += Me * cie_colour_match[i][1];
        Z += Me * cie_colour_match[i][2];
    }
    XYZ = (X + Y + Z);
    return [X / XYZ, Y / XYZ, Z / XYZ];
}

/*                            BB_SPECTRUM

    Calculate, by Planck's radiation law, the emittance of a black body
    of temperature bbTemp at the given wavelength (in metres).  */
function bb_spectrum(temperature)
{
    return function(wavelength) {
        var wlm = wavelength * 1e-9;   /* Wavelength in meters */

        return (3.74183e-16 * Math.pow(wlm, -5.0)) /
               (Math.exp(1.4388e-2 / (wlm * temperature)) - 1.0);
    };
}
