var game = new Phaser.Game(1800, 1080, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    this.game.load.audio('bgm', 'assets/sounds/BGM.wav');
    this.game.load.image('background', 'assets/background.png', 3843, 1080);
    this.game.load.image('bob', 'assets/BobSprite.png', 72, 72);
    this.game.load.image('planet2', 'assets/Planet002.png', 432, 432);
    this.game.load.spritesheet('player', 'assets/CharacterSpriteSheet.png', 60, 72);
    this.game.load.image('platform', 'assets/platform.png', 126, 12);
    this.game.load.image('fuel','assets/fuelCollectible.png',64,64);
    this.game.load.image('planet1', 'assets/Planet001.png', 864, 864);
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
	numCollected:null
}
var bgm;

var playerCollisionGroup;
var peopleCollisionGroup;
var planetCollisionGroup;
var fuelCollisionGroup;

var spaceBarPressed = -3.0;
var startTime;

var starfield;//background
var cursors;//for arrow key input

var planets = [];
var acceptableLandingAngle = 30;//acceptable landing angle when landing on planet, in degrees
var maxLandingVelocitySquared = 10000;//equivalent to 100 velocity

function create() {
    game.world.setBounds(0, 0, 3843, 1080);
    bgm = game.add.audio('bgm');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.defaultRestitution = 0.8;
    game.physics.p2.gravity.y = 0;
	
    //  Turn on impact events for the world, without this we get no collision callbacks
    game.physics.p2.setImpactEvents(true)

    //starfield = game.add.tileSprite(0, 0, 1800, 1080, 'background');
    //starfield.fixedToCamera = true;

    cursors = game.input.keyboard.createCursorKeys();
	

	playerCollisionGroup = game.physics.p2.createCollisionGroup();
	peopleCollisionGroup = game.physics.p2.createCollisionGroup();
	planetCollisionGroup = game.physics.p2.createCollisionGroup();
	fuelCollisionGroup = game.physics.p2.createCollisionGroup();

	game.sound.setDecodedCallback(bgm, start, this);
	game.physics.p2.updateBoundsCollisionGroup();

	///Fuel//
	function createFuel()
	{
		var fuel = game.add.group();
		fuel.enableBody = true;
		fuel.physicsBodyType = Phaser.Physics.P2JS;
		///For 1st Planet///
		var fuelCollection = fuel.create(810, 360, 'fuel');
		fuelCollection.body.setRectangle(64,64);
		fuelCollection.body.setCollisionGroup(fuelCollisionGroup);
		fuelCollection.body.collides([playerCollisionGroup]);
		///For 1st TOP Planet///
		var fuelCollection = fuel.create(870, 160, 'fuel');
		fuelCollection.body.setRectangle(64,64);
		fuelCollection.body.rotation = -0.53;
		fuelCollection.body.setCollisionGroup(fuelCollisionGroup);
		fuelCollection.body.collides([playerCollisionGroup]);
		///For 2nd Bottom Planet///
		var fuelCollection = fuel.create(1500, 900, 'fuel');
		fuelCollection.body.setRectangle(64,64);
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
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 130;
 		person.body.collides([playerCollisionGroup]);
	///For 1st TOP Planet///
		var person = people.create(280, 130, 'bob');
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 130;
		person.body.collides([playerCollisionGroup]);
	///For 2nd Planet-I///
		var person = people.create(1620, 130, 'bob');
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = -0.78;
		person.body.collides([playerCollisionGroup]);
	///For 2nd Planet-II///
		var person = people.create(1750, 545, 'bob');
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 3.14;
		person.body.collides([playerCollisionGroup]);
	
	///For 2nd Planet-Bottom///
		var person = people.create(1800, 855, 'bob');
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 0.43;
		person.body.collides([playerCollisionGroup]);
	}
	//////////////



/*	var people = game.add.group();
	people.enableBody = true;
    people.physicsBodyType = Phaser.Physics.P2JS;
	for (var i = 0; i < 4; i++)
    {
		var person = people.create(game.world.randomX, game.world.randomY, 'bob');
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.collides([playerCollisionGroup,planetCollisionGroup]);
	}
*/
	//init player
    player.sprite = game.add.sprite(50, 950, 'player');
    game.physics.p2.enable(player.sprite);
    game.camera.follow(player.sprite);
	player.sprite.body.setCollisionGroup(playerCollisionGroup);
	player.sprite.body.collides(planetCollisionGroup,hitPlanet,this);
	player.sprite.body.collides(peopleCollisionGroup,hitPerson,this);
	player.sprite.body.collides(fuelCollisionGroup,hitFuel,this);
	
	createPlanets();
	createFuel(playerCollisionGroup);
	createPeople(playerCollisionGroup, planetCollisionGroup);
	
	//create text for UI
	UIText.fuel = game.add.text(10, 10, "Fuel: " + player.fuel,  { font: "20px Arial", fill: "#FFFFFF" });
	UIText.time = game.add.text(10, 30, "Elapsed time: 0",  { font: "20px Arial", fill: "#FFFFFF" });
	UIText.velocityX = game.add.text(800, 10, "Horizontal Speed: " + (player.sprite.body.velocity.x),  { font: "20px Arial", fill: "#FFFFFF" });
	UIText.velocityY = game.add.text(800, 30, "Vertical Speed: " + (player.sprite.body.velocity.y),  { font: "20px Arial", fill: "#FFFFFF" });
	UIText.numCollected = game.add.text(800, 50, "Rescued: 0",  { font: "20px Arial", fill: "#FFFFFF" });
	UIText.fuel.fixedToCamera = true;
	UIText.time.fixedToCamera = true;
	UIText.velocityX.fixedToCamera = true;
	UIText.velocityY.fixedToCamera = true;
	UIText.numCollected.fixedToCamera = true;
	
    //load PressToStart UI
   // pressTostartSprite = game.add.sprite(525, 850, 'pressToStart');
   // pressTostartSprite.tint = 0xff00ff;

    startTime = this.game.time.totalElapsedSeconds();
}
function start() {
    bgm.loopFull(0.6);
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
	planet.gravity = 400;
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
	planet.gravity = 400;
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
	planet.gravity = 400;
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
			
			//spawn that person(similar to sonic coins)
		}
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

function update() {

    if (cursors.left.isDown)
    {
        player.sprite.body.rotateLeft(70);
    }
    else if (cursors.right.isDown)
    {
        player.sprite.body.rotateRight(70);
    }
    else
    {
        player.sprite.body.setZeroRotation();
    }

	//will get rid of this
    if (cursors.up.isDown)
    {
        player.sprite.body.thrust(100);
        player.sprite.frame = 1;
		player.fuel -= 1;
    }
	else if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
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

    if (!game.camera.atLimit.x)
    {
        //starfield.tilePosition.x -= (player.sprite.body.velocity.x * game.time.physicsElapsed);
    }

    if (!game.camera.atLimit.y)
    {
        //starfield.tilePosition.y -= (player.sprite.body.velocity.y * game.time.physicsElapsed);
    }

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
}

function updateUI() {
	  UIText.fuel.setText("Fuel: " + player.fuel);
	  UIText.time.setText("Elapsed Seconds: " + Math.trunc(this.game.time.totalElapsedSeconds() - startTime));
	  UIText.velocityX.setText("Horizontal Speed: " + (Math.trunc(player.sprite.body.velocity.x)));
	  UIText.velocityY.setText("Vertical Speed: " + (Math.trunc(-player.sprite.body.velocity.y)));
	  UIText.numCollected.setText("Rescued: " + player.numCollected);
}