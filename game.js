/*var canvas = document.getElementById("game");
var context = canvas.getContext("2d");

var spaceship =
{
    color: "white",
    width: 8,
    height: 22,
    position:
    {
        x: 20,
        y: 20
    },
    velocity:
    {
        x: 0,
        y: 0
    },
	thrust:
	{
		x: -0.015,
		y: -0.015
	},
    angle: 0,
    engineOn: false,
    rotatingLeft: false,
    rotatingRight: false,
    crashed: false,
	angularVelocity: 0.0,
	angularStepSize: Math.PI / 1440
}

var stars = [];

function drawStars() 
{
  context.save();
  context.fillStyle = "#111"
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, 2*Math.PI);
    context.closePath();
    context.fillStyle = "rgba(255, 255, 255, " + star.alpha + ")";
    if (star.decreasing == true)
    {
      star.alpha -= star.dRatio;
      if (star.alpha < 0.1)
      { star.decreasing = false; }
    }
    else
    {
      star.alpha += star.dRatio;
      if (star.alpha > 0.95)
      { star.decreasing = true; }
    }
    context.fill();
  }
  context.restore();
}

function drawSpaceship()
{
    context.save();
    context.beginPath();
    context.translate(spaceship.position.x, spaceship.position.y);
    context.rotate(spaceship.angle);
    context.rect(spaceship.width * -0.5, spaceship.height * -0.5, spaceship.width, spaceship.height);
    context.fillStyle = spaceship.color;
    context.fill();
    context.closePath();

    // Draw the flame if engine is on
    if(spaceship.engineOn)
    {
        context.beginPath();
        context.moveTo(spaceship.width * -0.5, spaceship.height * 0.5);
        context.lineTo(spaceship.width * 0.5, spaceship.height * 0.5);
        context.lineTo(0, spaceship.height * 0.5 + Math.random() * 10);
        context.lineTo(spaceship.width * -0.5, spaceship.height * 0.5);
        context.closePath();
        context.fillStyle = "orange";
        context.fill();
    }
    context.restore();
}

var gravity = -0.01;

function updateSpaceship()
{
    spaceship.position.x += spaceship.velocity.x;
    spaceship.position.y += spaceship.velocity.y;
    if(spaceship.rotatingRight)
    {
		spaceship.angularVelocity += spaceship.angularStepSize;
        //spaceship.angle += spaceship.angularVelocity; //Math.PI / 180;
    }
    else if(spaceship.rotatingLeft)
    {
		spaceship.angularVelocity -= spaceship.angularStepSize;
        //spaceship.angle += spaceship.angularVelocity; //-= Math.PI / 180;
    }
	
	spaceship.angle += spaceship.angularVelocity;

    if(spaceship.engineOn)
    {
        spaceship.velocity.x += spaceship.thrust.x * Math.sin(-spaceship.angle);
        spaceship.velocity.y += spaceship.thrust.y * Math.cos(spaceship.angle);
    }
    spaceship.velocity.y -= gravity;
}


function draw()
{
    // Clear entire screen
    context.clearRect(0, 0, canvas.width, canvas.height);
	
	// draw background
	context.beginPath();
	context.rect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	context.fill();

    updateSpaceship();

    // Begin drawing
	drawStars();
    drawSpaceship();
    // other draw methods (to add later) 

    requestAnimationFrame(draw);
}

function keyLetGo(event)
{
    console.log(spaceship);
    switch(event.keyCode)
    {
        case 37:
            // Left Arrow key
            spaceship.rotatingLeft = false;
            break;
        case 39:
            // Right Arrow key
            spaceship.rotatingRight = false;
            break;
        case 38:
            // Up Arrow key
            spaceship.engineOn = false;
            break;
    }
}

document.addEventListener('keyup', keyLetGo);

function keyPressed(event)
{
    console.log(spaceship);
    switch(event.keyCode)
    {
        case 37:
            // Left Arrow key
            spaceship.rotatingLeft = true;
            break;
        case 39:
            // Right Arrow key
            spaceship.rotatingRight = true;
            break;
        case 38:
            // Up Arrow key
            spaceship.engineOn = true;
            break;
    }
}

document.addEventListener('keydown', keyPressed);

function InitStars()
{
	for (var i = 0; i < 500; i++) {
		stars[i] = {
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			radius: Math.sqrt(Math.random() * 2),
			alpha: 1.0,
			decreasing: true,
			dRatio: Math.random() * 0.05
		};
	}
}

InitStars();

draw();*/

