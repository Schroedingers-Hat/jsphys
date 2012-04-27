var notes = [0,0,3,3,
             5,3,3,
             5,0,3,5,
             8,7,6,
             6,5,2,3,
             4,2,2,3,
             4,0,2,4,
             7,6,5,7,
             8,0,1,1,
             8,6,4,
             5,3,1,
             4,5,6,
           3,5,1,1,
             8,6,4,
             5,3,1,
             4,5,4,3,2,
             1,0];
var lengths = [2,2,1,1,
               3,1,2,
               2,2,1,1,
               2,3,1,
               2,2,1,1,
               2,2,1,1,
               2,2,1,1,
               1,1,2,2,
               2,2,1,1,
               4,1,1,
               4,1,1,
               2,2,2,
               0.5,3.5,1,1,
               4,1,1,
               4,1,1,
               1.6,0.25,0.25,1.9,2,
               5, 1];
var tlength = 0;
for(var i = 0; i < lengths.length; i++) {
    tlength += lengths[i];
}
var key = [0,0.5, 1.5, 2.5, 3, 4, 5, 6, 6.5,
                    7.5, 8.5, 9,10,11,12,12.5,
                   13.5,14.5,15,16,17,18,19.5
              ];
var dR = [1,0,0,1,0,0,0,1,1];
function loop(){
dR[7] = dR[7] + Math.pow(Math.random()-0.4,6)*10;
var sR = ((Math.pow(Math.random()-0.5,2))*dR[7])*3 + 1;
var rat = Math.pow(2, 2/12/sR);
var freq = 0;
var data = [];
data.length = tlength * 2e3 * 10;
var k = 0;
for(var j = 0; j < lengths.length; j++){
  var lR = (Math.random() + 0.5)* dR[5],
      kR = 2*Math.floor(Math.abs(Math.sin(Math.random() + dR[4]))),
      fR = Math.random() * dR[2] * 10 + dR[3],
      pR = Math.exp(-10*Math.random()) * 2e4;
      pL = Math.exp(-40*Math.random()) * 2e4 * dR[1];
  dR[0] = dR[0] + (Math.random()-0.49999)*0.1;
  dR[1] = dR[1] + (Math.random()-0.4999);
  dR[2] = dR[2] + (Math.random()-0.499)*0.01;
  dR[3] = Math.max(dR[3] + (Math.random()-0.4999)*0.001,0);
  dR[4] = dR[4] + (Math.random()+0.6)*0.1;
//  dR[5] = dR[5] + (Math.random()-0.49)*2;
  dR[6] = dR[6] + (Math.random()-0.499)*1000;
  var noteLen = lengths[j] * 2e3;

  plPause(pL);
  if (notes[j]){
    freq = Math.pow(rat, key[notes[j] + kR]) * 110 / 8000 * 2 * Math.PI;
  plNote(noteLen + pR, freq*fR);
  } else
  {
    plPause(noteLen);
  }
data.length = k;
}
function plNote(len, Kk) {
    for (var i=0; i<len; i++) {
        data[k++] = Math.round(
                    Math.exp(
                   -Math.pow((2e3/3)-i,2)/1e7)*100*
                    Math.abs(0.4*Math.sin(5*Kk*i)+
                             0.8*Math.sin(4*Kk*i)+
                             0.5*Math.sin(3*Kk*i)+
                             0.4*Math.sin(2*Kk*i)+
                             0.9*Math.sin(Kk*i)+
                             0.05*Math.sin(0.5*Kk*i)));
    }
}
function plPause(len){
    for(var i = 0; i < len; i++){data[k++] = 0;}
}
(function() {
var wave = new RIFFWAVE(data);
var audio = new Audio(wave.dataURI);
audio.play();
})();
if(Math.floor(Math.random()*1000)){setTimeout(loop, Math.pow(Math.random(),8)*30000 + k/8);}
}
loop();
