// Ruler, measures and displays distance between things.
// Pass it one or two objects, an offset [x,y], and (optional)
// The indeces of vertices you want it to attach to.
// Make sure it is updated after the objects it is attached to.
// TODO: Look into map()?

function ruler(objects, offset, vertices)
{
    this.mDispl = quat4.create([0,0,0,0]);
    this.mDisplBoosted = quat4.create([0,0,0,0]);
    this.distances = [];
    this.intervalSq = 0;
    this.endPoints = [quat4.create([0,0,0,0]),quat4.create([0,0,0,0])];
    this.renderPoints = [quat4.create([0,0,0,0]),quat4.create([0,0,0,0])];
    this.times = [];
    if (objects.length == 1)
    {
        this.pos[0] = objects[0].COM.X0; //NB: Reference, don't go changing it
        if (vertices)
        {
            this.endDispl = [objects[0].shapePoints[vertices[0]], objects[0].shapePoints[vertices[1]]];
        }
        this.velocities[0] = objects[0].COM.V;
    }
    else if (objects.length == 2)
    {
        this.endDispl = [objects[0].shapePoints[vertices[0]], objects[1].shapePoints[vertices[1]]];
        this.pos = [objects[0].COM.X0,objects[1].COM.X0];
        this.velocities = [objects[0].COM.V,objects[1].COM.V];
    }
}


ruler.prototype.update = function()
{

        if (this.pos.length == 1)
        {
            quat4.subtract(this.endDispl[0],this.endDispl[1], this.mDispl);
            this.boostMats = cBoostMat(this.velocities[0]);
        }
        else if(this.pos.length == 2)
        {
            quat4.subtract(
                quat4.add(this.pos[0], this.endDispl[0], this.endPoints[0]),
                quat4.add(this.pos[1], this.endDispl[1], this.endPoints[1]),
                this.mDispl);
                this.boostMats = [cBoostMat(this.velocities[0]), cBoostMat(this.velocities[1])];
        }
        this.distances[0] = Math.sqrt(quat4.spaceDot(this.mDispl,this.mDispl));
        this.times[0] = this.mDispl[0];
        mat4.multiplyVec4(this.boostMats[0],this.mDispl,this.mDisplBoosted);
        this.distances[1] = Math.sqrt(quat4.spaceDot(this.mDisplBoosted,this.mDisplBoosted));
        this.times[1]= this.mDisplBoosted[0];
        if (this.boostMats.length == 2)
        {
            mat4.multiplyVec4(this.boostMats[1],this.mDispl,this.mDisplBoosted);
            this.distances[2] = Math.sqrt(quat4.spaceDot(this.mDisplBoosted,this.mDisplBoosted));
            this.times[2]= this.mDisplBoosted[0];
        }
        this.intervalSq = quat4.spaceTimeDot(this.mDisplBoosted,this.mDisplBoosted);
}        

ruler.prototype.draw = function(scene)
{
        this.renderPoints = [
            [this.endPoints[0][1] / scene.zoom + scene.origin[0],
             this.endPoints[0][2] / scene.zoom + scene.origin[1]],
            [this.endPoints[1][1] / scene.zoom + scene.origin[0],
             this.endPoints[1][2] / scene.zoom + scene.origin[1]]]
//    if( 1 || (this.renderPoints[0][0] < (scene.width  - scene.origin[0]) &&
//         this.renderPoints[0][1] < (scene.height - scene.origin[1]) &&
//         this.renderPoints[0][0] > (-scene.origin[0]) &&
//         this.renderPoints[0][1] > (-scene.origin[1])) ||
//        (this.renderPoints[0][0] < (scene.width  - scene.origin[0]) &&
//         this.renderPoints[0][1] < (scene.height - scene.origin[1]) &&
//         this.renderPoints[0][0] > (-scene.origin[0]) &&
//         this.renderPoints[0][1] > (-scene.origin[1])))
//    {
        scene.g.fillstyle = "rgba(0, 255, 0, 0.5)";
        scene.g.beginPath();
        scene.g.moveTo(this.renderPoints[0][0],this.renderPoints[0][1]);
        scene.g.lineTo(this.renderPoints[1][0],this.renderPoints[1][1]);
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
//    }
}
