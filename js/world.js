"use strict";

var app = app || {};

app.World = function(){

	var World = function(forces){
		this.type = "world";

		this.forces = forces;

    	this.entities = [];

		this.updateFunction = null;
		this.backgroundSprite = undefined;
		this.currentState = 0;
	};

	var p = World.prototype;

    p.getGravity = function(){
        return this.gravity;
    };

    p.getForces = function(){
    	return this.forces;
    };

    p.addForce = function(force){
    	this.forces.push(force);
    };

		p.setUpdateFunction = function(updateFunction){
			this.updateFunction = updateFunction;
		};

		p.setBackgroundSprite = function(sprite){
		this.backgroundSprite = sprite;
	};

		p.doUpdateFunction = function(){
			if (this.updateFunction !== null) {
				return this.updateFunction();
			}
		};

    p.addEntity = function(entity){
				entity.addUpdateListener(this);
        this.entities.push(entity);
    };

		p.updateEntityHandler = function(e) {
			console.log(e.entity);
		};

    p.getEntity = function(i){
        return this.entities[i];
    };

    p.numEntities = function(){
        return this.entities.length;
    };

		p.doUpdateEntityEvent = function(entity){
				console.log(entity);
		};

    p.update = function(dt){
    	for(var i = this.entities.length - 1; i >= 0; i--)
		{
			var entity = this.entities[i];

			entity.applyWorldForces(this.forces);

			if(entity.canRemove()){
				this.entities.splice(i, 1);
				continue;
			}
			entity.update(dt);
		}
    };

    p.render = function(ctx){
			if (this.backgroundSprite !== undefined) {
				this.backgroundSprite.render(ctx, vec2.fromValues(this.worldBounds.width / 2, this.worldBounds.height / 2));
			}
			for(var i = 0; i < this.entities.length; i++)
			{
				this.entities[i].render(ctx);
			}
    };

		p.getPossibleCollidingObjects = function(entity){
		var possibleCollisions = [];

		var range_x = Math.abs(entity.getWidth() * 3);
		var range_y = Math.abs(entity.getHeight() * 3);

		if(range_x != 0 || range_y != 0){
			for(var i = 0; i < this.entities.length; i++)
			{
				var _entity = this.entities[i];

				if(_entity === entity){
					continue;
				}

				if((_entity.getLocation()[0] <= entity.getLocation()[0] + range_x &&
						_entity.getLocation()[0] >= entity.getLocation()[0] - range_x) &&
						(_entity.getLocation()[1] <= entity.getLocation()[1] + range_y &&
						_entity.getLocation()[1] >= entity.getLocation()[1] - range_y))
				{
					possibleCollisions.push(_entity);
				}
			}
		}
		return possibleCollisions;
	}

    p.circleCollision = function(loc1, loc2, radius1, radius2){
		var dx = loc1[0] - loc2[0];
		var dy = loc1[1] - loc2[1];
		var distance = Math.sqrt(dx*dx + dy*dy);
		return distance < radius1 + radius2;
	};

	p.lineCollision = function(entityLoc, entityRadius, linePoint1, linePoint2){
		var ptX = entityLoc[0];
		var ptY = entityLoc[1];
		//console.log(rope.anchor1.location[0]);
		var p1X = linePoint1[0];
		var p2X = linePoint1[0];
		var p1Y = linePoint2[1];
		var p2Y = linePoint2[1];

		var dx = p2X - p1X;
		var dy = p2Y - p1Y;

		//if it's a point rather than a segment
		if((dx == 0) && (dy == 0)){
			var closest = {x: p1X, y: p1Y};
			dx = ptX - p1X;
			dy = ptY - p1Y;
			return Math.sqrt(dx * dx + dy * dy);
		}

		//calculate the t that minimizes the distance
		var t = ((ptX - p1X) * dx + (ptY - p1Y) * dy) / (dx * dx + dy * dy);

		//see if this represents one of the segment's end points or a point in the middle.
		if(t < 0){
			var closest = {x: p1X, y: p1Y};
			dx = ptX - p1X;
			dy = ptY - p1Y;
		} else if(t > 1){
			var closest = {x: p2X, y: p2Y};
			dx = ptX - p2X;
			dy = ptY - p2Y;
		} else {
			var closest = {x: p1X + t * dx, y: p1Y + t * dy};
			dx = ptX - closest.x;
			dy = ptY - closest.y;
		}

		var leastDistance = Math.sqrt(dx * dx + dy * dy);

		return leastDistance < entityRadius;
	};

	return World;

}();
