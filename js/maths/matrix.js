/*
This file is part of the jsphys web physics package.  
Copyright (C) 2012 Matthew Watson  
@fileoverview 3d and 4d linear algebra library.

Use with care, there are no checks on anything because it needs to be fast.
Empirical testing  as of early 2012 showed objects to be faster than arrays for
some purposes, although I suspect this may change when firefox finish their
compiler overhaul.  
This is also partially a self-control measure as it discourages
frequent direct component access where a more abstract operation would be 
preferable.
*/


/*
##vec3
  Functions for 3 element vectors consisting of an object with members x, y, z
  as in:

    X = {x: 1, y: 2, z: 3};
  Allowed to contain other elements such as being a vec4.
  Intended for numbers but many of the functions work with string elements.
  Most funcitons return the destination variable as well as requiring you to
  provide one (to avoid unnecessary if statements).
  As such they can either be used in a more imperative style

    var A = vec3.create(1,2,3),
        B = vec3.create(1,2,3),
        C = {};
    vec3.add(A, B, C);
  Or in a more functional style

    var A = vec3.create(1,2,3),
        B = vec3.create(1,2,3),
        C = vec3.add(A, B, {});
  Using in a functional style every time

    C = vec3.add(A, B, C);
  Is fine, but a bit redundant due to the requirement of providing a 
  destination.
*/
var vec3 = {
  /*
  ###vec3.create
    Usage:

      var X = vec3.create(1,2,3);
    Somewhat redundant as it's equivalent to:

      var X = vec3.setScalar(1,2,3,{});
  */
  create: function(x, y, z) {
    return {x: x, y: y, z: z};
  },
  /*
  ###vec3.setVec
    Usage:

      B = vec3.setVec(A,B);
      vec3.setVec(A,B);
      var B = vec3.setVec(A,{});
    Set one vector from another. Or create one using an object literal
    as the destination.
  */
  setVec: function(vec, dest) {
    dest.x = vec.x;
    dest.y = vec.y;
    dest.z = vec.z;
    return dest;
  },
  /*
  ###vec3.setArr
    Set a vector from an array. Can also be used for creation.

      var A = vec3.setArr([1,2,3],{});
  */
  setArr: function(arr, dest) {
    dest.x = arr[0];
    dest.y = arr[1];
    dest.z = arr[2];
    return dest;
  },
  /*
  ###vec3.set
    Set vector from components.

      vec3.set(A, B);
      var B = vec3.set(A, {});
  */
  set: function(x, y, z, dest) {
    dest.x = x;
    dest.y = y;
    dest.z = z;
    return dest;
  },
  /*
  ###vec3.add
    Add two vectors.
    $$\mathbf{C} = \mathbf{A} + \mathbf{B}$$

      vec3.add(A, B, C);
      var C = vec3.add(A, B, {});
  */
  add: function(vec1, vec2, dest) {
    dest.x = vec1.x + vec2.x;
    dest.y = vec1.y + vec2.y;
    dest.z = vec1.z + vec2.z;
    return dest;
  },
  /*
  ###vec3.subtract
    Subtract two vectors.
    $$\mathbf{C} = \mathbf{A} - \mathbf{B}$$

      vec3.subtract(A, B, C);
      var C = vec3.subtract(A, B, {});
  */
  subtract: function(vec1, vec2, dest) {
    dest.x = vec1.x - vec2.x;
    dest.y = vec1.y - vec2.y;
    dest.z = vec1.z - vec2.z;
    return dest;
  },
  /*
  ###vec3.norm
    Normalize a vector.
    $$B=\frac{A}{|A|}$$

      vec3.norm(A, B);
      var B = vec3.norm(A, {});
    $$\frac{A}{|A|} = 1$$

      vec3.norm(A,A);
  */
  norm: function(vec, dest) {
    var x = vec.x,
        y = vec.y,
        z = vec.z,
        imag = 1 / Math.sqrt(x * x + y * y + z * z);
    dest.x = x * imag;
    dest.y = y * imag;
    dest.z = z * imag;
    return dest;
  },
  /*
  ###vec3.cross
    Cross product. If you use it on a vec4 you'll get nonsense.
    $$ \mathbf{C} = \mathbf{A}\times\mathbf{B}$$

      vec3.cross(A, B, C);
      var C = vec3.cross(A, B, {});
  */
  cross: function(vec1, vec2, dest) {
    var x1 = vec1.x, x2 = vec2.x,
        y1 = vec1.y, y2 = vec2.y,
        z1 = vec1.z, z2 = vec2.z;
    dest.x = y1 * z2 - z1 * y2;
    dest.y = z1 * x2 - x1 * z2;
    dest.z = x1 * y2 - y1 * x2;
    return dest;
  },
  /*
  ###vec3.dot
    Dot product between two vectors.
    $$c = \mathbf{A}\cdot\mathbf{B}$$

      var c = vec3.dot(A,B);
  */
  dot: function(vec1, vec2) {
    return vec1.x * vec2.x +
           vec1.y * vec2.y +
           vec1.z * vec2.z;
  },
  /*
  ###vec3.scale
    Scale a vector by a constant.
    $$\mathbf{B} = a\mathbf{A}$$

      var a = 5,
          A = vec3.create(1,2,3);
      B = vec3.scale(a,A, {});
      vec3.scale{2, A, A};
  */
  scale: function(scale, vec, dest) {
    dest.x = scale * vec.x;
    dest.y = scale * vec.y;
    dest.z = scale * vec.z;
    return dest;
  }
};
var mat3 = {
  create: function(aa, ab, ac, ba, bb, bc, ca, cb, cc) {
    return {
      aa: aa, ab: ab, ac: ac,
      ba: ba, bb: bb, bc: bc,
      ca: ca, cb: cb, cc: cc
    };
  },
  mulVec3: function(mat3, vec3, dest) {
    var x = vec3.x,
        y = vec3.y,
        z = vec3.z,
        m = mat3;
    dest.x = m.aa * x + m.ab * y + m.ac * z;
    dest.y = m.ba * x + m.bb * y + m.bc * z;
    dest.z = m.ca * x + m.cb * y + m.cc * z;
  },
  mul: function(mat1, mat2, dest) {
    // Yuck.
    // aa ab ac | aa ab ac
    // ba bb bc | ba bb bc
    // ca cb cc | ca cb cc
    var aa1 = mat1.aa, ab1 = mat1.ab, ac1 = mat1.ac,
        ba1 = mat1.ba, bb1 = mat1.bb, bc1 = mat1.bc,
        ca1 = mat1.ca, cb1 = mat1.cb, cc1 = mat1.cc,
        aa2 = mat2.aa, ab2 = mat2.ab, ac2 = mat2.ac,
        ba2 = mat2.ba, bb2 = mat2.bb, bc2 = mat2.bc,
        ca2 = mat2.ca, cb2 = mat2.cb, cc2 = mat2.cc;
    dest.aa = aa1 * aa2 + ab1 * ba2 + ac1 * ca2;
    dest.ab = aa1 * ab2 + ab1 * bb2 + ac1 * cb2;
    dest.ac = aa1 * ac2 + ab1 * bc2 + ac1 * cc2;

    dest.ba = ba1 * aa2 + bb1 * ba2 + bc1 * ca2;
    dest.bb = ba1 * ab2 + bb1 * bb2 + bc1 * cb2;
    dest.bc = ba1 * ac2 + bb1 * bc2 + bc1 * cc2;

    dest.ca = ca1 * aa2 + cb1 * ba2 + cc1 * ca2;
    dest.cb = ca1 * ab2 + cb1 * bb2 + cc1 * cb2;
    dest.cc = ca1 * ac2 + cb1 * bc2 + cc1 * cc2;

    return dest;
  },
  vec2Rows: function(vec1, vec2, vec3, dest) {
    dest.aa = vec1.x;
    dest.ab = vec1.y;
    dest.ac = vec1.z;

    dest.ba = vec2.x;
    dest.bb = vec2.y;
    dest.bc = vec2.z;

    dest.ca = vec3.x;
    dest.cb = vec3.y;
    dest.cc = vec3.z;
    return dest;
  }
};


