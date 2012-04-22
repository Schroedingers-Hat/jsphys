$(document).ready(function(){

test('Identity',function(){
  deepEqual(mat4.create(1,2,3,4,
                        5,6,7,8,
                        9,1,2,3,
                        4,5,6,7),
            mat4.mul(mat4.create(1,0,0,0,
                        0,1,0,0,
                        0,0,1,0,
                        0,0,0,1),
                     mat4.create(1,2,3,4,
                                 5,6,7,8,
                                 9,1,2,3,
                                 4,5,6,7),{}),
'Matrix multiplied by identity is itself');
});
});
