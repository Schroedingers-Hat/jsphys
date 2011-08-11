function mainSequenceStar(X, P, label, options)
{
    this.options = options;

    if (typeof this.options.lum !== "number") {
        this.options.lum = 1;
    }

    this.label = label;
    //Aesthetic reasons only. 
    //If any 3D images are rendered Lum will be more useful
    this.r = Math.sqrt(this.options.lum) * 10; 
    
    //Very rough approximation of main sequence lum/temp relation.
    //You can read this off of a HR diagram.
    this.temp = Math.pow(10, (3.45 + this.options.lum / 10)); 
    this.stillColor = tempToColor(this.temp);

    this.COM = new inertialObject(X, P, 1);
}

mainSequenceStar.prototype.draw = function(scene)
{
    if (this.options.showVisualPos)
    {
        this.COM.calcPast();
        this.drawPast(scene);
    }
    if (this.options.showFramePos || scene.options.showFramePos) this.drawNow(scene);
} 


mainSequenceStar.prototype.drawNow = function(scene)
{
    // current visible locations on the <canvas> element
    var xvis = this.COM.X0[1] / scene.zoom;
    var yvis = this.COM.X0[2] / scene.zoom;

    if(xvis < (scene.width - scene.origin[0] + 10)   &&
       yvis < (scene.height - scene.origin[1] + 10)  &&
       xvis > (-scene.origin[0] - 10)  &&
       yvis > (-scene.origin[1] - 10) &&
       this.r / scene.zoom > 0.3)
    {
        scene.g.fillStyle = "rgba(0, 256, 0, 0.5)"; 
        scene.g.beginPath();
        scene.g.arc(xvis + scene.origin[0], 
              yvis + scene.origin[1], 
              this.r / scene.zoom, 0, twopi, true);
        scene.g.closePath();
        scene.g.fill();
        if (this.options.showTime) 
        {
            scene.g.fillText(Math.floor(this.COM.tau / scene.timeScale / 1000)+ ", " + 
                       Math.floor(this.COM.X0[0] / scene.timeScale /1000),
                       xvis + scene.origin[0] + 10,
                       yvis + scene.origin[1]);
        }

        if (this.label != "") {
            scene.g.fillText(this.label, xvis + scene.origin[0] + (this.r / scene.zoom) + 10,
                             yvis + scene.origin[1]);
        }

        if (this.options.showVelocities) {
            scene.g.fillText("v = " + (Math.round(1000 *Math.sqrt(1-1/Math.pow(this.COM.V[0], 2)) / c)/1000) + "c", xvis + scene.origin[0],
                             yvis + scene.origin[1] + (this.r / scene.zoom) + 10);
        }
        if (this.options.showGamma) {
            scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[0])) / 1000, xvis + scene.origin[0],
                             yvis + scene.origin[1] - (this.r / scene.zoom) - 10)
        }
    }
}


mainSequenceStar.prototype.drawPast = function(scene)
{
    // current visible locations on the <canvas> element
    var xvis = (this.COM.XView[1] / scene.zoom);
    var yvis = (this.COM.XView[2] / scene.zoom);

    if(xvis < (scene.width - scene.origin[0] + 10)   &&
       yvis < (scene.height - scene.origin[1] + 10)  &&
       xvis > (-scene.origin[0] - 10)  &&
       yvis > (-scene.origin[1] - 10) &&
       this.r / scene.zoom > 0.3)
    {
        if(this.options.showDoppler || scene.options.showDoppler) {
            scene.g.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                              this.COM.radialVPast,
                                                              this.COM.V[0]));
        }
        else scene.g.fillStyle = this.stillColor;
        scene.g.beginPath();
        scene.g.arc((xvis + scene.origin[0]), 
              (yvis + scene.origin[1]), 
              (this.r / scene.zoom), 0, twopi, true);
        scene.g.closePath();
        scene.g.fill();
        
        if (this.options.showTime)
        {
            scene.g.fillText(Math.floor(
                  (this.COM.tau - (this.COM.viewTime)) / scene.timeScale / 1000),
                   xvis + scene.origin[0] + 10,
                   yvis + scene.origin[1]);
        
        }

        if (this.label != "") {
            scene.g.fillText(this.label, xvis + scene.origin[0] + (this.r / scene.zoom) + 10,
                             yvis + scene.origin[1]);
        }

        if (this.options.showVelocities) {
            scene.g.fillText("v = " + (Math.round(1000 *Math.sqrt(1-1/Math.pow(this.COM.V[0], 2)) / c)/1000) + "c", xvis + scene.origin[0],
                             yvis + scene.origin[1] + (this.r / scene.zoom) + 10);
        }
        if (this.options.showGamma) {
            scene.g.fillText("γ = " + (Math.round(1000 * this.COM.V[0])) / 1000, xvis + scene.origin[0],
                             yvis + scene.origin[1] - (this.r / scene.zoom) - 10)
        }
    }
}