var vec4 = {
  create: function(x, y, z, t) {
    return {x: x, y: y, z: z, t: t};
  },
  setVec: function(vec, dest) {
    dest.x = vec.x;
    dest.y = vec.y;
    dest.z = vec.z;
    dest.t = vec.t;
    return dest;
  },
  setScalar: function(x, y, z, t, dest) {
    dest.x = x;
    dest.y = y;
    dest.z = z;
    dest.t = t;
    return dest;
  },
  add: function(vec1, vec2, dest) {
    dest.x = vec1.x + vec2.x;
    dest.y = vec1.y + vec2.y;
    dest.z = vec1.z + vec2.z;
    dest.t = vec1.t + vec2.t;
    return dest;
  },
  subtract: function(vec1, vec2, dest) {
    dest.x = vec1.x - vec2.x;
    dest.y = vec1.y - vec2.y;
    dest.z = vec1.z - vec2.z;
    dest.t = vec1.t - vec2.t;
    return dest;
  },
  norm: function(vec, dest) {
    var mag = 1 / Math.sqrt(x * x + y * y + z * z + t * t);
    dest.x = vec.x * mag;
    dest.y = vec.y * mag;
    dest.z = vec.z * mag;
    dest.t = vec.t * mag;
    return dest;
  },
  spacenorm: function(vec, dest) {
    var mag = 1 / Math.sqrt(x * x + y * y + z * z);
    dest.x = vec.x * mag;
    dest.y = vec.y * mag;
    dest.z = vec.z * mag;
    dest.t = vec.t * mag;
    return dest;
  },
  stnorm: function(vec, dest) {
    var mag = 1 / Math.sqrt(x * x + y * y + z * z - t * t);
    dest.x = vec.x * mag;
    dest.y = vec.y * mag;
    dest.z = vec.z * mag;
    dest.t = vec.t * mag;
    return dest;
  },
  dot: function(vec1, vec2) {
    return vec1.x * vec2.x +
           vec1.y * vec2.y +
           vec1.z * vec2.z +
           vec1.t * vec2.t;
  },
  spacedot: function(vec1, vec2) {
    return vec1.x * vec2.x +
           vec1.y * vec2.y +
           vec1.z * vec2.z;
  },
  stdot: function(vec1, vec2) {
    return vec1.x * vec2.x +
           vec1.y * vec2.y +
           vec1.z * vec2.z +
           vec1.t * vec2.t;
  },
  scale: function(vec, scale, dest) {
    dest.x = scale * vec.x;
    dest.y = scale * vec.y;
    dest.z = scale * vec.z;
    dest.t = scale * vec.t;
    return dest;
  },
  toLat: function(vec,type) {
    type = type || 'pmatrix';
    return '\\[\\begin{'+type+'}' +
           vec.x + ' \\\\\n' + 
           vec.y + ' \\\\\n' + 
           vec.z + ' \\\\\n' + 
           vec.t + ' \\end{'+type+'}\\]'; 
  },
  put: function(vec, type) {
    document.write(vec4.toLat(vec,type));
  }
};

