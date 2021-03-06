var game = new Phaser.Game(1800, 1050, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    this.game.load.audio('bgm', 'assets/sounds/BGM.wav');
    this.game.load.audio('pick', 'assets/sounds/pickup.wav');
    this.game.load.audio('throw', 'assets/sounds/throw.wav');
    this.game.load.audio('jet', 'assets/sounds/jetpack.wav');
    this.game.load.audio('pickupf', 'assets/sounds/pickupfuel.mp3');
    this.game.load.audio('wjet', 'assets/sounds/weakjet.wav'); //weak jet
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
	this.game.load.image('pressToReplay', 'assets/PressToReplay.png', 691, 100);    
    this.game.load.image('nebula', 'assets/Nebula001.png', 1296, 1296);
    this.game.load.image('nebula2', 'assets/Nebula002.png', 1584, 1296);
    this.game.load.image('startScreen', 'assets/startScreen.png', 1800, 1080);
    this.game.load.image('gameoverScreen', 'assets/gameoverScreen.jpg', 1800, 1080);
    this.game.load.image('gameoverBack', 'assets/gameover_bg.png', 1800, 1080);
    this.game.load.image('gameover', 'assets/game_over.png', 800, 146);
    this.game.load.image('congrats', 'assets/congrats.png', 800, 146);
    this.game.load.image('fuelbar', 'assets/fuelbar.png', 156, 29);
    this.game.load.image('clock', 'assets/Clock.png', 48, 48);
    this.game.load.image('lifeIcon', 'assets/Life_Icon.png', 48, 48);
    this.game.load.image('UIFuel', 'assets/Fuel_Icon.png', 48, 48);
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
	gameWarning:null,
	score:null,
	peopleSaved:null,
	fuelSaved:null,
	timeSpent:null
}
var pressToStart;
var pressToReplay;
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
var maxLandingVelocitySquared = 122500;//equivalent to 350 velocity

var currGameState = GameState.START;

var spaceship = {
	sprite:null,
	frame:0
}

var startScreen;
var gameoverScreen;
var loseScreen;
var gameoverText;
var winText;

var objTextLoop;
var pressToStartLoop;
var pressToReplayLoop;
var gameoverTextLoop;
var winTextLoop;


var throwList = [];

var fuelbar = {
	image:null,
	originalWidth:0
}


///TESTING GRADIENTS FOR PLANET ATMOSPHERES

var bmd;
var innerCircle;
var outerCircle;


//////////////////////////
////SFX//////
var jet;
var pick;
var throwS;
var wjet; //weak jet
var pickf; //fuel



