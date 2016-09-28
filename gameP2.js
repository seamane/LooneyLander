var game = new Phaser.Game(1800, 1050, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    this.game.load.audio('bgm', 'assets/sounds/BGM.wav');
    //this.game.load.image('background', 'assets/background.png', 3843, 1080);
    this.game.load.spritesheet('bob', 'assets/BobSprite.png', 72, 72);
    this.game.load.spritesheet('ashley', 'assets/AshleySprite.png', 72, 72);
    this.game.load.spritesheet('ryan', 'assets/RyanSprite.png', 72, 72);
    this.game.load.spritesheet('player', 'assets/CharacterSpriteSheet.png', 60, 72);
    this.game.load.spritesheet('spaceship', 'assets/SpaceshipSpritesheet.png', 256, 256);
    //this.game.load.image('platform', 'assets/platform.png', 126, 12);
    this.game.load.image('fuel','assets/fuelCollectible.png',70,70);
    this.game.load.image('planet1', 'assets/Planet001.png', 864, 864);
    this.game.load.image('planet2', 'assets/Planet002.png', 432, 432);
    this.game.load.image('planet3', 'assets/Planet003.png', 648, 648);
    this.game.load.image('pressToStart', 'assets/PressToStart.png', 691, 100);
    this.game.load.image('nebula', 'assets/Nebula001.png', 1296, 1296);
    this.game.load.image('nebula2', 'assets/Nebula002.png', 1584, 1296);
    this.game.load.image('startScreen', 'assets/startScreen.png', 1800, 1080);
    this.game.load.image('gameoverScreen', 'assets/gameoverScreen.png', 1800, 1080);
    this.game.load.image('gameover', 'assets/game_over.png', 800, 146);
}

var GameState = {
    START:0,
    PLAY:1,
    END:2
}

var player = {
	sprite:null,
	numCollected:0,
	fuel:2500,
	startingFuel:2500,
	spaceBarAngle:0
};

var UIText = {
	fuel:null,
	velocityY:null,
	velocityX:null,
	time:null,
	numCollected:null,
	endOfGame:null,
	gameObjective:null,
	score:null
}
var pressToStart;
var bgm; //background music
var timeCheck;
var playerCollisionGroup;
var peopleCollisionGroup;
var planetCollisionGroup;
var fuelCollisionGroup;
var endPointCollisionGroup;

var spaceBarPressed = -3.0;
var startTime;

var starfield;//background
var cursors;//for arrow key input

var planets = [];
var acceptableLandingAngle = 40;//acceptable landing angle when landing on planet, in degrees
var maxLandingVelocitySquared = 40000;//equivalent to 200 velocity

var currGameState = GameState.START;

var stars = [];

var spaceship = {
	sprite:null,
	frame:0
}

var startScreen;
var gameoverScreen;
var gameoverText;

var objTextLoop;
var pressToStartLoop;
var gameoverTextLoop;

