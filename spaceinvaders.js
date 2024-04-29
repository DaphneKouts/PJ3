//make the canvas and the context
let canvas = document.getElementById("gameCanvas");
// Set canvas width and height to match the viewport
canvas.width = 1000;
canvas.height = 1000;
let context = canvas.getContext("2d");
//make the background black
canvas.style.backgroundColor = 'black';
//make variables for the shoot and explode sounds
let explosionSound = document.getElementById('explosionSound');
let shootSound = document.getElementById('shootSound');
//make a variable for the pause button in the bottom right corner
let pauseButton = document.getElementById('pauseButton');
let restartButton = document.getElementById('restartButton');
/**
 * Make a variable for the game states
 * 1 = main menu
 * 2 = play
 * 3 = pause
 * 4 = game over
 */
let state = 1; //this is the start state so it is at the main menu

/**
 * Makes a space invader alien given x and y coordinates.
 * @param {*} x - The x coordinate of the top-left corner of the invader.
 * @param {*} y - The y coordinate of the top-left corner of the invader.
 */
function makeInvader(x, y) {
    // Draw the space invader body using fixed x,y
    context.fillStyle = "green";

    // Draw the left antenna
    context.fillRect(x + 5, y + 5, 5, 5);
    context.fillRect(x, y, 5, 5);

    // Draw the right antenna
    context.fillRect(x + 30, y + 5, 5, 5);
    context.fillRect(x + 35, y, 5, 5);

    //make a rectangle for the body
    context.fillRect(x,y+10,40,20);

    //make the right leg
    context.fillRect(x+40,y+15,5,10);
    context.fillRect(x+45,y+20,5,15);

    //make the left leg
    context.fillRect(x-5,y+15,5,10);
    context.fillRect(x-10,y+20,5,15);

    //make the left arm
    context.fillRect(x+5,y+30,5,5);
    context.fillRect(x+10,y+35,7.5,5);

    //make the right arm
    context.fillRect(x+30,y+30,5,5);
    context.fillRect(x+22.5,y+35,7.5,5);

    // Draw the two eye squares
    context.fillStyle = "black";
    context.fillRect(x + 7.5, y + 15, 5, 5);
    context.fillRect(x + 27.5, y + 15, 5, 5);
}

/**
 * makes a spaceship that the player will control given an x and y
 * @param {*} x 
 * @param {*} y 
 */
function makeShip(x, y) {
    context.fillStyle = "white";
    //make the tip
    context.fillRect(x+3.5,y-10,3,10);
    //make the body
    context.fillRect(x,y,10,30);
    //make the wing
    context.fillRect(x-10,y+25,30,5);
    context.fillRect(x-20,y+30,50,5);
    //make the first set of shooters (red)
    context.fillStyle = "red";
    context.fillRect(x-10,y+10,3,15);
    context.fillRect(x+17,y+10,3,15);
    //make the second set of shooters
    context.fillRect(x-20,y+15,3,15);
    context.fillRect(x+27,y+15,3,15);
    //make 2 jets
    context.fillStyle = "white";
    context.fillRect(x-1,y+35,4,6);
    context.fillRect(x+8,y+35,4,6);
}

/**
 * This function makes an imaginary hitbox around the aliens and the lazer and sees if they are overlapping to detect a hit
 * @param {*} lazer 
 * @param {*} alien 
 * @returns 
 */
function alienCollision(lazer,alien){
    if(lazer.lazerX + lazer.length >= alien.x &&
        lazer.lazerX <= alien.x +alien.width &&
        lazer.lazerY + lazer.length >= alien.y &&
        lazer.lazerY <= alien.y + alien.height){
            return true;
        }
    else{
        return false;
    }
}

/**
 * This function makes an imaginary hitbox around the ship and the lazer and sees if they are overlapping to detect a hit
 * @param {*} lazer 
 * @param {*} rocket 
 * @returns 
 */
function shipCollision(lazer,rocket){
    if(lazer.lazerX + lazer.length >= shipX &&
        lazer.lazerX <= shipX + 40 &&
        lazer.lazerY + lazer.length >= 500 &&
        lazer.lazerY <= 500 + 40){
            return true;
        }
    else{
        return false;
    }
}


//make globals for the alien list, ship position and the lazers
let aliens = [];
let shipX = 380;
let lives = 3;
let shipLazers = [];
let alienLazers = [];
let ship;
let redraw = true;
//let alienSpeed = 1;
let totalAlienMovement = 0;
let firingRate = 0.0005
let score = 0;
//make a constant and a cooldown variable for the lazer
const reloadPeriod = 2500; //in milliseconds
let lazerCooldown = 0;

/**
 * this function makes a 5x11 grid of aliens that gets called whenever there are no aliens left to keep the game going
 */
function countAliens(){
    //this is a loop to draw the actual aliens
    for(let i = 10; i < 651; i+=80){
        for(let j = 10; j < 191; j += 45){
            //console.log("x:" + i);
            //console.log("y:" + j);
            aliens.push({x:i, y:j, width: 50, height: 40, alienSpeed: 1, currPos: 0}); 
        }
    }
}

/**
 * This function makes it so that there is a 1/10th chance that the alien will shoot down a lazer at the person
 */
function updateAlienLazers() {
    for (let i = 0; i < aliens.length; i++) {
        const alien = aliens[i];
        // Random chance for an alien to shoot
        if (Math.random() < firingRate) { // Adjust the probability as needed
            // Shoot from the center of the alien
            alienLazers.push({ lazerX: alien.x + alien.width / 2 - 2.5, lazerY: alien.y + alien.height, length: 10 });
        }
    }
}

//run countAliens
countAliens();
//console.log(aliens[40]);

