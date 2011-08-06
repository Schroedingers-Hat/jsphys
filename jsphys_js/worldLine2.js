/*

getMeas
cycle through until t=0 is found
return null if not found
getVIew : return index closest to future/past light cone

interpolateTo*
take two indices and evolve between them, producing x/v/tau etc

evolveLast: evolve the last point, copy/push if past save interval

evolve(index, time): evolve the point stored at index by time
store results in temp


discardOldValues : pop/shift anything that's too old

shiftToPresent, shift the whole history by a time to synch it ready for a 
frame shift


*/


function worldLine(X, P, m, maxDistance, savePrecision, maxTimeStep)
{
    this.init()
    {
        this.X0 = X;
        // Make sure this is actually acting like a real particle.
        // It would be simpler just to take a momentum and work out mass from
        // That, but this is a bit more robust.
        genEnergy(P, c, m);
        this.V  = quat4.scale(P, 1/m);

        this.Xmeas = quat4.create();
        this.Vmeas = quat4.create();
        this.TauMeas = 0;

        this.XView = quat4.create();
        this.VView = quat4.create();
        this.TauView = 0;

        this.VTemp   = quat4.create();
        this.XTemp   = quat4.create();
        this.XTemp2  = quat4.create();
        this.tauTemp = 0;

        this.displaceFwd = quat4.create();
        this.displaceBwd = quat4.create();
        this.BwdTime = 0;

        this.events = new Array();
        this.velocities = new Array();
        this.properTimes = new Array();

        this.properTimes.push(0);
        //Not sure if the create is needed here.
        this.events.push(quat4.create(this.X));
        this.velocities.push(quat4.create(this.V));

        this.timeSinceShift = 0;
    }
    this.init();
}


// First order taylor interpolation from ev[i] to ev[i_2], at time after ev[i].
// Will not give sensible results if ev[i][0]+time is after ev[i_2][0].

// NB: Could be worthwhile adding a second taylor term to this. 
// Would then deal v/ well with accelerating objects. (although not rapid changes
// in acceleration.
worldLine.prototype.interpolate = function(index, index2, time)
{
    //Time from events[i_2]. Is normally negative, so use add, not subtract.
    this.BwdTime = time + (this.events[index][0] - this.events[index2][0]);

    // Calculate forwards position, multiplied by weight.
    this.XTemp  = quat4.add(this.velocities[index],
                            quat4.scale(this.events[index],
                                        1 / time, tempVec3), this.XTemp);
    // Calculate backwards position, multiplied by weight.
    this.XTemp2 = quat4.add(this.velocities[index2],
                            quat4.scale(this.events[index2],
                                        1 / BwdTime, tempVec3), this.XTemp2);
    // Add and divide by total weight.
    this.XTemp = quat4.scale(quat4.add(this.XTemp, this.XTemp2), 
                             1 / (1/time + 1/BwdTime), this.XTemp);
    // Same for tau.
    this.tauTemp = ( (this.properTimes[index] / time) +
                     (this.properTimes[index2] / BwdTime) )
                   / (1/time + 1/BwdTime);
    // TODO: make this a weighted average between v[i] and v[i_2].
    this.VTemp = this.velocities[index]; 
    return [this.XTemp, this.VTemp, this.tauTemp];
}

// evolve, evolves the point in index by time, storing results in
// XTemp/tauTemp
// Only linear motion or manually edited velocities for now.
// Should handle arbitrary evolution of V/X without modification of
// anything outside this function.
worldline.prototype.evolvePoint = function(time, index)
{
    this.XTemp   = this.events[index];
    this.VTemp   = this.velocities[index];
    this.XTemp   = quat4.add(this.XTemp,
                          quat4.scale(this.VTemp, time / this.velocities[index][0],
                                      tempVec3));
    this.tauTemp = time / Math.pow(this.VTemp[0],2) + this.properTimes[index];
    return [this.XTemp, this.VTemp, this.tauTemp];
}



/*
 *   Original logic for interpolate without weights, 
 *   as weighted average is a bit counter-intuitive.
 *   // Displacements
 *   this.displaceFwd = quat4.scale(this.velocities[index],
 *                                  time, this.displaceFwd);
 *   this.displaceBwd = quat4.scale(this.velocities[index2],
 *                                  BwdTime, this.displaceBwd);
 *   //Fwd Pos.
 *   this.XTemp  = quat4.scale(
 *       quat4.add(this.events[index],     this.displaceFwd, tempVec3), time);
 *   // Bwd Pos.
 *   this.XTemp2 = quat4.scale(
 *       quat4.add(this.events[index2], this.displaceBwd, tempVec3), time);
 *   // Average.
 *   this.XTemp = quat4.scale(quat4.add(this.XTemp,this.XTemp2),1/2,this.XTemp);
*/

