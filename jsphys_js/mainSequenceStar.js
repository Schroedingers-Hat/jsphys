function mainSequenceStar(X, P, label, options)
{
    if (typeof options.lum == "number") {
        var Lum = options.lum;
    } else {
        var Lum = 1;
    }

    this.label = label;
    //Aesthetic reasons only. 
    //If any 3D images are rendered Lum will be more useful
    this.r = Math.sqrt(Lum) * 10; 
    
    //Very rough approximation of main sequence lum/temp relation.
    //You can read this off of a HR diagram.
    this.temp = Math.pow(10, (3.45 + Lum / 10)); 
    this.stillColor = tempToColor(this.temp);

    this.COM = new inertialObject(X, P, 1);
}

mainSequenceStar.prototype.draw = function(scene)
{
    if (scene.showVisualPos)
    {
        this.COM.calcPast();
        this.drawPast(scene);
    }
    if (scene.showFramePos) this.drawNow(scene);
} 


mainSequenceStar.prototype.drawNow = function(scene)
{
    if(this.COM.X0[1] / scene.zoom < (scene.hwidth + 10) &&
       this.COM.X0[2] / scene.zoom < (scene.hheight + 10) &&
       this.COM.X0[1] / scene.zoom > (-scene.hwidth - 10) &&
       this.COM.X0[2] / scene.zoom > (-scene.hheight - 10)&&
       this.r / zoom > 0.3)
    {
        scene.g.fillStyle = "#0f0"; 
        scene.g.beginPath();
        scene.g.arc(this.COM.X0[1] / scene.zoom + scene.hwidth, 
              this.COM.X0[2] / scene.zoom + scene.hheight, 
              this.r / zoom, 0, twopi, true);
        scene.g.closePath();
        scene.g.fill();
        if (scene.displayTime) 
        {
            scene.g.fillText(Math.floor(this.COM.tau / timeScale / 1000)+ ", " + 
                       Math.floor(this.COM.X0[0] / timeScale /1000),
                       this.COM.X0[1] / scene.zoom + scene.hwidth + 10,
                       this.COM.X0[2] / scene.zoom + scene.hheight);
        }
    }
    if (this.label != "") {
        scene.g.fillText(this.label, this.COM.XView[1] / scene.zoom + scene.hwidth + (this.r / scene.zoom) + 10,
                         this.COM.XView[2] / scene.zoom + scene.hheight);
    }
}


mainSequenceStar.prototype.drawPast = function(scene)
{
    this.WVIS = (this.COM.XView[1]/scene.zoom);
    this.HVIS = (this.COM.XView[2]/scene.zoom);

    if(this.WVIS < (scene.hwidth + 10)  &&
       this.HVIS < (scene.hheight + 10) &&
       this.WVIS > (-scene.hwidth - 10) &&
       this.HVIS > (-scene.hheight - 10)&&
       this.r / scene.zoom > 0.3)
    {
        if(scene.showDoppler) scene.g.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                  this.COM.radialVPast,
                                                  this.COM.V[0]));
        else scene.gfillStyle = this.stillColor;
        scene.g.beginPath();
        scene.g.arc((this.WVIS + scene.hwidth), 
              (this.HVIS + scene.hheight), 
              (this.r / scene.zoom), 0, twopi, true);
        scene.g.closePath();
        scene.g.fill();
        
        if (scene.displayTime)
        {
            scene.g.fillText(Math.floor(
                  (this.COM.tau - (this.COM.viewTime)) / timeScale / 1000),
                   this.COM.XView[1] / scene.zoom + scene.hwidth + 10,
                   this.COM.XView[2] / scenezoom + scene.hheight);
        
        }
    }
    if (this.label != "") {
        scene.g.fillText(this.label, this.COM.XView[1] / scene.zoom + scene.hwidth + (this.r / scene.zoom) + 10,
                         this.COM.XView[2] / scene.zoom + scene.hheight);
    }
}