function create() {
    pressToStartLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.2, updateUIText, this);
    objTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.5, updateOBJText, this);
	
    game.world.setBounds(0, 0, 3843, 1080);
    bgm = game.add.audio('bgm');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.defaultRestitution = 0.8;
    game.physics.p2.gravity.y = 0;
	
    //  Turn on impact events for the world, without this we get no collision callbacks
    game.physics.p2.setImpactEvents(true)

    cursors = game.input.keyboard.createCursorKeys();

	playerCollisionGroup = game.physics.p2.createCollisionGroup();
	peopleCollisionGroup = game.physics.p2.createCollisionGroup();
	planetCollisionGroup = game.physics.p2.createCollisionGroup();
	fuelCollisionGroup = game.physics.p2.createCollisionGroup();
	endPointCollisionGroup = game.physics.p2.createCollisionGroup();

	game.sound.setDecodedCallback(bgm, start, this);
	game.physics.p2.updateBoundsCollisionGroup();
	
	//background sprites
	game.add.sprite(0,0,'nebula');
	game.add.sprite(1296,0,'nebula2');

	///Fuel//
	function createFuel()
	{
		var fuel = game.add.group();
		fuel.enableBody = true;
		fuel.physicsBodyType = Phaser.Physics.P2JS;
		///For 1st Planet///
		var fuelCollection = fuel.create(810, 370, 'fuel');
		fuelCollection.body.setRectangle(70,70);
		fuelCollection.body.setCollisionGroup(fuelCollisionGroup);
		fuelCollection.body.collides([playerCollisionGroup]);
		///For 1st TOP Planet///
		var fuelCollection = fuel.create(870, 140, 'fuel');
		fuelCollection.body.setRectangle(70,70);
		fuelCollection.body.rotation = -0.53;
		fuelCollection.body.setCollisionGroup(fuelCollisionGroup);
		fuelCollection.body.collides([playerCollisionGroup]);
		///For 2nd Bottom Planet///
		var fuelCollection = fuel.create(1500, 910, 'fuel');
		fuelCollection.body.setRectangle(70,70);
		fuelCollection.body.rotation = -0.53;
		fuelCollection.body.setCollisionGroup(fuelCollisionGroup);
		fuelCollection.body.collides([playerCollisionGroup]);
	}
	/////////
	/////People////
	function createPeople(){
	var people = game.add.group();
	people.enableBody = true;
    people.physicsBodyType = Phaser.Physics.P2JS;
	///For 1st Planet///
		var person = people.create(550, 630, 'bob');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 130;
 		person.body.collides([playerCollisionGroup]);
	///For 1st TOP Planet///
		var person = people.create(280, 130, 'ashley');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = -2.40;
		person.body.collides([playerCollisionGroup]);
	///For 2nd Planet-I///
		var person = people.create(1620, 130, 'bob');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = -0.78;
		person.body.collides([playerCollisionGroup]);
	///For 2nd Planet-II///
		var person = people.create(1750, 545, 'ryan');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 3.14;
		person.body.collides([playerCollisionGroup]);
	
	///For 2nd Planet-Bottom///
		var person = people.create(1800, 855, 'bob');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 0.43;
		person.body.collides([playerCollisionGroup]);
	}
	//////////////

	createEndpoint();
	//createStars();

	//init player
    player.sprite = game.add.sprite(50, 950, 'player');
    game.physics.p2.enable(player.sprite);
    game.camera.follow(player.sprite);
	player.sprite.body.setCollisionGroup(playerCollisionGroup);
	player.sprite.body.collides(planetCollisionGroup,hitPlanet,this);
	player.sprite.body.collides(peopleCollisionGroup,hitPerson,this);
	player.sprite.body.collides(fuelCollisionGroup,hitFuel,this);
	player.sprite.body.collides(endPointCollisionGroup,hitEndPoint,this);
	
	createPlanets();
	createFuel();
	createPeople();
	
	createUI();

    startTime = this.game.time.totalElapsedSeconds();
}

function start() {
    //bgm.loopFull(0.6);
}

function createStars() 
{
	for (var i = 0; i < 500; i++)
	{
		stars[i] = {
			x: Math.random() * game.world.width,
			y: Math.random() * game.world.height,
			radius: Math.sqrt(Math.random() * 2),
			alpha: 1.0,
			decreasing: true,
			dRatio: Math.random()*0.05
		}
	}
}

function createEndpoint()
{
	var endPointGroup = game.add.group();
	endPointGroup.enableBody = true;
	endPointGroup.physicsBodyType = Phaser.Physics.P2JS;
	
	spaceship.sprite = endPointGroup.create(3500, 500, 'spaceship');
	spaceship.sprite.body.setCircle(123);
	spaceship.sprite.body.setCollisionGroup(endPointCollisionGroup);
	spaceship.sprite.body.collides(playerCollisionGroup);
    spaceship.sprite.body.static = true;
    spaceship.sprite.body.allowGravity = false;
}

