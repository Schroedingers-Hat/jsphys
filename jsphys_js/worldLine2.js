/*

getClosest
cycle through until t=0 is found
return null if not found
getClostestToCone : return index closest to future/past light cone

interpolateTo*
take two indices and evolve between them, producing x/v/tau etc

evolveLast: evolve the last point, copy/push if past save interval

evolve(index, time): evolve the point stored at index by time, store results in
temp


discardOldValues : pop/shift anything that's too old

shiftToPresent, shift the whole history by a time to synch it ready for a frame shift


*/



