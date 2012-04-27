$(document).ready(function(){
  /* Generate a bunch of test data.
     */
  var vec3s = [],
      vec4s = [],
      mat3s = [],
      mat4s = [],
      i,
      I4 = mat3.create(1,0,0,0,
                       0,1,0,0,
                       0,0,1,0,
                       0,0,0,1),
      I3 = mat3.create(1,0,0,
                       0,1,0,
                       0,0,1),
      tol64 = Math.pow(2,-50),
      tol32 = Math.pow(2,-23),
      numTrials = 10;
  module('vec3');

  test("Creation", function(){
    for( i = 0; i < numTrials; i++) {
        var x = Math.exp(Math.random())*1e9,
            y = Math.exp(Math.random())*1e9,
            z = Math.exp(Math.random())*1e9;
        deepEqual({x: x, y: y, z: z},vec3s[i] = vec3.create(x,y,z));
        notDeepEqual({x: x, y: y, z: z, ex: 0},vec3s[i] = vec3.create(x,y,z));
        notDeepEqual({misnamed: x, y: y, z: z},vec3s[i] = vec3.create(x,y,z));
    }
  });
  test("Set", function(){
    var pVec = {x:0, y:0, z:0};
    for( i = 0; i < numTrials; i++) {
        var x = Math.exp(Math.random())*1e9,
            y = Math.exp(Math.random())*1e9,
            z = Math.exp(Math.random())*1e9,
            X = [x,y,z];

        deepEqual({x: x, y: y, z: z},
          vec3s[i] = vec3.set(x,y,z,{}),
          'Set to new object');
        deepEqual({x: x, y: y, z: z},
          vec3.set(x,y,z,vec3s[i]),
          'Set to existing object');
        deepEqual({x: x, y: y, z: z},
          vec3s[i] = vec3.setArr(X,{}),
          'Set from array to new');
        deepEqual({x: x, y: y, z: z},
          vec3.setArr(X,vec3s[i]),
          'Set from array to existing');
        deepEqual(pVec,
          vec3.setVec(pVec,vec3s[i]),
          'Set from vec3');
        pVec = vec3s[i];
    }
  });
/*Binary operations between 3 - vectors.
  It seems we accumulate error a bit faster than I expected.
  Seems to be up to 3 bits of error on firefox on pairs of vector operations.
  This is still quite tolerable. I'm not sure if it's the js sqrt 
  implementation being a bit lax or something more general 
  (ie. IEEE standards for these operations)
   */
test('Binary operators', function() {

  for( i = 0; i < numTrials; i++) {
    var x1 = Math.exp(Math.random())*1e9,
        y1 = Math.exp(Math.random())*1e9,
        z1 = Math.exp(Math.random())*1e9,
        x2 = Math.exp(Math.random())*1e9,
        y2 = Math.exp(Math.random())*1e9,
        z2 = Math.exp(Math.random())*1e9,
        X1 = vec3.create(x1,y1,z1),
        X2 = vec3.create(x2,y2,z2),
        A,B,C,D,a,b;
    A = vec3.norm(X1,{});
    B = vec3.norm(X2,{});
    C = vec3.cross(X1,X2,{});
    D = vec3.cross(A,B,{});
    a = vec3.dot(A,A);
    // Normalized vectors should have magnitude 1.
    ok(Math.abs(1 - a) < tol64, 'Magnitude was: ' + a);
    ok(Math.abs(1 - a) < tol32, 'Magnitude was: ' + a);
    b = vec3.dot(D,D);
    // Cross products of normalized vectors have mag<1
    ok(b <= 1);
    // Cross products are orthogonal.
    a = vec3.dot(A,D);
    ok(a < tol32, 'Magnitude was: ' + a);
    ok(a < tol64, 'Magnitude was: ' + a);
    a = vec3.dot(B,D);
    ok(a < tol32, 'Magnitude was: ' + a);
    ok(a < tol64, 'Magnitude was: ' + a);
  }
        
});
test('TolerantCMP', function() {
  var i;
  for(i = 0; i < numTrials; i++) {
    var x1 = Math.exp(Math.random())*1e9,
        y1 = Math.exp(Math.random())*1e9,
        z1 = Math.exp(Math.random())*1e9,
        x2 = Math.exp(Math.random())*1e9,
        y2 = Math.exp(Math.random())*1e9,
        z2 = Math.exp(Math.random())*1e9,
        X1 = vec3.create(x1,y1,z1),
        X2 = vec3.create(x2,y2,z2),
        A,B,C,D,a,b;
    A = vec3.norm(X1,{});
    B = vec3.norm(X2,{});
    C = vec3.norm(vec3.cross(X1,X2,{}),{});
    D = vec3.norm(vec3.cross(A,B,{}),{});
    ok(vec3.tCmp(C,D));
  }
});
module('mat3');
function rn() {
  return Math.exp(Math.random())*1e9;
}

test('Creation',function(){
  var i;
  for (i = 0; i < numTrials; i++) {
    var aa = rn(), ab = rn(), ac = rn(),
        ca = rn(), bb = rn(), bc = rn(),
        ba = rn(), cb = rn(), cc = rn();
    deepEqual(mat3.create(aa,ab,ac,
                          ba,bb,bc,
                          ca,cb,cc),
              {aa: aa, ab: ab, ac: ac,
               ba: ba, bb: bb, bc: bc,
               ca: ca, cb: cb, cc: cc},
              'Created matrix is itself');
    notDeepEqual(mat3.create(aa,ab,ac,
                             ba,bb,bc,
                             ca,cb,cc),
                  {aa: aa, ab: ab, ac: ac,
                   ba: ba, bb: bb, bc: bc,
                   ca: ca, cb: cb, cc: cc, extra: 0},
                  'Created matrix is not something different');
  }
});
function crMat3() {
    return mat3.create(rn(),rn(),rn(),
                       rn(),rn(),rn(),
                       rn(),rn(),rn());
}
function rni() {
  return (Math.exp(Math.random()) * 1e4) | 0;
}
function crMati3() {
    return mat3.create(rni(),rni(),rni(),
                       rni(),rni(),rni(),
                       rni(),rni(),rni());
}
test('Identity', function() {
  var i;
  for (i = 0; i < numTrials; i++ ) {
  var A = crMat3(), B = {};
  deepEqual(A, mat3.mul(A, I3, B),
    'Right multiply by identity does not change matrix');
  deepEqual(A, mat3.mul(I3, A, B),
    'Left multiply by identity does not change matrix');
  }
});
test('Multiply integral matrix by known', function() {
  factorA = crMati3(); // Replace with known factors
  factorB = crMati3();
  knownResult = crMati3();
  deepEqual(mat3.mul(factorA,factorB,{}),knownResult);
});
test('CMP', function() {
  ok(mat3.tCmp(A,B,{}));
});
test('TolerantCMP', function() {
  ok(mat3.tCmp(A,B,{}));
});
test('Determinants', function() {
  var i;
  for (i = 0; i < numTrials; i++) {
  var A = crMati3(),
      B = crMati3(),
      C = crMat3(),
      D = crMat3(),
      c,d,CD,DC,cd,
      a,b,AB,BA,ab,
      known = crMati3(),  // Replace with known mat and its det.
      knowndet = 1;
  a = mat3.det(A);
  b = mat3.det(B);
  ab = a*b;
  AB = mat3.mul(A,B,{});
  BA = mat3.mul(B,A,{});
  equal(ab, mat3.det(AB), '|A||B| = |AB|');
  equal(ab, mat3.det(BA), '|A||B| = |BA|');
  c = mat3.det(C);
  d = mat3.det(D);
  cd = c*d;
  CD = mat3.mul(C,D,{});
  DC = mat3.mul(D,C,{});
  ok(Math.abs(cd - mat3.det(CD)) < tol64, '|C||D| = |CD|');
  ok(Math.abs(cd - mat3.det(DC)) < tol64, '|C||D| = |DC|');
  ok(Math.abs(cd - mat3.det(CD)) < tol32, '|C||D| = |CD|');
  ok(Math.abs(cd - mat3.det(DC)) < tol32, '|C||D| = |DC|');
  equal(knowndet, mat3.det(known), '|A| = |A|');
  }
});
test('Trace', function() {
  // Bascially the above, but with trace.
  ok(0, 'Not even written yet.');
});
});
