function mainSequenceStar(X, P, Lum)
{
    //Aesthetic reasons only. 
    //If any 3D images are rendered Lum will be more useful
    this.r = Math.sqrt(Lum) * 10; 
    
    //Very rough approximation of main sequence lum/temp relation.
    //You can read this off of a HR diagram.
    this.temp = Math.pow(10, (3.45 + Lum / 10)); 

    this.COM = new inertialObject(X, P, 1);
}

mainSequenceStar.prototype.draw = function()
{
    if (showVisualPos)
    {
        this.COM.calcPast();
        this.drawPast();
    }
    if (showFramePos) this.drawNow();
} 


mainSequenceStar.prototype.drawNow = function()
{
    if(this.COM.X0[1]/zoom < (HWIDTH + 10) &&
       this.COM.X0[2]/zoom < (HHEIGHT + 10) &&
       this.COM.X0[1]/zoom > (-HWIDTH - 10) &&
       this.COM.X0[2]/zoom > (-HHEIGHT - 10)&&
       this.r / zoom > 0.3)
    {
        g.fillStyle = "#0f0"; 
        g.beginPath();
        g.arc(this.COM.X0[1] / zoom + HWIDTH, 
              this.COM.X0[2] / zoom + HHEIGHT, 
              this.r / zoom, 0, twopi, true);
        g.closePath();
        g.fill();
        if (displayTime) 
        {
            g.fillText(Math.floor(this.COM.tau / timeScale / 1000)+ ", " + 
                       Math.floor(this.COM.X0[0] / timeScale /1000),
                       this.COM.X0[1] / zoom + HWIDTH + 10,
                       this.COM.X0[2] / zoom + HHEIGHT);
        }
     }
}


mainSequenceStar.prototype.drawPast = function()
{
    if(this.COM.XView[1]/zoom < (HWIDTH + 10)  &&
       this.COM.XView[2]/zoom < (HHEIGHT + 10) &&
       this.COM.XView[1]/zoom > (-HWIDTH - 10) &&
       this.COM.XView[2]/zoom > (-HHEIGHT - 10)&&
       this.r / zoom > 0.3)
    {
        if(showDoppler) g.fillStyle = tempToColor(dopplerShiftColor(this.temp, 
                                                  this.COM.radialVPast,
                                                  this.COM.V[0]));
        else g.fillStyle = tempToColor(this.temp);
        g.beginPath();
        g.arc(this.COM.XView[1] / zoom + HWIDTH, 
              this.COM.XView[2] / zoom + HHEIGHT, 
              this.r / zoom, 0, twopi, true);
        g.closePath();
        g.fill();
        
        if (displayTime)
        {
            g.fillText(Math.floor(
                  (this.COM.tau - (this.COM.viewTime)) / timeScale / 1000),
                   this.COM.XView[1] / zoom + HWIDTH + 10,
                   this.COM.XView[2] / zoom + HHEIGHT);
        
        }
    }     
    
}
