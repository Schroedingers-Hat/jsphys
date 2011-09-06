// Ruler, measures and displays distance between things.
// Pass it one or two objects, an offset [x,y]
// The indeces of vertices you want it to attach to.
// Make sure it is updated after the objects it is attached to.
// TODO: Look into map()?

function ruler(objects, offset, vertices)
{
    this.offset = offset;
    this.mDispl = quat4.create([0,0,0,0]);
    this.mDisplBoosted = [quat4.create([0,0,0,0]),quat4.create([0,0,0,0])];
    this.distances = [];
    this.intervalSq = 0;
    this.endPoints = [quat4.create([0,0,0,0]),quat4.create([0,0,0,0])];
    this.boostedPoints = [[quat4.create([0,0,0,0]), quat4.create([0,0,0,0])],[quat4.create([0,0,0,0]),quat4.create([0,0,0,0])]];
    this.times = [];
    if (objects.length == 1)
    {
        this.velocities[0] = objects[0].COM.V;
        this.pos[0] = objects[0].COM.X0; //NB: Reference, don't go changing it
        if (vertices)
        {
            this.endPoints = [objects[0].pointPos[vertices[0]], objects[0].pointPos[vertices[1]]];
        }
    }
    else if (objects.length == 2)
    {
        this.endPoints = [objects[0].pointPos[vertices[0]], objects[0].pointPos[vertices[1]]];
        this.velocities = [objects[0].COM.V,objects[1].COM.V];
    }
}


ruler.prototype.update = function()
{
        if (this.velocities.length == 1)
        {
            this.boostMats = [cBoostMat(this.velocities[0],c)];
        }
        else if (this.velocities.length == 2)
        {
            this.boostMats = [cBoostMat(this.velocities[0],c), cBoostMat(this.velocities[1],c)];
            mat4.multiplyVec4(this.boostMats[1],this.mDispl,this.mDisplBoosted[1]);
        }
        quat4.subtract(this.endPoints[0],this.endPoints[1], this.mDispl);
        mat4.multiplyVec4(this.boostMats[0],this.mDispl,this.mDisplBoosted[0]);
        this.distances[0] = Math.sqrt(quat4.spaceDot(this.mDispl,this.mDispl));
        this.times[0] = this.mDispl[0];
        this.distances[1] = Math.sqrt(quat4.spaceDot(this.mDisplBoosted[0],this.mDisplBoosted[0]));
        this.times[1] = this.mDisplBoosted[0][3] / c;
        if (this.velocities.length == 2)
        {
            this.distances[2] = Math.sqrt(quat4.spaceDot(this.mDisplBoosted[1],this.mDisplBoosted[1]));
            this.times[2] = this.mDisplBoosted[1][3] / c;
        }

}        

ruler.prototype.draw = function(scene)
{
        this.renderPoints = [
            [this.endPoints[0][0] / scene.zoom + scene.origin[0],
             this.endPoints[0][1] / scene.zoom + scene.origin[1]],
            [this.endPoints[1][0] / scene.zoom + scene.origin[0],
             this.endPoints[1][1] / scene.zoom + scene.origin[1]]]
    if( (this.renderPoints[0][0] < (scene.width) &&
         this.renderPoints[0][1] < (scene.height) &&
         this.renderPoints[0][0] > (-scene.width) &&
         this.renderPoints[0][1] > (-scene.height)) ||
        (this.renderPoints[1][0] < (scene.width) &&
         this.renderPoints[1][1] < (scene.height) &&
         this.renderPoints[1][0] > (-scene.width) &&
         this.renderPoints[1][1] > (-scene.height)))
    {
        scene.g.fillstyle = "rgba(0, 255, 0, 0.5)";
        scene.g.beginPath();
        scene.g.moveTo(this.renderPoints[0][0] + this.offset[0],this.renderPoints[0][1] + this.offset[1]);
        scene.g.lineTo(this.renderPoints[1][0] + this.offset[0],this.renderPoints[1][1] + this.offset[1]);
        // Put code to make a pretty picture here. Use 1, this.velocities[0][0] and this.velocties[1][0]
        // to scale tick marks.
        scene.g.closePath();
        scene.g.stroke();
        scene.g.fillText("Your frame Distance:" + Math.floor(0.5 + this.distances[0]), 
                         this.renderPoints[0][0], this.renderPoints[0][1] + 20);
        scene.g.fillText("This object Distance: " + Math.floor(0.5 + this.distances[1]) + 
                          "Time: " + Math.floor(0.5 + this.times[1]), 
                         this.renderPoints[0][0], this.renderPoints[0][1] + 30);
        if(this.renderPoints[1])
        {
        scene.g.fillText("This object Distance: " + Math.floor(0.5 + this.distances[2]) + 
                          "Time: " + Math.floor(0.5 + this.times[2]), 
                         this.renderPoints[1][0], this.renderPoints[1][1] + 10);
        }
    }
}
