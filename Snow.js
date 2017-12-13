import common from './common';

class Snow {

    constructor (options) {

        // globals
        this.canvas;
        this.ctx;
        this.W;
        this.H;
        this.mf = 100; //max particles
        this.flakes = [];
        this.angle = 0;

        this.speed = (common.isMobile()) ? 8 : 4;

        this.snowActive = true;
        this.animationComplete = true;
        this.deactivationTimerHandler;
        this.reactivationTimerHandler;
        this.animationHandler;

        this.init(options.stopElId, options.startElId, options.toggleElId);

        this.draw = this.draw.bind(this);
        this.toggle = this.toggle.bind(this);
        this.initializeButtons = this.initializeButtons.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    init(stopElId, startElId, toggleElId) {
        this.setGlobals();
        this.initializeButtons(stopElId, startElId, toggleElId);
        this.initializeSnow();

        $(window).resize(function () {
            this.W = window.innerWidth;
            this.H = window.innerHeight;
            this.canvas.width = this.W;
            this.canvas.height = this.H;
        });
    }

    initializeButtons(stopElId, startElId, toggleElId) {
      var self = this;

      if (stopElId) {
          $('#' + stopElId).click(self.DeactivateConfetti.bind(self));
      }
      if (startElId) {
          $('#' + startElId).click(self.restart.bind(self));
      }
      if (toggleElId) {
          $('#' + toggleElId).click(self.toggle.bind(self));
      }
    }

    setGlobals() {
      this.canvas = document.getElementById("snowStage");
      this.ctx = this.canvas.getContext("2d");
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      this.canvas.width = this.W;
      this.canvas.height = this.H;
    }

    initializeSnow() {
      this.flakes = [];
      this.animationComplete = false;
      for (var i = 0; i < this.mf; i++) {
        this.flakes.push({
    			x: Math.random()*this.W, //set width of flake to random nr between 0 and 1 * width of screen
    			y: Math.random()*this.H, //set height of flake to random nr between 0 and 1 * height of screen
    			r: Math.random()*5+2, //set radius between 2 and 5
    			d: Math.random() + 1
    		})
      }
      this.startDrawing();
    }

    draw() {
      this.ctx.clearRect(0, 0, this.W, this.H);
  		this.ctx.fillStyle = "White";
  		this.ctx.beginPath();
  		for(var i = 0; i < this.mf; i++){
  			var f = this.flakes[i];
  			this.ctx.moveTo(f.x, f.y);
  			this.ctx.arc(f.x, f.y, f.r, 0, Math.PI*2, true);
  		}
  		this.ctx.fill();

  		this.Update();
    }

    Update() {
        var remainingFlakes = 0;
        var particle;
        this.angle += 0.01;

        for (var i = 0; i < this.mf; i++) {
            particle = this.flakes[i];
            if (this.animationComplete) return;

            if (!this.snowActive && particle.y < -15) {
                particle.y = this.H + 100;
                continue;
            }

            this.stepParticle(particle, i);

            if (particle.y <= this.H) {
              remainingFlakes++;
            }
            this.checkForReposition(particle, i);
        }

        if (remainingFlakes === 0) {
            this.stop();
        }
    }

    checkForReposition(particle, index) {
        if ((particle.x > this.W + 20 || particle.x < -20 || particle.y > this.H) && this.snowActive) {
            if (index % 5 > 0 || index % 2 == 0) //66.67% of the flakes
            {
              this.repositionParticle(particle, Math.random() * this.W, -10, Math.floor(Math.random() * 10) - 10);
            } else {
                if (Math.sin(this.angle) > 0) {
                  //Enter from the left
                  this.repositionParticle(particle, -5, Math.random() * this.H, Math.floor(Math.random() * 10) - 10);
                } else {
                  //Enter from the right
                  this.repositionParticle(particle, this.W + 5, Math.random() * this.H, Math.floor(Math.random() * 10) - 10);
                }
            }
        }
    }
    stepParticle(particle, particleIndex) {
    	particle.y += Math.pow(particle.d, 2) + 1;
    	particle.x += Math.cos(this.angle)*2;
    }

    repositionParticle(particle, xCoordinate, yCoordinate) {
      particle.x = xCoordinate;
      particle.y = yCoordinate;
    }

    moveFlakes(){
    	var remainingFlakes = 0;
  		this.angle += 0.01;

  		for(var i = 0; i < this.mf; i++){
  			if (this.animationComplete) return;

  			var f = this.flakes[i];
  			f.y += Math.pow(f.d, 2) + 1;
  			f.x += Math.cos(this.angle)*2;
  			
  			if(f.y > this.H){
  				this.flakes[i] = {x: Math.random()*this.W, y: 0, r: f.r, d: f.d};
  			} else {
  				remainingFlakes++;
  			}
  		}

  		if (remainingFlakes === 0) {
  		  this.stop();
  		}
  	}

    startDrawing() {
      var self = this;
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      this.canvas.width = this.W;
      this.canvas.height = this.H;
      (function animloop() {
          if (self.animationComplete) return null;
          self.animationHandler = requestAnimFrame(animloop);
          return self.draw();
      })();
    }

    clearTimers() {
      clearTimeout(this.reactivationTimerHandler);
      clearTimeout(this.animationHandler);
    }

    toggle() {
      if (this.snowActive) {
          this.deactivate();
      } else {
          this.restart();
      }
    }

    deactivate() {
      this.snowActive = false;
      this.clearTimers();
    }

    stop() {
      this.animationComplete = true;
      if (this.ctx == undefined) return;
      this.ctx.clearRect(0, 0, this.W, this.H);
    }

    restart() {
        this.clearTimers();
        this.stop();
        this.reactivationTimerHandler = setTimeout( () => {
            this.snowActive = true;
            this.animationComplete = false;
            this.initializeSnow();
        }, 100);
    }

    destroy() {
      this.clearTimers();
      this.animationComplete = true;
    }

}

export default Snow;