function create() {
	pressToStartLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.2, updateUIText, this);
	pressToReplayLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.2, updateUILText, this);
    objTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.5, updateOBJText, this);
	
    game.world.setBounds(0, 0, 3843, 1080);
    bgm = game.add.audio('bgm');
    jet = game.add.audio('jet');
	pick = game.add.audio('pick');
	throwS = game.add.audio('throw');
	wjet = game.add.audio('wjet');
	pickf = game.add.audio('pickupf');

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
	throwPeopleCollisionGroup = game.physics.p2.createCollisionGroup();

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
		///For 3rd Bottom Planet///
		var fuelCollection = fuel.create(2510, 405, 'fuel');
		fuelCollection.body.setRectangle(70,70);
		fuelCollection.body.rotation = -0.68;
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
	///For 3rd Planet-I///
		var person = people.create(2350, 800, 'ryan');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = -2.00;
		person.body.collides([playerCollisionGroup]);
	///For 3rd Planet///
		var person = people.create(3050, 600, 'ashley');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 1.2;
		person.body.collides([playerCollisionGroup]);
	///For 4th Planet///
		var person = people.create(3340, 100, 'ashley');
		person.animations.add('blink');
		person.animations.play('blink',6,true);
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.rotation = 1.96;
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
    bgm.loopFull(0.6);
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
	//UIText.fuel = game.add.text(10, 10, "Fuel: " + player.fuel,  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.time = game.add.text(60, 20, ": 0",  { font: "20px Tandysoft", fill: "#FFFFFF" });
	//UIText.velocityX = game.add.text(800, 10, "Horizontal Speed: " + (player.sprite.body.velocity.x),  { font: "20px Tandysoft", fill: "#FFFFFF" });
	//UIText.velocityY = game.add.text(800, 30, "Vertical Speed: " + (player.sprite.body.velocity.y),  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.numCollected = game.add.text(60, 140, "x 0",  { font: "20px Tandysoft", fill: "#FFFFFF" });
	UIText.endOfGame = game.add.text(600, 500, "You won! END OF GAME SUCKER!!!!",  { font: "50px Tandysoft", fill: "#FFFFFF" });
	
	
	var temp = game.add.image(50,85,'fuelbar');
	temp.fixedToCamera = true;
	temp.tint = 0x969696;
	
	fuelbar.image = game.add.image(50,85,'fuelbar');
	fuelbar.originalWidth = 156;
	fuelbar.image.fixedToCamera = true;
	fuelbar.image.tint = 0x76ed42;
	
	var fuelbarSymbol = game.add.image(10,70,'UIFuel');
	fuelbarSymbol.fixedToCamera = true;
	
	temp = game.add.image(10,10,'clock');
	temp.fixedToCamera = true;
	
	temp = game.add.image(5,130,'lifeIcon');
	temp.fixedToCamera = true;
	
	startScreen  = game.add.sprite(0,0,'startScreen');
	pressToStart = game.add.sprite(550, 850,'pressToStart');
	pressToReplay = game.add.sprite(550, 900,'pressToReplay');
	gameoverScreen = game.add.sprite(0,0,'gameoverScreen');
	loseScreen = game.add.sprite(0,0,'gameoverBack');
	gameoverText = game.add.sprite(450,400,'gameover');
	gameoverText.visible = false;
	winText = game.add.sprite(275,100,'congrats');
	UIText.gameObjective = game.add.text(400, 500, "Rescue at least 1 person to win!",  { font: "50px Tandysoft", fill: "#FFFFFF" });
	UIText.gameWarning = game.add.text(660, 770, "WARNING: Land on your feet!",  { font: "30px Tandysoft", fill: "#FF0000", fontWeight: "bold" });
	
	//UIText.fuel.fixedToCamera = true;
	UIText.time.fixedToCamera = true;
	UIText.gameObjective.fixedToCamera = true;
	UIText.gameWarning.fixedToCamera = true;
	//UIText.velocityX.fixedToCamera = true;
	//UIText.velocityY.fixedToCamera = true;
	UIText.numCollected.fixedToCamera = true;
	UIText.endOfGame.fixedToCamera = true;
	UIText.endOfGame.visible = false;
	UIText.gameObjective.visible = false;
	UIText.gameWarning.visible = false;
	pressToStart.visible = true;
	pressToReplay.visible = false;
	gameoverScreen.visible = false;
	gameoverScreen.fixedToCamera = true;
	loseScreen.visible = false;
	loseScreen.fixedToCamera = true;
	winText.visible = false;
	winText.fixedToCamera = true;
}