function createUI() {
	UIText.fuel = game.add.text(10, 10, "Fuel: " + player.fuel,  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.time = game.add.text(10, 30, "Elapsed time: 0",  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.velocityX = game.add.text(800, 10, "Horizontal Speed: " + (player.sprite.body.velocity.x),  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.velocityY = game.add.text(800, 30, "Vertical Speed: " + (player.sprite.body.velocity.y),  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.numCollected = game.add.text(800, 50, "Rescued: 0",  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.endOfGame = game.add.text(600, 500, "You won! END OF GAME SUCKER!!!!",  { font: "50px Tandysoft", fill: "#FFFFFF" });
	
	startScreen  = game.add.sprite(0,0,'startScreen');
	pressToStart = game.add.sprite(550, 900,'pressToStart');
	gameoverScreen = game.add.sprite(0,0,'gameoverScreen');
	gameoverText = game.add.sprite(450,100,'gameover');
	UIText.gameObjective = game.add.text(400, 500, "Rescue at least 1 person to clear the game!",  { font: "50px Tandysoft", fill: "#FFFFFF" });
	
	UIText.fuel.fixedToCamera = true;
	UIText.time.fixedToCamera = true;
	UIText.gameObjective.fixedToCamera = true;
	UIText.velocityX.fixedToCamera = true;
	UIText.velocityY.fixedToCamera = true;
	UIText.numCollected.fixedToCamera = true;
	UIText.endOfGame.fixedToCamera = true;
	UIText.endOfGame.visible = false;
	UIText.gameObjective.visible = false;
	pressToStart.visible = true;
	gameoverScreen.visible = false;
	gameoverScreen.fixedToCamera = true;
	gameoverText.visible = false;
	gameoverText.fixedToCamera = true;
}

function createPlanets()
{
	var planetsGroup = game.add.group();
	planetsGroup.enableBody = true;
	planetsGroup.physicsBodyType = Phaser.Physics.P2JS;
	
	var planet = new Object();
	planet.radius = 420;
	planet.gravitationalRadius = 600;
	planet.gravity = 400;
	planet.sprite = planetsGroup.create(600, -200, 'planet1');
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 400;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(30, 1200, 'planet2');
	planet.sprite.tint = 0xff00ff;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 400;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(1800, 300, 'planet2');
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 400;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(800, 600, 'planet2');
	planet.sprite.tint = 0xff0000;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.rotation = -Math.PI / 2.0;
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 420;
	planet.gravitationalRadius = 600;
	planet.gravity = 400;
	planet.sprite = planetsGroup.create(1700, 1300, 'planet1');
	planet.sprite.tint = 0x00ffff;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 330;
	planet.gravitationalRadius = 550;
	planet.gravity = 300;
	planet.sprite = planetsGroup.create(2700, 700, 'planet3');
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 600;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(3100, 50, 'planet2');
	planet.sprite.tint = 0x0ef0ff;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
}

function hitPlanet(body1,body2) {
	//  body1 is the space player (as it's the body that owns the callback)
    //  body2 is the body it impacted with, in this case our planet
    //  As body2 is a Phaser.Physics.P2.Body object, you access its own (the sprite) via the sprite property:
	
	//check if player landed on planet with his feet
	var upVectorRelativeToPlanet = new Phaser.Point(player.sprite.position.x - body2.sprite.position.x,player.sprite.position.y - body2.sprite.position.y);
	upVectorRelativeToPlanet = upVectorRelativeToPlanet.normalize();
	var playerUpVector = new Phaser.Point(Math.cos(player.sprite.rotation - (Math.PI / 2)), Math.sin(player.sprite.rotation - (Math.PI / 2))); 
	playerUpVector = playerUpVector.normalize();
	var landingAngle = Math.acos(upVectorRelativeToPlanet.dot(playerUpVector));
	landingAngle = Math.abs(landingAngle * 180.0 / Math.PI);//radians to degrees
	
	var playerVelocitySquared = (player.sprite.body.velocity.x * player.sprite.body.velocity.x + player.sprite.body.velocity.y * player.sprite.body.velocity.y)
	
	if(landingAngle > acceptableLandingAngle && playerVelocitySquared > maxLandingVelocitySquared) { 
		//|| (player.sprite.body.velocity.x * player.sprite.body.velocity.x + player.sprite.body.velocity.y * player.sprite.body.velocity.y) > maxLandingVelocitySquared) {
		//player loses a person they have collected
		if(player.numCollected > 0) {
			player.numCollected -= 1;
			throwPeople();
			//spawn that person(similar to sonic coins)
		}
	}
}

function hitEndPoint(body1,body2) {
	if(currGameState != GameState.END)
	{
		pressToStart = game.add.sprite(550, 900,'pressToStart');
		pressToStart.fixedToCamera = true;
		
		game.world.bringToTop(gameoverScreen);
		game.world.bringToTop(gameoverText);
		game.world.bringToTop(pressToStart);
		
		var playerScore = (1200 - (10 * Math.trunc(game.time.totalElapsedSeconds() - startTime)) + (500 * player.numCollected) + player.fuel);
		
		UIText.score = game.add.text(800, 700, playerScore,  { font: "100px Tandysoft", fill: "#FFFFFF" });
		UIText.score.fixedToCamera = true;
		
		gameoverScreen.visible = true;
		gameoverText.visible = true;
		pressToStart.visible = true;
		
		pressToStartLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.2, updateUIText, this);
		gameoverTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.8, updateGameOverText, this);
		
		player.fuel = player.startingFuel;
		
		currGameState = GameState.END;
	}
}

function hitPerson(body1,body2) {
	//  body1 is the space player (as it's the body that owns the callback)
    //  body2 is the body it impacted with, in this case our person
    //  As body2 is a Phaser.Physics.P2.Body object, you access its own (the sprite) via the sprite property:
	if(body2.sprite.alive) {
		body2.sprite.alive = false;
		body2.sprite.body = null;
		body2.sprite.destroy();
		player.numCollected += 1;
	}
}

function hitFuel(body1,body2) {
	//  body1 is the space player (as it's the body that owns the callback)
    //  body2 is the body it impacted with, in this case our panda
    //  As body2 is a Phaser.Physics.P2.Body object, you access its own (the sprite) via the sprite property:
	body2.sprite.body = null;
	body2.sprite.destroy();
	player.fuel += 100;
}

function updateUIText() {
    pressToStart.tint = Math.random() * 0xffffff;
}

function updateGameOverText() {
	gameoverText.visible = !gameoverText.visible;
}

function updateOBJText(){
	if(UIText.gameObjective.visible == false)
	{
		UIText.gameObjective.visible = true;
	}
	else
	{
		UIText.gameObjective.visible = false;
	}
}

function update() {
	if(currGameState == GameState.END)
	{
		if(cursors.down.isDown)
		{
			currGameState = GameState.START;
			UIText.endOfGame.visible = false;
			
			bgm.destroy();

			game.cache.removeSound('bgm');
			game.state.restart();
		}
		return;
	}
	else if(currGameState == GameState.START)
	{
		if(cursors.down.isDown && currGameState != GameState.END)
		{
			//timeCheck = game.time.now;
			currGameState = GameState.PLAY;
			pressToStart.destroy();
			pressToStart = null;
			//pressToStartLoop.destroy();
			//objTextLoop.destroy();
			game.time.events.remove(pressToStartLoop);
			game.time.events.remove(objTextLoop);
			UIText.gameObjective.visible = false;
			/*if(!UIText.gameObjective.visible)
			{
				UIText.gameObjective.visible = true;
				game.time.now - timeCheck > 5000
				UIText.gameObjective.visible = false;
			}*/
			startScreen.destroy();
			startScreen = null;
		}
		return;
	}
	
	if (player.fuel <= 0)
	{
		hitEndPoint(null,null);
	}

    if (cursors.left.isDown && currGameState != GameState.END)
    {
        player.sprite.body.rotateLeft(70);
    }
    else if (cursors.right.isDown && currGameState != GameState.END)
    {
        player.sprite.body.rotateRight(70);
    }
    else
    {
        player.sprite.body.setZeroRotation();
    }

    if (cursors.up.isDown)
    {
        player.sprite.body.thrust(100);
        player.sprite.frame = 1;
		player.fuel -= 1;
    }
	else if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.game.time.totalElapsedSeconds() - spaceBarPressed >= 0.1)
	{
    	spaceBarPressed = this.game.time.totalElapsedSeconds();
		player.spaceBarAngle = player.sprite.rotation - (Math.PI / 2);
		player.fuel -= 100;
	}
	else if(this.game.time.totalElapsedSeconds() - spaceBarPressed <= 0.1)
	{
		player.sprite.body.force.x = Math.cos(player.spaceBarAngle) * 4000;    // accelerateToObject 
		player.sprite.body.force.y = Math.sin(player.spaceBarAngle) * 4000;
        player.sprite.frame = 1;
	}
	else
	{
        player.sprite.frame = 0;
	}

    /*if (!game.camera.atLimit.x)
    {
        //starfield.tilePosition.x -= (player.sprite.body.velocity.x * game.time.physicsElapsed);
    }

    if (!game.camera.atLimit.y)
    {
        //starfield.tilePosition.y -= (player.sprite.body.velocity.y * game.time.physicsElapsed);
    }*/

	for(var i = 0; i < planets.length; ++i)
	{
		var vecToPlanet = new Phaser.Point(planets[i].sprite.position.x - player.sprite.x, planets[i].sprite.position.y - player.sprite.y);
		var distToPlanet = vecToPlanet.getMagnitude();
		if(distToPlanet < planets[i].gravitationalRadius)
		{
			var xDirection = vecToPlanet.x / distToPlanet;
			var yDirection = vecToPlanet.y / distToPlanet;
			var xForce = xDirection * planets[i].gravity;
			var yForce = yDirection * planets[i].gravity;
	
			player.sprite.body.force.x += xForce;
			player.sprite.body.force.y += yForce;
		}	
	}
	
	updateUI();
	
	spaceship.sprite.frame++;
	spaceship.sprite.frame = spaceship.sprite.frame % 7;
}

function updateUI()
{
	UIText.fuel.setText("Fuel: " + player.fuel);
	UIText.time.setText("Elapsed Seconds: " + Math.trunc(this.game.time.totalElapsedSeconds() - startTime));
	UIText.velocityX.setText("Horizontal Speed: " + (Math.trunc(player.sprite.body.velocity.x)));
	UIText.velocityY.setText("Vertical Speed: " + (Math.trunc(-player.sprite.body.velocity.y)));
	UIText.numCollected.setText("Rescued: " + player.numCollected);
	/*if(currGameState != GameState.END) {
		UIText.endOfGame.visible = false;
	}*/
}
function throwPeople()
{
	var throwablePeople = game.add.group();
	throwablePeople.enableBody = true;
    throwablePeople.physicsBodyType = Phaser.Physics.P2JS;
	var throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'bob');
//	throwPerson.sprite.body.force.x = Math.cos(throwPerson.spaceBarAngle) * 4000;    // accelerateToObject 
//	throwPerson.sprite.body.force.y = Math.sin(throwPerson.spaceBarAngle) * 4000;

}
function drawStars()
{
	game.context.save();
	game.context.fillStyle = "#111"
	game.context.fillRect(0, 0, game.world.width, game.world.height);
	for (var i = 0; i < stars.length; i++)
	{
		var star = stars[i];
		game.context.beginPath();
		game.context.arc(star.x, star.y, star.radius, 0, 2*Math.PI);
		game.context.closePath();
		game.context.fillStyle = "rgba(255, 255, 255, " + star.alpha + ")";
		if (star.decreasing == true)
		{
			star.alpha -= star.dRatio;
			if (star.alpha < 0.1)
			{ 
				star.decreasing = false; 
			}
		}
		else
		{
			star.alpha += star.dRatio;
			if (star.alpha > 0.95)
			{ 
				star.decreasing = true;
			}
		}
		game.context.fill();
	}
	game.context.restore();
}

