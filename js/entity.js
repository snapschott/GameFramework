"use strict";

var app = app || {};

app.Entity = function(){

	var Entity = function(x,y,radius,col,mass,type){
		this.type = type;
		this.col = col;
		this.radius = radius;
		this.location = vec2.fromValues(x,y);
		this.velocity = vec2.create();
		this.acceleration = vec2.create();
		this.movementSpeed = mass;

		this.controller = null;

		this.removeCondition = null;
	};

	var p = Entity.prototype;

	p.getLocation = function(){
		return this.location;
	}

	p.getRadius = function(){
		return this.radius;
	}

	p.setController = function(controller){
		this.controller = controller;
		this.controller.init();
	};

	p.setRemoveCondition = function(removeCondition){
		this.removeCondition = removeCondition;
	};

	p.canRemove = function(){
		if (this.removeCondition !== null) {
			return this.removeCondition();
		} else
			return false;
	}

	p.update = function(dt){
		if(this.controller !== null){
			this.controller.update(this);
		}

		switch(this.type) {
			case 'moveable' :
				var speed = this.movementSpeed * dt;

				if((this.location[0] + this.radius) >= 400){
					this.velocity[0] *= -speed;
					this.location[0] = 400 - this.radius;
				}
				if((this.location[0] - this.radius) <= 0){
					this.velocity[0] *= -speed;
					this.location[0] = 0 + this.radius;
				}
				if((this.location[1] + this.radius) > 480){
					this.velocity[1] *= -speed;
					this.location[1] = 480 - this.radius;
				}
				if((this.location[1] - this.radius) <= 0){
					this.velocity[1] *= -speed;
					this.location[1] = 0 + this.radius;
				}

				updateLocation(this.velocity,this.acceleration,this.location);
				this.acceleration = vec2.create();

				break;
			case 'stationary' :
				break;

		}

	};

	p.render = function(ctx){
		app.draw.polygon(ctx,this.location[0],this.location[1],this.radius,8,this.col);
	};

	p.applyWorldForces = function(wolrdForces){
		for(var i = 0; i < wolrdForces.length; i ++){
			applyForce(wolrdForces[i], this.acceleration);
		}
	};

	p.applyForce = function(force){
		applyForce(force, this.acceleration);
	};

	return Entity;

}();
