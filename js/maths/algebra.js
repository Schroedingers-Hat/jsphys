function stringSimp(mstring,timeschar,pluschar) {
  var splitString = mstring.split(pluschar),
      i;
  for(i in splitString) {
    if (splitString.hasOwnProperty(i)) {
      if(splitString[i].split(' ').indexOf('0') >= 0) {
        splitString[i] = '0';
      }
    }
  }
  return '\\[\\begin{smallmatrix}' + splitString.join('+');
}