let draw = function(){
//if the state is 1, we are at the main menu, and we are waiting for them to press the space bar to start the game
if(state == 1){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.fillStyle = "white";
    context.font = "100px Arial";
    context.fillText("Welcome to",225,300);
    context.fillText("SPACE INVADERS", 75,400);
    context.font = "50px Arial";
    context.fillText("Press the play button to play!", 180,500);
    context.font = "25px Arial";
    context.fillText("Press the space bar to shoot and the arrow keys to move", 180, 550);
    context.fillText("Press the pause button to pause and the restart button to restart",140,600);
}

if(state == 2){
    //decrement the cooldown period
    if(lazerCooldown > 0){
        lazerCooldown -= 1000/60; //decrement it
    }

    //meed to clear everything
    context.clearRect(0,0,canvas.width,canvas.height);

    //actually draw the ship and the alien lazers
    ship = (makeShip(shipX,500));
    updateAlienLazers();

    //draw the aliens that go back and forth
    /**
    for(let i = 0; i < aliens.length; i++){
        makeInvader(aliens[i].x, aliens[i].y);
    }
    */

    // Update and draw the aliens
    for (let i = 0; i < aliens.length; i++) {
        // Update alien position
        aliens[i].x += aliens[i].alienSpeed;
        aliens[i].currPos += aliens[i].alienSpeed;

        // Draw the updated alien
        makeInvader(aliens[i].x, aliens[i].y);
    }

    // Check if aliens reached the screen boundaries
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].currPos > 300 || aliens[i].currPos < 0) {
                aliens[i].alienSpeed = -1*aliens[i].alienSpeed;
        }
    }


    //make a loop that goes through all the aliens and Shiplazers
    for (let i = 0; i < shipLazers.length; i++) {
        const lazer = shipLazers[i];
        for (let j = 0; j < aliens.length; j++) {
            const alien = aliens[j];
            if (alienCollision(lazer, alien)) {
                console.log("hit");
                shipLazers.splice(i,1);
                aliens.splice(j,1);
                score += 10;
            }
        }
    }

    //make another loop similar that goes through all the alienLazers and ship
    for(let i = 0; i < alienLazers.length; i++){
        const lazer = alienLazers[i];
        if(shipCollision(lazer,ship)){
            console.log("hit");
            lives--;
            alienLazers.splice(i,1);
            explosionSound.play();
        }
    }

    //draw the amount of lives
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Lives: " + lives, 350, 600);
    //draw the score
    context.fillStyle = "white";
    context.font = "20pz Arial";
    context.fillText("Score: "+ score, 500,600);

    //if the amount of aliens is 0, recall the countAliens
    if(aliens.length == 0){
        countAliens();
        firingRate = firingRate * 1.5;
        score += 1000;
    }

    // Update and draw the ship lasers
    shipLazers.forEach(function(lazer) {
        context.fillStyle = "blue";
        context.fillRect(lazer.lazerX, lazer.lazerY - 5, 10, 10);
        // Update the laser's position
        lazer.lazerY -= 5; // Adjust the speed as needed
    });

    // Update and draw alien lasers
    alienLazers.forEach(function(lazer) {
        context.fillStyle = "green";
        context.fillRect(lazer.lazerX,lazer.lazerY-5,10,10);
        // Update the laser's position
        lazer.lazerY += 5; // Adjust the speed as needed
    });

    // Remove lasers that have gone off-screen
    shipLazers = shipLazers.filter(function(lazer) {
        return lazer.lazerY > 0; // Only keep lasers that are still on-screen
    });
    alienLazers = alienLazers.filter(function(lazer){
        return lazer.lazerY < 1000; //only keep lazers that are still on screen
    });

    //make an if statement about the lives, so that it won't redraw the frame if you lose
    if(lives <= 0){
        state = 4;
    }

}

if(state == 3){
    context.clearRect(0,0,canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "100px Arial";
    context.fillText("PAUSED", 200,500);
}

if(state < 4)
    window.requestAnimationFrame(draw); //request it and then request it again when it is outside
else{
    //make the screen black and have text with game over and refresh to play again
    context.clearRect(0,0,canvas.width,canvas.height);
    context.fillStyle = "red";
    context.font = "100px Arial";
    context.fillText("Game Over",200,500);  
    context.fillStyle = "white";
    context.font = "50px Arial";
    context.fillText("Refresh to play again!",200,700);
    context.fillText("Score: " + score, 200, 800);
}
}

if(redraw)
    window.requestAnimationFrame(draw);

//make a listener for the arrows and the space bar 
document.addEventListener('keydown', function(event) {
    // Log the pressed key
    if(event.key == " " && lazerCooldown <= 0){
        console.log("space");
        shipLazers.push({lazerX: shipX, lazerY: 500, length: 5});
        shootSound.play();

        //reset the cooldown period
        lazerCooldown = reloadPeriod;
    }
    if(event.key == "ArrowLeft"){
        console.log("left");
        if(shipX > 15) //make sure the ship stays in bounds
            shipX -= 5;
    }
    if(event.key == "ArrowRight"){
        console.log("right");
        if(shipX < 985) //make sure the ship stays in bounds
            shipX += 5;
    }
});

//make a listener for the pause button to change the game state
pauseButton.onclick = function(){
    console.log("paused");
    //need to set the state to paused
    if(state == 2){
        state = 3;
        pauseButton.textContent = "Resume";
    }
    else if(state == 3){
        state = 2;
        pauseButton.textContent = "Pause";
    }
    this.blur();
};
playButton.onclick = function(){
    if(state == 1){
        state = 2;
    }
}
restartButton.onclick = function(){
    location.reload();
}
