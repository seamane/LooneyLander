var canvas = document.getElementById("game");
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
    /* other draw methods (to add later) */

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

draw();