var mat4 = {
  create: function(aa, ab, ac, ad,
                   ba, bb, bc, bd,
                   ca, cb, cc, cd,
                   da, db, dc, dd) {
    return {
      aa: aa, ab: ab, ac: ac, ad: ad,
      ba: ba, bb: bb, bc: bc, bd: bd,
      ca: ca, cb: cb, cc: cc, cd: cd,
      da: da, db: db, dc: dc, dd: dd
    };
  },
  mulVec4: function(A, vec4, dest) {
    var x = vec4.x,
        y = vec4.y,
        z = vec4.z,
        t = vec4.t;
    dest.x = A.aa * x + A.ab * y + A.ac * z + A.ad * t;
    dest.y = A.ba * x + A.bb * y + A.bc * z + A.bd * t;
    dest.z = A.ca * x + A.cb * y + A.cc * z + A.cd * t;
    dest.t = A.da * x + A.db * y + A.dc * z + A.dd * t;
    return dest;
  },
  mul: function(A, B, dest) {
    // Yuck.
    // Multiply AB as below:
    //
    //  /aa ab ac ad\  /aa ab ac ad\
    // | ba bb bc bd || ba bb bc bd |
    // | ca cb cc cd || ca cb cc cd |
    //  \da db dc dd/  \da db dc dd/
    dest.aa = A.aa * B.aa + A.ab * B.ba + A.ac * B.ca + A.ad * B.da;
    dest.ab = A.aa * B.ab + A.ab * B.bb + A.ac * B.cb + A.ad * B.db;
    dest.ac = A.aa * B.ac + A.ab * B.bc + A.ac * B.cc + A.ad * B.dc;
    dest.ad = A.aa * B.ad + A.ab * B.bd + A.ac * B.cd + A.ad * B.dd;

    dest.ba = A.ba * B.aa + A.bb * B.ba + A.bc * B.ca + A.bd * B.da;
    dest.bb = A.ba * B.ab + A.bb * B.bb + A.bc * B.cb + A.bd * B.db;
    dest.bc = A.ba * B.ac + A.bb * B.bc + A.bc * B.cc + A.bd * B.dc;
    dest.bd = A.ba * B.ad + A.bb * B.bd + A.bc * B.cd + A.bd * B.dd;

    dest.ca = A.ca * B.aa + A.cb * B.ba + A.cc * B.ca + A.cd * B.da;
    dest.cb = A.ca * B.ab + A.cb * B.bb + A.cc * B.cb + A.cd * B.db;
    dest.cc = A.ca * B.ac + A.cb * B.bc + A.cc * B.cc + A.cd * B.dc;
    dest.cd = A.ca * B.ad + A.cb * B.bd + A.cc * B.cd + A.cd * B.dd;

    dest.da = A.da * B.aa + A.db * B.ba + A.dc * B.ca + A.dd * B.da;
    dest.db = A.da * B.ab + A.db * B.bb + A.dc * B.cb + A.dd * B.db;
    dest.dc = A.da * B.ac + A.db * B.bc + A.dc * B.cc + A.dd * B.dc;
    dest.dd = A.da * B.ad + A.db * B.bd + A.dc * B.cd + A.dd * B.dd;

    return dest;
  },
  // Cat matrices together string style.
  textMul: function(A, B, dest, timesChar, plusChar) {
    var t = timesChar || '*',
        p = plusChar || '+';
    var a = 'abcd';
    var zero = 0;
    var i,j,k;
    var cur,prev = '';
    for(i in a) {
      for(j in a) {
        dest[a[i]+a[j]] = '(';
        prev = '';
        for(k in a){
          // Nobody likes you, jslint; it's a string
          // Also what if I _want_ to coerce comparison to 0?

          // If we have no term, set it to '' else, combine two components w a
          // timesChar.
          b = A[a[i]+a[k]];
          c = B[a[k]+a[j]];
          cur = (b == zero || c == zero) ? '' :
           (b == 1 && c == 1) ? '1' : ((b == 1 ? '' : b) +t+ (c == 1 ? '' : c));
          // If it's time for a plusChar, give us a plusChar. Append current
          // term to current element.
          dest[a[i]+a[j]] += ((prev !== '' && cur !== '')? p : '')  + cur;
          // If we have a non '' term, make it the reference term for plusChar.
          prev = (cur === '') ? prev : cur;
        }
        // If we didn't generate anything, bung in a 0.
        dest[a[i]+a[j]] += ')';
        dest[a[i]+a[j]] = dest[a[i]+a[j]] === '()' ? ' 0 ': 
          dest[a[i]+a[j]] === '(1)' ? 1 : dest[a[i]+a[j]];
      }
    }
    return dest;
  },
  toText: function(A, prec, fixed) {
    var el, dest = {};
    for(el in A) {
      if(A.hasOwnProperty(el)) {
        dest[el] = A[el] ? (fixed ? A[el].toFixed(prec) : 
                                    A[el].toPrecision(prec)) :
                           ' 0 ';
      }
    }
    return dest;
  },
  toArr: function(A) {
    return [[aa,ab,ac,ad],
            [ba,bb,bc,bd],
            [ca,cb,cc,cd],
            [da,db,dc,dd]];
  },
  fromArr: function(ar) {
    return mat4.create(ar[0][0],ar[0][1],ar[0][2],ar[0][3],
                       ar[1][0],ar[1][1],ar[1][2],ar[1][3],
                       ar[2][0],ar[2][1],ar[2][2],ar[2][3],
                       ar[3][0],ar[3][1],ar[3][2],ar[3][3]);
  },
  toLat: function(A,type) {
    type = type || 'pmatrix';
    return '\\[\\begin{'+type+'}' +
           A.aa + ' & ' + A.ab + ' & ' + A.ac + ' & ' + A.ad + ' \\\\\n' + 
           A.ba + ' & ' + A.bb + ' & ' + A.bc + ' & ' + A.bd + ' \\\\\n' + 
           A.ca + ' & ' + A.cb + ' & ' + A.cc + ' & ' + A.cd + ' \\\\\n' + 
           A.da + ' & ' + A.db + ' & ' + A.dc + ' & ' + A.dd + ' \\end{'+type+'}\\]'; 
  },
  put: function(mat, type) {
    document.write(mat4.toLat(mat,type));
  }
};

window['vec3'] = vec3;
window['mat3'] = mat3;
