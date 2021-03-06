"use strict";

var app = app || {};

app.Main = {

	canvas : undefined,
	ctx : undefined,

	loadedForces : undefined,
	world : undefined,
	bounds : undefined,
	gameObject : undefined,
	menu : undefined,

	//var used for finding dt
	updatedTime : 0,
	ratio : undefined,

	init : function(){

		/*** Assign the canvas and the canvas context ***/
		this.ratio = 400/400;
		this.canvas = document.querySelector('canvas');
		this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = (window.innerHeight * this.ratio) + 'px';
		this.ctx = this.canvas.getContext('2d');

		/*** Set up the game object which holds game logic and states. ***/
		this.bounds = {width : this.canvas.width, height: this.canvas.height};
		this.gameObject = new app.GameObject();
		this.gameObject.setCurrentState(this.gameObject.states.PLAY);

		/*** Set up a generic keyboard controller to handle customizable inputs ***/
		var keyboardController = new app.KeyboardController();
		keyboardController.assignKeyAction(["r"], function(gameObject)
		{
			if(gameObject.getCurrentState() === gameObject.states.PLAY)
			{
				gameObject.setCurrentState("PAUSE");
			}
			else if(gameObject.getCurrentState() === gameObject.states.PAUSE)
			{
				gameObject.setCurrentState("PLAY");
			}
		}, true);
		keyboardController.assignKeyAction(["m"], function(gameObject)
		{
			if(gameObject.getCurrentState() === gameObject.states.PLAY)
			{
				gameObject.setCurrentState("MENU");
			}
			else if(gameObject.getCurrentState() === gameObject.states.MENU)
			{
				gameObject.setCurrentState("PLAY");
			}
		}, true);
		this.gameObject.setController(keyboardController);

		/*** Initialize menu ***/
		this.menu = new app.Menu("main", vec2.fromValues(this.bounds.width / 2, this.bounds.height / 2));
		this.menu.setBackgroundSprite(new app.Sprite('menuBackground.jpg', [0, 0], [1440, 785], [this.bounds.width, this.bounds.height], 0, [0]));
		this.menu.addText({
			"text" : "Press \"m\" to Play",
			"xPos" : (this.bounds.width * 3 / 10),
			"yPos" : (this.bounds.height * 5 / 6),
			"size" : "50",
			"col" : app.draw.randomRGBA(100)
		});
		this.gameObject.setMenu(this.menu);

		/*** Initialize world and its conditions ***/
		this.loadedForces = [vec2.fromValues(0,0)];
		this.world = new app.World(this.loadedForces);
		var bounds = this.bounds;
		this.world.setUpdateFunction(function(){
		});

		var entityPlayer = new app.PlayerEntity(this.bounds["width"] / 2, this.bounds["height"] / 2, 20, 'rgba(255,0,0,1)', 0, "moveable");

		/*** Create a keyboard controller to handle player actions ***/
		var keyboardController = new app.KeyboardController();
		keyboardController.assignKeyAction([ "a", "ArrowLeft" ], function(entity)
		{
			entity.moveLeft([vec2.fromValues(-1.5, 0)]);
		});
		keyboardController.assignKeyAction([ "d", "ArrowRight" ], function(entity)
		{
			entity.moveRight([vec2.fromValues(1.5, 0)]);
		});
		keyboardController.assignKeyUpAction([ "a", "ArrowLeft", "d", "ArrowRight" ], function(entity)
		{
			entity.stopRightLeft();
		});
		keyboardController.assignKeyAction([ "w", "ArrowUp" ], function(entity)
		{
			entity.moveUp([vec2.fromValues(0, -1.5)]);
		});
		keyboardController.assignKeyAction([ "s", "ArrowDown"], function (entity)
		{
			entity.moveDown([vec2.fromValues(0, 1.5)]);
		});
		keyboardController.assignKeyUpAction([ "w", "ArrowUp", "s", "ArrowDown"], function (entity)
		{
			entity.stopUpDown();
		})
		entityPlayer.assignBounds(0, this.bounds["width"], this.bounds["height"], 0);
		entityPlayer.setController(keyboardController);
		entityPlayer.setRemoveCondition(function(){return false;});

		/*** Finish setting the world and game object ***/
		this.world.addEntity(entityPlayer);
		this.gameObject.setWorld(this.world);

		//call the game loop to start the game
		this.gameLoop();
	},

	//loops the game
	gameLoop : function(){
		//calls this method every frame
		requestAnimationFrame(this.gameLoop.bind(this));
    	this.update();
    	this.render(this.ctx);
	},

	//renders all objects in the game
	render : function(ctx){
		app.draw.rect(ctx,0,0,this.canvas.width,this.canvas.height,"#eee");
		this.gameObject.render(ctx);
	},

	//updates the objects in the game
	update : function(){
		//find deltaTime
		var dt  = this.calculateDeltaTime();
		this.gameObject.update(dt);
	},

	//calculate delta time to maintain a frame rate
	calculateDeltaTime : function(){
		var now, fps;
		now = (+new Date);
		fps = 1000/(now - this.updatedTime);
		fps = this.clamp(fps,12,60);
		this.updatedTime = now;
		return 1/fps;
	},

	//helper function to stop values from exceeding bounds
	clamp : function(val,min,max){
		return Math.max(min,Math.min(max,val));
	}

};
