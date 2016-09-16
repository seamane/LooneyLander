var GameState = function(game) {
  };
  
  var fuel = 3500000;
  var fuelText;

  var elapsedTimeText;
  var spaceBarPressed = -3;
  
  var velocityXText;
  var velocityYText;
  
  var shipForVelocity;
  
  // To Load images and sounds
  GameState.prototype.preload = function() {
      this.game.load.spritesheet('ship', 'assets/character.png', 72, 60);
      this.game.load.image('ground', 'assets/ground.png');
      this.game.load.image('background', 'assets/background.png', 3843, 1080);
      this.game.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);
      this.game.load.spritesheet('platform', 'assets/platform.png', 136, 12);
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
	  shipForVelocity = this.ship;
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

     //creating  landing platform
  /*    var landingPlatform = this.game.add.sprite(400, 550, 'platform');
	  this.game.physics.enable(landingPlatform, Phaser.Physics.ARCADE);
      landingPlatform.body.immovable = true;
      landingPlatform.body.allowGravity = false;
      landingPlatform.body.collideWorldBounds = true;
      landingPlatform.body.checkCollision.down = true;
      landingPlatform.body.checkCollision.up = true;
*/
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

      for(var x = 400; x < 537; x += 32) {
          // Creating multiple ground blocks, and enabling physics on each of them.
          var groundBlock = this.game.add.sprite(x, this.game.height - 550, 'ground');
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
          Phaser.Keyboard.DOWN,
          Phaser.Keyboard.SPACEBAR
      ]);

      this.game.time.advancedTiming = true;
 
	//create text for UI
	fuelText = game.add.text(10, 10, "Fuel: " + fuel,  { font: "20px Arial", fill: generateHexColor() });
	elapsedTimeText = game.add.text(10, 30, "Elapsed time: " + this.game.time.totalElapsedSeconds(),  { font: "20px Arial", fill: generateHexColor() });
	velocityXText = game.add.text(800, 10, "Horizontal Speed: " + Math.abs(this.ship.body.velocity.x),  { font: "20px Arial", fill: generateHexColor() });
	velocityYText = game.add.text(800, 30, "Vertical Speed: " + Math.abs(this.ship.body.velocity.y),  { font: "20px Arial", fill: generateHexColor() });
};

function generateHexColor() { 
    return '#' + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
}

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
      this.fuel = 3500000;
  };
  
  function updateUI() {
	  this.fuelText.setText("Fuel: " + fuel);
	  elapsedTimeText.setText("Elapsed Seconds: " + Math.trunc(this.game.time.totalElapsedSeconds()));
	  velocityXText.setText("Horizontal Speed: " + Math.abs(Math.trunc(this.shipForVelocity.body.velocity.x)));
	  velocityYText.setText("Vertical Speed: " + Math.abs(Math.trunc(this.shipForVelocity.body.velocity.y)));
  }

  GameState.prototype.update = function() {
      // Collision with ground
      this.game.physics.arcade.collide(this.ship, this.ground);
      //this.game.physics.arcade.collide(this.ship, this.landingPlatform);

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

      if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && fuel > 50 && this.game.time.totalElapsedSeconds() - spaceBarPressed >= 3) {
      		spaceBarPressed = this.game.time.totalElapsedSeconds();
              this.ship.body.velocity.setTo(0, -90);
              this.ship.angle = -90;
              fuel -= 50;
      }
      else if (this.input.keyboard.isDown(Phaser.Keyboard.UP) && fuel > 0) {
          this.ship.body.acceleration.x = Math.cos(this.ship.rotation) * this.ACCELERATION;
          this.ship.body.acceleration.y = Math.sin(this.ship.rotation) * this.ACCELERATION;
          this.ship.frame = 1;
		  fuel -= 1;
		  //fuelText.setText("Fuel: " + fuel);
      } else {
          this.ship.body.acceleration.setTo(0, 0);

          this.ship.frame = 0;
      }
	  
	  updateUI();
  };

  var game = new Phaser.Game(1800, 1000, Phaser.AUTO, 'game');
  game.state.add('game', GameState, true);

  window.focus();