function createPlanets()
{
	//  Our BitmapData (same size as our canvas)
    bmd = game.make.bitmapData(3843, 1080);

    //  Add it to the world or we can't see it
    bmd.addToWorld();

    //  Create the atmosphere
    innerCircle = new Phaser.Circle(600, -200, 1100);
    outerCircle = new Phaser.Circle(600, -200, 1200);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);	
	
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
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
    //  Create the atmosphere
    innerCircle = new Phaser.Circle(30, 1200, 600);
    outerCircle = new Phaser.Circle(30, 1200, 700);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 350;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(30, 1200, 'planet2');
	planet.sprite.tint = 0xff00ff;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
    //  Create the atmosphere
    innerCircle = new Phaser.Circle(1800, 300, 600);
    outerCircle = new Phaser.Circle(1800, 300, 700);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 350;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(1800, 300, 'planet2');
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
    //  Create the atmosphere
    innerCircle = new Phaser.Circle(800, 600, 600);
    outerCircle = new Phaser.Circle(800, 600, 700);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 350;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(800, 600, 'planet2');
	planet.sprite.tint = 0xff0000;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.rotation = -Math.PI / 2.0;
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
    //  Create the atmosphere
    innerCircle = new Phaser.Circle(1700, 1300, 1100);
    outerCircle = new Phaser.Circle(1700, 1300, 1200);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	
	planet = new Object();
	planet.radius = 420;
	planet.gravitationalRadius = 600;
	planet.gravity = 400;
	planet.sprite = planetsGroup.create(1700, 1300, 'planet1');
	planet.sprite.tint = 0x00ffff;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
    //  Create the atmosphere
    innerCircle = new Phaser.Circle(2700, 700, 900);
    outerCircle = new Phaser.Circle(2700, 700, 1000);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	
	planet = new Object();
	planet.radius = 330;
	planet.gravitationalRadius = 500;
	planet.gravity = 300;
	planet.sprite = planetsGroup.create(2700, 700, 'planet3');
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
    //  Create the atmosphere
    innerCircle = new Phaser.Circle(3100, 50, 600);
    outerCircle = new Phaser.Circle(3100, 50, 700);

	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(1, 'rgba(255,255,224,0.5)');
    grd.addColorStop(0, 'transparent');

    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	
	planet = new Object();
	planet.radius = 210;
	planet.gravitationalRadius = 350;
	planet.gravity = 250;
	planet.sprite = planetsGroup.create(3100, 50, 'planet2');
	planet.sprite.tint = 0x0ef0ff;
	planet.sprite.body.rotation = Math.random() * Math.PI * 2;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup,throwPeopleCollisionGroup]);
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
			throwPeople();
			deleteTime = (game.time.now)/1000;
			player.numCollected -= 1;
			//spawn that person(similar to sonic coins)
		}
	}
}
function hitPlanetPerson(body1,body2) {
	
	if(player.sprite.body.x - body1.sprite.body.x >50)
	{
		//body1.sprite.destroy();
	}

}
function gameOver(){
		pressToReplay = game.add.sprite(550, 900,'pressToReplay');
		pressToReplay.fixedToCamera = true;
		game.world.bringToTop(loseScreen);
		game.world.bringToTop(gameoverText);			
		loseScreen.visible = true;
		gameoverText.visible = false;
		gameoverTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.8, updateGameOverText, this);
		gameoverText.fixedToCamera = true;
		game.world.bringToTop(pressToReplay);
		pressToReplay.visible = true;
		pressToReplayLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.2, updateUILText, this);
		player.fuel = player.startingFuel;
		player.numCollected = 0;
		while(throwList > 0)
		{
			throwList.pop();
		}
		throwList = [];
		jet.pause();
		pick.pause();
		throwS.pause();
		//wjet.pause(); 
		pickf.pause();
		currGameState = GameState.END;
}
function hitEndPoint(body1,body2) {
	if(currGameState != GameState.END)
	{
		pressToReplay = game.add.sprite(550, 900,'pressToReplay');
		pressToReplay.fixedToCamera = true;
		var playerScore = (Math.max(1200 - (10 * Math.trunc(game.time.totalElapsedSeconds() - startTime))) + (500 * player.numCollected) + player.fuel);
		var timeNowScore = Math.trunc(game.time.totalElapsedSeconds());
		if(playerScore >= 1 && player.numCollected>=1)
		{
		game.world.bringToTop(gameoverScreen);
		game.world.bringToTop(winText);
		UIText.peopleSaved = game.add.text(600, 600, player.numCollected,  { font: "55px Tandysoft", fill: "#FFFFFF" });
		UIText.peopleSaved.fixedToCamera = true;
		UIText.fuelSaved = game.add.text(840, 600, player.fuel,  { font: "55px Tandysoft", fill: "#FFFFFF" });
		UIText.fuelSaved.fixedToCamera = true;
		UIText.timeSpent = game.add.text(1075, 600, timeNowScore+".00",  { font: "55px Tandysoft", fill: "#FFFFFF" });
		UIText.timeSpent.fixedToCamera = true;
		UIText.score = game.add.text(800, 700, playerScore,  { font: "100px Tandysoft", fill: "#FFFFFF" });
		UIText.score.fixedToCamera = true;
		gameoverScreen.visible = true;

		winText.visible = true;
		winTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.8, updateWinText, this);
		}
		else if(player.numCollected==0)
		{
		game.world.bringToTop(loseScreen);
		game.world.bringToTop(gameoverText);			
		loseScreen.visible = true;
		gameoverText.visible = false;
		gameoverText.fixedToCamera = true;
		gameoverTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.8, updateGameOverText, this);
		}
		else if(currGameState == GameState.END )
		{
		game.world.bringToTop(loseScreen);
		game.world.bringToTop(gameoverText);			
		loseScreen.visible = true;
		gameoverText.visible = false;
		gameoverText.fixedToCamera = true;
		gameoverTextLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.8, updateGameOverText, this);
		}
		game.world.bringToTop(pressToReplay);
		pressToReplay.visible = true;
		pressToReplayLoop = game.time.events.loop(Phaser.Timer.SECOND * 0.2, updateUILText, this);
				player.fuel = player.startingFuel;
		player.numCollected = 0;
		while(throwList > 0)
		{
			throwList.pop();
		}
		throwList = [];
		jet.pause();
		pick.pause();
		throwS.pause();
		//wjet.pause(); 
		pickf.pause();
		currGameState = GameState.END;
	}
}

