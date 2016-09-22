var game = new Phaser.Game(1800, 1080, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    this.game.load.image('background', 'assets/background.png', 3843, 1080);
    this.game.load.image('bob', 'assets/BobSprite.png', 72, 72);
    this.game.load.spritesheet('player', 'assets/CharacterSpriteSheet.png', 60, 72);
    this.game.load.image('platform', 'assets/platform.png', 126, 12);

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

var playerCollisionGroup;
var peopleCollisionGroup;
var planetCollisionGroup;

var spaceBarPressed = -3.0;
var startTime;

var starfield;//background
var cursors;//for arrow key input

//temp planet position for testing gravity
var gx = 500;
var gy = 500;

var planets = [];

function create() {
    game.world.setBounds(0, 0, 3843, 1080);

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
	
	game.physics.p2.updateBoundsCollisionGroup();
	
	var people = game.add.group();
	people.enableBody = true;
    people.physicsBodyType = Phaser.Physics.P2JS;
	for (var i = 0; i < 4; i++)
    {
		var person = people.create(game.world.randomX, game.world.randomY, 'bob');
		person.body.setRectangle(72,72);
		person.body.setCollisionGroup(peopleCollisionGroup);
		person.body.collides([playerCollisionGroup,planetCollisionGroup]);
	}

	//init player
    player.sprite = game.add.sprite(50, 945, 'player');
    game.physics.p2.enable(player.sprite);
    game.camera.follow(player.sprite);
	player.sprite.body.setCollisionGroup(playerCollisionGroup);
	player.sprite.body.collides(planetCollisionGroup,hitPlanet,this);
	player.sprite.body.collides(peopleCollisionGroup,hitPerson,this);
	
	createPlatforms(planetCollisionGroup,playerCollisionGroup,peopleCollisionGroup);
	
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

function createPlatforms()
{
	var planetsGroup = game.add.group();
	planetsGroup.enableBody = true;
	planetsGroup.physicsBodyType = Phaser.Physics.P2JS;
	
	var planet = new Object();
	planet.radius = 100;
	planet.gravitationalRadius = 400;
	planet.gravity = 200;
	planet.sprite = planetsGroup.create(600, 200, 'platform');
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 100;
	planet.gravitationalRadius = 400;
	planet.gravity = 200;
	planet.sprite = planetsGroup.create(30, 1000, 'platform');
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 100;
	planet.gravitationalRadius = 400;
	planet.gravity = 200;
	planet.sprite = planetsGroup.create(1300, 400, 'platform');
	planet.sprite.body.rotation = -Math.PI / 4.0;
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 100;
	planet.gravitationalRadius = 400;
	planet.gravity = 200;
	planet.sprite = planetsGroup.create(800, 600, 'platform');
	planet.sprite.body.setCircle(planet.radius);
	planet.sprite.body.rotation = -Math.PI / 2.0;
	planet.sprite.body.setCollisionGroup(planetCollisionGroup);
	planet.sprite.body.collides([playerCollisionGroup,peopleCollisionGroup]);
    planet.sprite.body.static = true;
    planet.sprite.body.allowGravity = false;
	planets[planets.length] = planet;
	
	planet = new Object();
	planet.radius = 100;
	planet.gravitationalRadius = 400;
	planet.gravity = 200;
	planet.sprite = planetsGroup.create(1500, 1000, 'platform');
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
	
}

function hitPerson(body1,body2) {
	//  body1 is the space player (as it's the body that owns the callback)
    //  body2 is the body it impacted with, in this case our person
    //  As body2 is a Phaser.Physics.P2.Body object, you access its own (the sprite) via the sprite property:
	body2.sprite.body = null;
	body2.sprite.destroy();
	player.numCollected += 1;
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
		player.sprite.body.force.x = Math.cos(player.spaceBarAngle) * 6000;    // accelerateToObject 
		player.sprite.body.force.y = Math.sin(player.spaceBarAngle) * 6000;
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