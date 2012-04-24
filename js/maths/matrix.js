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
  $$A\wedge B\wedge C = (A\wedge B)\wedge C$$

  $$=\left< AB \right> _2\wedge C$$

  $$=\left<(A_te_t + A_xe_x + A_ye_y + A_ze_z)
     (B_te_t + B_xe_x + B_ye_y + B_ze_z)\right>_2\wedge C$$
  $$= (A_tB_xe_te_x + A_tB_ye_te_y + A_tB_ze_te_z +\\\\ 
       A_xB_te_xe_t + A_xB_ye_xe_y + A_xB_ze_xe_z +\\\\
       A_yB_te_ye_t + A_yB_xe_ye_x + A_yB_ze_ye_z +\\\\
       A_zB_te_ze_t + A_zB_xe_ze_x + A_zB_ye_ze_y)\wedge C$$

       (A_tB_x - A_xB_t)e_te_x + 
*/
/*
  These functions were Intended for numbers but many work with string elements
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

/*
##vec3
  Functions for 3 element vectors consisting of an object with members x, y, z
  as in:

    X = {x: 1, y: 2, z: 3};
  Allowed to contain other elements such as being a vec4.
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

      vec3.set(x,y,z, A);
      var A = vec3.set(x,y,z, {});
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
    subtract two vectors.
    $$\mathbf{c} = \mathbf{a} - \mathbf{b}$$

      vec3.subtract(a, b, c);
      var c = vec3.subtract(a, b, {});
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

/*
##mat3
  Functions for 3x3 element matrices of format:

    A = {aa: aa, ab: ab, ac: ac,
         ba: ba, bb: bb, bc: bc,
         ca: ca, cb: cb, cc: cc}
  First letter is column, second is row.
  $$\begin{pmatrix}aa&ab&ac\\\\
                   ba&bb&bc\\\\
                   ca&cb&cc
  \end{pmatrix}$$
 
  Any vec3 is assumed to be column vectors unless mentioned.
  Default multiplication is with the matrix on the left.
*/
var mat3 = {
  /*
  ###mat3.create
    Usage:

      var A = vec3.create(1,2,3,4,5,6,7,8,9);
  */
  create: function(aa, ab, ac, ba, bb, bc, ca, cb, cc) {
    return {
      aa: aa, ab: ab, ac: ac,
      ba: ba, bb: bb, bc: bc,
      ca: ca, cb: cb, cc: cc
    };
  },
  /*
  ###mat3.set
    Usage:

      var A = vec3.create(1,2,3,4,5,6,7,8,9, {});
    Alternate:

      vec3.create(1,2,3,4,5,6,7,8,9, A);
  */
  set: function(aa, ab, ac, ba, bb, bc, ca, cb, cc, dest) {
      dest.aa = aa;
      dest.ab = ab;
      dest.ac = ac;

      dest.ba = ba;
      dest.bb = bb;
      dest.bc = bc;

      dest.ca = ca;
      dest.cb = cb;
      dest.cc = cc;
      return dest;
  },
  /*
  ###mat3.mulVec3
  Multiply a vec3 by a mat3 on the left putting the result into a vec3.
  $$\mathbf{U} = A\mathbf{V}$$

      U = mat3.mulVec3(A, V, {});
  Or:

      mat3.mulVec3(A, V, U);
  Or with an implicit 1 if dest is the same as the input and a vec4:
  $$\begin{pmatrix}1& 0& 0& 0\\\\
                 0&aa&ab&ac\\\\
                 0&ba&bb&bc\\\\
                 0&ca&cb&cc\end{pmatrix}
  \begin{pmatrix}t\\\\x\\\\y\\\\z\end{pmatrix}$$

      mat3.mulVec3(mat3, U, U);
  */
  mulVec3: function(m, vec3, dest) {
    var x = vec3.x,
        y = vec3.y,
        z = vec3.z;
    dest.x = m.aa * x + m.ab * y + m.ac * z;
    dest.y = m.ba * x + m.bb * y + m.bc * z;
    dest.z = m.ca * x + m.cb * y + m.cc * z;
  },
  /*
  ###mat3.mul
  Multiply two 3x3 matrices.
  Empirical testing showed caching was detrimental on recent browsers.
    $$\begin{pmatrix}aa&ab&ac\\\\
                     ba&bb&bc\\\\
                     ca&cb&cc\end{pmatrix}
      \begin{pmatrix}aa&ab&ac\\\\
                     ba&bb&bc\\\\
                     ca&cb&cc\end{pmatrix}$$
  Usage:

      C = mat3.mul(A,B,{});
      mat3.mul(A,B,C);
  */
  mul: function(m1, m2, dest) {
    dest.aa = m1.aa * m2.aa + m1.ab * m2.ba + m1.ac * m2.ca;
    dest.ab = m1.aa * m2.ab + m1.ab * m2.bb + m1.ac * m2.cb;
    dest.ac = m1.aa * m2.ac + m1.ab * m2.bc + m1.ac * m2.cc;

    dest.ba = m1.ba * m2.aa + m1.bb * m2.ba + m1.bc * m2.ca;
    dest.bb = m1.ba * m2.ab + m1.bb * m2.bb + m1.bc * m2.cb;
    dest.bc = m1.ba * m2.ac + m1.bb * m2.bc + m1.bc * m2.cc;

    dest.ca = m1.ca * m2.aa + m1.cb * m2.ba + m1.cc * m2.ca;
    dest.cb = m1.ca * m2.ab + m1.cb * m2.bb + m1.cc * m2.cb;
    dest.cc = m1.ca * m2.ac + m1.cb * m2.bc + m1.cc * m2.cc;

    return dest;
  },
  /*
  ###mat3.vecToRows
  Make a matrix with rows consisting of vec3s (or the x,y,z components of
  vec4s.
  Useful for producing a transformation from a set of basis vectors.
  Usage:

      T = mat3.vecToRows(X,Y,Z,{});
      mat3.vecToRows(X, Y, Z, T);
  */
  vecToRows: function(vec1, vec2, vec3, dest) {
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
  /*
  ###vec4.create
    Usage:

      var X = vec3.create(1,2,3,4);
    Somewhat redundant as it's equivalent to:

      var X = vec3.setScalar(1,2,3,4,{});
  */
  create: function(x, y, z, t) {
    return {x: x, y: y, z: z, t: t};
  },
  /*
  ###vec4.setVec
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
    dest.t = vec.t;
    return dest;
  },
  /*
  ###vec4.set
    Set vector from components.

      vec4.set(1,2,3,4, B);
      var B = vec3.set(1,2,3,4, {});
  */
  set: function(x, y, z, t, dest) {
    dest.x = x;
    dest.y = y;
    dest.z = z;
    dest.t = t;
    return dest;
  },
  /*
  ###vec4.add
    Add two vectors.
    $$\mathbf{C} = \mathbf{A} + \mathbf{B}$$

      vec4.add(A, B, C);
      var C = vec4.add(A, B, {});
  */
  add: function(vec1, vec2, dest) {
    dest.x = vec1.x + vec2.x;
    dest.y = vec1.y + vec2.y;
    dest.z = vec1.z + vec2.z;
    dest.t = vec1.t + vec2.t;
    return dest;
  },
  /*
  ###vec4.subtract
    Subtract two vectors.
    $$\mathbf{C} = \mathbf{A} - \mathbf{B}$$

      vec4.subtract(A, B, C);
      var C = vec4.subtract(A, B, {});
  */
  subtract: function(vec1, vec2, dest) {
    dest.x = vec1.x - vec2.x;
    dest.y = vec1.y - vec2.y;
    dest.z = vec1.z - vec2.z;
    return dest;
  },
  /*
  ###vec4.norm
    Normalize a vector. With 4D Euclidean norm.
    $$B=\frac{A}{|A|}$$

      vec4.norm(A, B);
      var B = vec4.norm(A, {});
    $$\frac{A}{|A|} = 1$$

      vec4.norm(A,A);

    Returns a vector of 0s if the magnitude is 0.
  */
  norm: function(vec, dest) {
    var mag = Math.sqrt(x * x + y * y + z * z + t * t);
    // Return 0 vector if mag is null.
    mag = mag ? 1/mag : 0;
    dest.x = vec.x * mag;
    dest.y = vec.y * mag;
    dest.z = vec.z * mag;
    dest.t = vec.t * mag;
    return dest;
  },
  /*
  ###vec4.spaceNorm
    Normalize a 4D vector. With 3D euclidean norm.
    $$A = \begin{pmatrix}t\\\\x\\\\y\\\\z\end{pmatrix}$$
    $$a=\sqrt{x^2 + y^2 + z^2}$$
    $$B=\frac{A}{a}$$

      vec4.norm(A, B);
      var B = vec4.norm(A, {});
    $$\frac{A}{a} = 1$$

      vec4.norm(A,A);

    Returns a vector of 0s if the magnitude is 0.
  */
  spaceNorm: function(vec, dest) {
    var mag = Math.sqrt(x * x + y * y + z * z);
    // Return 0 vector if mag is null.
    mag = mag ? 1/mag : 0;
    dest.x = vec.x * mag;
    dest.y = vec.y * mag;
    dest.z = vec.z * mag;
    dest.t = vec.t * mag;
    return dest;
  },
  /*
  ###vec4.stNorm
    Normalize a vector. With 4D Minkowski norm.
    $$B=\frac{A}{|A|}$$

      vec4.norm(A, B);
      var B = vec4.norm(A, {});
    $$\frac{A}{|A|} = 1$$

      vec4.norm(A,A);

    Returns a null vector with t component 1 if the magnitude is 0.
  */
  stNorm: function(vec, dest) {
    var mag = Math.sqrt(x * x + y * y + z * z - t * t);
    mag = mag ? 1 / mag : 1 / vec.t;
    // If the vector is null, normalise it so t component == 1.
    dest.x = vec.x * mag;
    dest.y = vec.y * mag;
    dest.z = vec.z * mag;
    dest.t = vec.t * mag;
    return dest;
  },
  /*
  ###vec4.dot
    4D Euclidean inner product between two vectors.
    $$c = \mathbf{A}\cdot\mathbf{B} = 
    A_tB_t + A_xB_x + A_yB_y + A_zB_z$$

      var c = vec4.dot(A,B);

  */
  dot: function(vec1, vec2) {
    return vec1.t * vec2.t +
           vec1.x * vec2.x +
           vec1.y * vec2.y +
           vec1.z * vec2.z;
  },
  /*
  ###vec4.spaceDot
  Spatial magnitude. Good for distances.
  $$\begin{pmatrix}A_t&A_x&A_y&A_z\end{pmatrix}
  \begin{pmatrix}0&0&0&0\\\\
                 0&1&0&0\\\\
                 0&0&1&0\\\\
                 0&0&0&1\end{pmatrix}
  \begin{pmatrix}B_t\\\\B_x\\\\B_y\\\\B_z\end{pmatrix}$$
  Usage:

      r = spaceDot(A,B);
  */
  spaceDot: function(vec1, vec2) {
    return vec1.x * vec2.x +
           vec1.y * vec2.y +
           vec1.z * vec2.z;
  },
  /*
  ###vec4.stDot
    1+3D Minkowski inner product between two vectors.
    $$c = \mathbf{A}\cdot\mathbf{B} = 
    -A_tB_t + A_xB_x + A_yB_y + A_zB_z$$

      var c = vec4.stDot(A,B);

  */
  stDot: function(vec1, vec2) {
    return -vec1.t * vec2.t + 
            vec1.x * vec2.x +
            vec1.y * vec2.y +
            vec1.z * vec2.z;
  },
  /*
  ###vec4.scale
    Scale a vector by a constant.
    $$\mathbf{B} = a\mathbf{A}$$

      var a = 5,
          A = vec4.create(1,2,3);
      B = vec4.scale(a,A, {});
      vec4.scale{2, A, A};
  */
  scale: function(vec, scale, dest) {
    dest.x = scale * vec.x;
    dest.y = scale * vec.y;
    dest.z = scale * vec.z;
    dest.t = scale * vec.t;
    return dest;
  },
  /*
  ###vec4.toLat
  Projuce latex formatted output with optional type.
  */
  toLat: function(vec,type) {
    type = type || 'pmatrix';
    return '\\[\\begin{'+type+'}' +
           vec.x + ' \\\\\n' + 
           vec.y + ' \\\\\n' + 
           vec.z + ' \\\\\n' + 
           vec.t + ' \\end{'+type+'}\\]'; 
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
  /*
  ###mat4.textMul
  Some very simple symbolic manipulation, assuming input is a string and
  outputting a string.
  Nobody is quite sure why this happened.
  */
  textMul: function(A, B, dest, timesChar, plusChar) {
    var t = timesChar || '*',
        p = plusChar || '+';
    var a = 'abcd';
    var zero = 0;
    var i,j,k;
    var cur,prev = '';
    for(i in a) {
      if (a.hasOwnProperty(i)){
      for(j in a) {
        if (a.hasOwnProperty(j)){
        dest[a[i]+a[j]] = '(';
        prev = '';
        for(k in a){
          if (a.hasOwnProperty(k)){
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
        }
        // If we didn't generate anything, bung in a 0.
        dest[a[i]+a[j]] += ')';
        dest[a[i]+a[j]] = dest[a[i]+a[j]] === '()' ? ' 0 ': 
        dest[a[i]+a[j]] === '(1)' ? 1 : dest[a[i]+a[j]];
      }
      }
    }
    }
    return dest;
  },
  /*
  ###mat4.toText
  Take a mat4 with numbers and output one with either fixed precision or fixed
  place decimal strings.
  Usage:

      mat4.toText(a, 4, true); // Outputs 0.xxxx
      mat4.toText(a, 3, false); // Outputs 3 sig figs.
  */
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
  /*
  ###mat4.toArr
  Take {aa,...dd} formatted matrix and return 16 element vector with same
  elements.
  */
  toArr: function(A) {
    return [A.aa,A.ab,A.ac,A.ad,
            A.ba,A.bb,A.bc,A.bd,
            A.ca,A.cb,A.cc,A.cd,
            A.da,A.db,A.dc,A.dd];
  },
  /*
  ###mat4.toArr2
  Take {aa,...dd} formatted matrix and return 4 element vector with elements
  of 4 element vectors with same elements.
  */
  toArr2: function(A) {
    return [[A.aa,A.ab,A.ac,A.ad],
            [A.ba,A.bb,A.bc,A.bd],
            [A.ca,A.cb,A.cc,A.cd],
            [A.da,A.db,A.dc,A.dd]];
  },
  /*
  ###mat4.fromArr
  Same as mat4.toArr in reverse.
  */
  fromArr: function(ar) {
    return mat4.create(ar[ 0],ar[ 1],ar[ 2],ar[ 3],
                       ar[ 4],ar[ 5],ar[ 6],ar[ 7],
                       ar[ 8],ar[ 9],ar[10],ar[11],
                       ar[12],ar[13],ar[14],ar[15]);
  },
  /*
  ###mat4.fromArr2
  Same as mat4.toArr2 in reverse.
  */
  fromArr2: function(ar) {
    return mat4.create(ar[0][0],ar[0][1],ar[0][2],ar[0][3],
                       ar[1][0],ar[1][1],ar[1][2],ar[1][3],
                       ar[2][0],ar[2][1],ar[2][2],ar[2][3],
                       ar[3][0],ar[3][1],ar[3][2],ar[3][3]);
  },
  /*
  ###mat4.toLat
  Take matrix and return latex formatted string with optional type.
  Type is anything that fits foo in \begin{foo} and accepts row/column input.
  ie. pmatrix bmatrix etc.
  */
  toLat: function(A,type) {
    type = type || 'pmatrix';
    return '\\[\\begin{'+type+'}' +
           A.aa + ' & ' + A.ab + ' & ' + A.ac + ' & ' + A.ad + ' \\\\\n' + 
           A.ba + ' & ' + A.bb + ' & ' + A.bc + ' & ' + A.bd + ' \\\\\n' + 
           A.ca + ' & ' + A.cb + ' & ' + A.cc + ' & ' + A.cd + ' \\\\\n' + 
           A.da + ' & ' + A.db + ' & ' + A.dc + ' & ' + A.dd + ' \\end{'+type+'}\\]'; 
  }
};

/*
##mat
General purpose matrix functions.
Let's see if all that retardedness was worth it.
*/
mat = {
  cre: function(arr, h, w) {
    arr = arr || [];
    w = w || 1;
    h = h || arr.length || 1;
    var len = h*w;
      if (!(arr && arr.length === len)) {
        arr = [];
        arr.length = len;
      }
      var A = {h : h, w: w, arr: arr, len: len};
      return A;
  },
  sAr: function(A, arr, h, w) {
    var i;
    if (h) {
      w = w || 1;
    } else {
      h = arr.length;
      w = 1;
    }
    A.h = h;
    A.w = w;
    A.len = h*w;
    A.arr.length = A.len;

    for (i = 0,ii = A.len; i < ii; i++) {
      this.arr[i] = iArr[i];
    }
    return A;
  },
  set: function(A, dest) {
    var i, ii,
      arr,
      Aa = A.arr;
    dest = dest || {};
    dest.h = A.h;
    dest.w = A.w;
    arr = dest.arr || [];
    dest.arr = arr;
    ii = A.len;
    dest.len = ii;
    dest.arr.length = ii;
    for(i = 0; i < ii; i++) {
      arr[i] = Aa[i];
    }
    return dest;
  },
  add: function(A, B, dest) {
    var i,ii = A.len;
    if((ii === B.len) && (A.h === B.h)) {
      dest = dest || {};
      var Aa = A.arr,
          Ba = B.arr,
          arr = dest.arr || [];
      dest.arr = arr;
      dest.h = A.h;
      dest.w = A.w;
      for (i = 0; i < ii; i++) {
        arr[i] = Aa[i] + Ba[i];
      }
      return dest;
    } else {
      throw "Matrix dimensions mismatched.";
    }
  },
  sub: function(A, B, dest) {
    var i,ii = A.len;
    if((ii === B.len) && (A.h === B.h)) {
      dest = dest || {};
      var Aa = A.arr,
          Ba = B.arr,
          arr = dest.arr || [];
      dest.arr = arr;
      dest.h = A.h;
      dest.w = A.w;
      for (i = 0; i < ii; i++) {
        arr[i] = Aa[i] - Ba[i];
      }
      return dest;
    } else {
      throw "Matrix dimensions mismatched.";
    }
  },
  dot: function(A, B) {
    var i,
        ii = A.len,
        Aa = A.arr,
        Ba = B.arr,
        res = 0;
    if ((A.w === 1 || A.h === 1) && 
        ii === B.len) {
      for(i = 0; i < ii; i++){
        res += Aa[i]*Ba[i];
      }
      return res;
    } else {
      throw "Not a vector or lengths do not match";
    }
  },
  hDt: function(A, B) {
    var i,
        ii = A.len,
        Aa = A.arr,
        Ba = B.arr,
        res = 0;
    if ((A.w === 1 || A.h === 1) && 
        ii === B.len) {
      res -= Aa[0]*Ba[0];
      for(i = 1; i < ii; i++){
        res += Aa[i] * Ba[i];
      }
      return res;
    } else {
      throw "Not a vector or lengths do not match";
    }
  },
  sDt: function(A, B) {
    var i,
        ii = A.len,
        Aa = A.arr,
        Ba = B.arr,
        res = 0;
    if ((A.w === 1 || A.h === 1) && 
        ii === B.len) {
      for(i = 1; i < ii; i++){
        res += Aa[i] * Ba[i];
      }
      return res;
    } else {
      throw "Not a vector or lengths do not match";
    }
  },
  mag: function(A) {
    var i,ii = A.len, Aa = A.arr, res = 0;
    if(A.h === 1 || A.w === 1) {
      for (i = 0; i < ii; i++) {
        res += Aa[i] * Aa[i];
      }
      return res;
    } else {
      throw "Not a vector.";
    }
  },
  hMg: function(A) {
    var i,ii = A.len, Aa = A.arr, res = 0;
    if(A.h === 1 || A.w === 1) {
      res -= Aa[0] * Aa[0];
      for (i = 1; i < ii; i++) {
        res += Aa[i] * Aa[i];
      }
      return res;
    } else {
      throw "Not a vector.";
    }
  },
  nrm: function(A, dest) {
    dest = dest || {};
    var i,
        ii = A.len,
        Aa = A.arr,
        arr = dest.arr || [],
        mag = 0;
    arr.length = ii;
    dest.arr = arr;
    dest.h = A.h;
    dest.w = A.w;
    if(A.h === 1 || A.w === 1) {
      for (i = 0; i < ii; i++) {
        mag += Aa[i] * Aa[i];
      }
      mag = mag ? 1 / Math.sqrt(mag) : 0;
      for (i = 0; i < ii; i++) {
        arr[i] = Aa[i] * mag;
      }
      return dest;
    } else {
      throw "Not a vector.";
    }
  },
  hNm: function(A, dest) {
    dest = dest || {};
    var i,
        ii = A.len,
        Aa = A.arr,
        arr = dest.arr || [],
        mag = 0;
    arr.length = ii;
    dest.arr = arr;
    dest.h = A.h;
    dest.w = A.w;
    if(A.h === 1 || A.w === 1) {
      mag -= Aa[0] * Aa[0];
      for (i = 1; i < ii; i++) {
        mag += Aa[i] * Aa[i];
      }
      mag = mag ? 1 / Math.sqrt(Math.abs(mag)) : 1 / Aa[0];
      for (i = 0; i < ii; i++) {
        arr[i] = Aa[i] * mag;
      }
      return dest;
    } else {
      throw "Not a vector.";
    }
  },
  crs: function(A, B, dest) {
    if (A.len === 3 && B.len === 3 && A.h === B.h) {
      dest = dest || {};
      var arr = dest.arr || [],
          Aa = A.arr,
          Ba = B.arr;
      dest.h = A.h;
      dest.w = A.w;
      dest.len = 3;
      arr.length = 3;
      arr[0] = Aa[1] * Ba[2] - Aa[2] * Ba[1];
      arr[1] = - Aa[0] * Ba[2] + Aa[2] * Ba[0];
      arr[2] = Aa[0] * Ba[1] - Aa[1] * Ba[0];
      return dest;
    } else {
      throw "Not a 3-vector or mismatched dimensions.";
    }
  },
  /*
  ###mat.tri
  Psuedovector triple product of three 4-vectors.
  $$\begin{align}
  A\wedge B\wedge C =& (A\wedge B)\wedge C\\\\
  =&\left<AB\right>_2\wedge C\\\\
  =&\left<(A_te_t + A_xe_x + A_ye_y + A_ze_z)
     (B_te_t + B_xe_x + B_ye_y + B_ze_z)\right>_2\wedge C\\\\
  =& (A_tB_xe_te_x + A_tB_ye_te_y + A_tB_ze_te_z + 
      A_xB_te_xe_t + A_xB_ye_xe_y + A_xB_ze_xe_z + 
      A_yB_te_ye_t + A_yB_xe_ye_x + A_yB_ze_ye_z + 
      A_zB_te_ze_t + A_zB_xe_ze_x + A_zB_ye_ze_y)
  \end{align\*}$$
  */
  tri: function(A, B, C, dest) {
    dest = dest || {};
    if (A.len === 4 && 
        B.len === 4 &&
        C.len === 4 &&
        A.h === B.h &&
        B.h === C.h) {
      var arr = dest.arr || [],
          Aa = A.arr,
          Ba = B.arr,
          Ca = C.arr;
      dest.arr = arr;
      arr.length = 4;
      dest.len = 4;
      dest.h = A.h;
      dest.w = A.w;
      for(i = 0; i < 4; i++) {

        arr[i] =1 ;
      }
    }

  },
  mul: function(A, B, dest) {
    var kk = A.w;
    if (kk === B.h) {
      var i, j, k, c, t,
          h = A.h,
          w = B.w,
          len = h*w,
          Aa = A.arr,
          Ba = B.arr,
          arr;
      dest = dest || {};
      dest.h = h;
      dest.w = w;
      dest.len = len;
      arr = dest.arr || [];
      arr.length = len;
      dest.arr = arr;
      for (i = 0; i < h; i++) {
        c = i * h;
        for (j = 0; j < w; j++) {
          t = 0;
          for (k = 0; k < kk; k++) {
            t += Aa[c+k] * Ba[j+h*k];
          }
        arr[c+j] = t;
        }
      }
      return dest;
    } else {
      throw "Matrix dimensions do not match.";
    }
  }
};
window['vec3'] = vec3;
window['mat3'] = mat3;