function hitPerson(body1,body2) {
	//  body1 is the space player (as it's the body that owns the callback)
    //  body2 is the body it impacted with, in this case our person
    //  As body2 is a Phaser.Physics.P2.Body object, you access its own (the sprite) via the sprite property:
	if(body2.sprite.alive) {
		throwList.push(body2.id);
		body2.sprite.alive = false;
		body2.sprite.body = null;
		body2.sprite.destroy();
		player.numCollected += 1;
		pick.play();
	}
}

function hitFuel(body1,body2) {
	//  body1 is the space player (as it's the body that owns the callback)
    //  body2 is the body it impacted with, in this case our panda
    //  As body2 is a Phaser.Physics.P2.Body object, you access its own (the sprite) via the sprite property:
    if(body2.sprite.alive) {
		body2.sprite.body = null;
		body2.sprite.destroy();
		body2.sprite.alive = false;
		player.fuel += 200;
		pickf.play();
	}

}

function updateUIText() {
    pressToStart.tint = Math.random() * 0xffffff;
}
function updateUILText() {
pressToReplay.tint = Math.random() * 0xffffff;
}
function updateGameOverText() {
	gameoverText.visible = !gameoverText.visible;
}

function updateWinText() {
	winText.visible = !winText.visible;
}
function updateOBJText(){
	if(UIText.gameObjective.visible == false )
	{
		UIText.gameObjective.visible = true;
		UIText.gameWarning.visible = true;

	}
	else
	{
		UIText.gameObjective.visible = false;
		UIText.gameWarning.visible = true;
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
			while(throwList.length > 0) 
			{
 		  		throwList.pop();
			}
			throwList = [];
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
			pressToReplay.destroy();
			pressToStart = null;
			pressToReplay = null;
			//pressToStartLoop.destroy();
			//objTextLoop.destroy();
			game.time.events.remove(pressToStartLoop);
			game.time.events.remove(pressToReplayLoop);
			game.time.events.remove(objTextLoop);
			UIText.gameObjective.visible = false;
			UIText.gameWarning.visible = false;
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
	
	
	
	
	
	
	
	/*var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(0, '#003BA2');
    grd.addColorStop(1, '#000000');

    bmd.cls();
    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);*/
	
	
	
	
	
	
	
	
	
	
	
	
	if (player.fuel <= 0)
	{
		gameOver();
		//hitEndPoint(null,null);
	}
	else if(player.fuel / player.startingFuel < .2)
	{
		fuelbar.image.tint = 0xee4343;
	}
	else
	{
		fuelbar.image.tint = 0x76ed42;
	}

    if (cursors.left.isDown && currGameState != GameState.END)
    {
        player.sprite.body.rotateLeft(80);
    }
    else if (cursors.right.isDown && currGameState != GameState.END)
    {
        player.sprite.body.rotateRight(80);
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
		//wjet.play();
    }
	else if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.game.time.totalElapsedSeconds() - spaceBarPressed >= 0.1)
	{
    	spaceBarPressed = this.game.time.totalElapsedSeconds();
		player.spaceBarAngle = player.sprite.rotation - (Math.PI / 2);
		player.fuel -= 100;
		jet.play();
	}
	else if(this.game.time.totalElapsedSeconds() - spaceBarPressed <= 0.1)
	{
		player.sprite.body.force.x = Math.cos(player.spaceBarAngle) * 4000;    // accelerateToObject 
		player.sprite.body.force.y = Math.sin(player.spaceBarAngle) * 4000;
        player.sprite.frame = 1;
        jet.play();
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

	//handle player force due to planet gravities
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
	var timeNow = this.game.time.totalElapsedSeconds();
	/*if((timeNow - deleteTime >= 3 || timeNow - deleteTime1 >= 3 || timeNow - deleteTime2 >= 3 || timeNow - deleteTime3 >= 3 || timeNow - deleteTime4 >= 3 || timeNow - deleteTime5 >= 3) && throwPerson != null)
	{
		throwPerson.destroy();
	}*/
	if(timeNow - deleteTime >= 3) //&& throwPerson != null)
	{
		throwPerson.destroy();
	}
}

function updateUI()
{
	var timeNow = this.game.time.totalElapsedSeconds();	
//	if((timeNow - deleteTime >= 3 || timeNow - deleteTime1 >= 3 || timeNow - deleteTime2 >= 3 || timeNow - deleteTime3 >= 3 || timeNow - deleteTime4 >= 3 || timeNow - deleteTime5 >= 3) && throwPerson != null)
	if(timeNow - deleteTime >= 3 && throwPerson != null)
	{
		throwPerson.destroy();
	}
	//UIText.fuel.setText("Fuel: " + player.fuel);
	UIText.time.setText(": " + Math.trunc(this.game.time.totalElapsedSeconds() - startTime));
	//UIText.velocityX.setText("Horizontal Speed: " + (Math.trunc(player.sprite.body.velocity.x)));
	//UIText.velocityY.setText("Vertical Speed: " + (Math.trunc(-player.sprite.body.velocity.y)));
	UIText.numCollected.setText("x " + player.numCollected);
	/*if(currGameState != GameState.END) {
		UIText.endOfGame.visible = false;
	}*/
	fuelbar.image.crop(new Phaser.Rectangle(0,0,(player.fuel / player.startingFuel) * fuelbar.originalWidth,fuelbar.image.height));
}
var deleteTime;
var throwPerson;
function throwPeople()
{
	var throwablePeople = game.add.group();
	throwablePeople.enableBody = true;
    throwablePeople.physicsBodyType = Phaser.Physics.P2JS;
    for(i =0 ; i<= throwList.length; i++)
    {

    	if(throwList[i] == 21)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'ryan');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else if(throwList[i] == 23)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'ryan');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else if(throwList[i] == 19)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'ashley');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else if(throwList[i] == 24)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'ashley');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else if(throwList[i] == 50)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'ashley');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else if(throwList[i] == 20)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'bob');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else if(throwList[i] == 18)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'bob');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
     	else if(throwList[i] == 22)
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'bob');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	else
    	{
    		throwPerson = throwablePeople.create(player.sprite.body.x, player.sprite.body.y,'bob');
    		throwPerson.animations.add('blink');
			throwPerson.animations.play('blink',6,true);
			throwPerson.body.setCollisionGroup(throwPeopleCollisionGroup);
			throwPerson.body.collides(planetCollisionGroup,hitPlanetPerson,this);
    		throwList.splice(i,1);
    	}
    	break;
    }
	
	throwPerson.body.rotateLeft(300);
	if(player.sprite.rotation==0)
	{
		throwPerson.body.velocity.y = 500;
	}
	else if(player.sprite.rotation>=0.1 && player.sprite.rotation <= 1.57)
	{
		throwPerson.body.velocity.x = -500;
		throwPerson.body.velocity.y = 500;
	}
	else if(player.sprite.rotation==1.570)
	{
		throwPerson.body.velocity.x = -500;
	}
	else if(player.sprite.rotation>= 1.571 && player.sprite.rotation <= 3.14)
	{
		throwPerson.body.velocity.x = -500;	
		throwPerson.body.velocity.y = -500;
	}
	else if(player.sprite.rotation== 3.141)
	{
		throwPerson.body.velocity.y = -500;
	}
	else if(player.sprite.rotation>= 3.142 && player.sprite.rotation <= 4.71)
	{
		throwPerson.body.velocity.x = 500;	
		throwPerson.body.velocity.y = -500;
	}
	else if(player.sprite.rotation== 4.71)
	{
		throwPerson.body.velocity.x = 500;	
	}
	else if(player.sprite.rotation>= 4.72 && player.sprite.rotation <= 6.2)
	{
		throwPerson.body.velocity.x = -500;	
		throwPerson.body.velocity.y = 500;
	}
	throwS.play();
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