var GameState = function(game) {
  };

  // To Load images and sounds
  GameState.prototype.preload = function() {
      this.game.load.spritesheet('ship', 'assets/ship.png', 32, 32);
      this.game.load.image('ground', 'assets/ground.png');
      this.game.load.image('background', 'assets/background.png');
      this.game.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);
  };


  GameState.prototype.create = function() {
      // loading background image 
      game.add.sprite(0, 0, 'background');
      // Define motion constants
      this.ROTATION_SPEED = 70; // degrees/second
      this.ACCELERATION = 50; // pixels/second/second
      this.MAX_SPEED = 150; // pixels/second
      this.DRAG = 0; // pixels/second
      this.GRAVITY = 30; // pixels/second/second

      // Adding the ship 
      this.ship = this.game.add.sprite(0, 0, 'ship');
      this.ship.anchor.setTo(0.5, 0.5);
      this.ship.angle = -90; // Point the ship up

      // Enabling physics on the ship
      this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);

      // Setting maximum velocity
      this.ship.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED); // x, y

      // Add drag to the ship that slows it down when it is not accelerating
      this.ship.body.drag.setTo(this.DRAG, this.DRAG); // x, y

      // Choose a random starting angle and velocity for the ship
      this.resetShip();

      // Turn on gravity
      game.physics.arcade.gravity.y = this.GRAVITY;

      // Make ship bounce a little
     // this.ship.body.bounce.setTo(0.25, 0.25);

      // Create some ground for the ship to land on
      this.ground = this.game.add.group();
      for(var x = 0; x < this.game.width; x += 32) {
          // Creating multiple ground blocks, and enabling physics on each of them.
          var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'ground');
          this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
          groundBlock.body.immovable = true;
          groundBlock.body.allowGravity = false;
          this.ground.add(groundBlock);
      }

      // Create a group for explosions
      this.explosionGroup = this.game.add.group();

      this.game.input.keyboard.addKeyCapture([
          Phaser.Keyboard.LEFT,
          Phaser.Keyboard.RIGHT,
          Phaser.Keyboard.UP,
          Phaser.Keyboard.DOWN
      ]);

     
      this.game.time.advancedTiming = true;
 
  };


  GameState.prototype.getExplosion = function(x, y) {
      var explosion = this.explosionGroup.getFirstDead();

      if (explosion === null) {
          explosion = this.game.add.sprite(0, 0, 'explosion');
          explosion.anchor.setTo(0.5, 0.5);

          var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
          animation.killOnComplete = true;

          // Adding the explosion sprite 
          this.explosionGroup.add(explosion);
      }

      // Revive the explosion (setting it's alive property to true)
      explosion.revive();

      // Explosion at required co-ords
      explosion.x = x;
      explosion.y = y;

      // Set rotation of the explosion at random for a little variety
      explosion.angle = this.game.rnd.integerInRange(0, 360);

      explosion.animations.play('boom');

      return explosion;
  };

  GameState.prototype.resetShip = function() {

      this.ship.x = 500;
      this.ship.y = 32;
      this.ship.body.acceleration.setTo(0, 0);
      this.ship.angle = this.game.rnd.integerInRange(-180, 180);
      this.ship.body.velocity.setTo(this.game.rnd.integerInRange(-100, 100), 0);
  };

  GameState.prototype.update = function() {


      // Collision with ground
      this.game.physics.arcade.collide(this.ship, this.ground);

      // Keep the ship on the screen
      if (this.ship.x > this.game.width) this.ship.x = 0;
      if (this.ship.x < 0) this.ship.x = this.game.width;

      if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
          this.ship.body.angularVelocity = -this.ROTATION_SPEED;
      } else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
          this.ship.body.angularVelocity = this.ROTATION_SPEED;
      } else {
          this.ship.body.angularVelocity = 0;
      }

      var onTheGround = this.ship.body.touching.down;

      if (onTheGround) {
          if (Math.abs(this.ship.body.velocity.y) > 20 || Math.abs(this.ship.body.velocity.x) > 30) {
              // The ship blows apart if it hits the ground too hard.
              this.getExplosion(this.ship.x, this.ship.y);
              this.resetShip();
          } else {
              // We landed
              this.ship.body.angularVelocity = 0;
              this.ship.body.velocity.setTo(0, 0);
              this.ship.angle = -90;
          }

      }

      if (this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
          this.ship.body.acceleration.x = Math.cos(this.ship.rotation) * this.ACCELERATION;
          this.ship.body.acceleration.y = Math.sin(this.ship.rotation) * this.ACCELERATION;
          this.ship.frame = 1;
      } else {
          this.ship.body.acceleration.setTo(0, 0);

          this.ship.frame = 0;
      }
  };

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
  game.state.add('game', GameState, true);

  window.focus();
