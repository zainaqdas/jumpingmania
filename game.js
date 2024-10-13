const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

let runnerImage = new Image();
runnerImage.src = 'images/runner.png';  // Use correct image path

let obstacleImage = new Image();
obstacleImage.src = 'images/obstacle.png';  // Use correct image path

let collectibleImage = new Image();
collectibleImage.src = 'images/collectible.png';  // Use correct image path

let runner = {
    x: 50,
    y: canvas.height - 70,
    width: 40,
    height: 60,
    velocityY: 0,
    gravity: 0.5,
    jumpHeight: 12,
};

let obstacles = [];
let collectibles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;

let obstacleSpeed = 3;
let lastObstacleTime = 0;
let lastCollectibleTime = 0;
let obstacleCooldown = 1000;  // Interval to generate obstacles
let collectibleCooldown = 100;  // Interval to generate collectibles
let timeLeft = 60; // Time limit in seconds
let lastUpdate = 0; // Variable to track the last timestamp for updates

// Create an obstacle
function createObstacle() {
    const obstacle = {
        x: canvas.width,
        y: canvas.height - 30,
        width: 20,
        height: 20,
    };
    obstacles.push(obstacle);
}

// Create a collectible
function createCollectible() {
    const collectible = {
        x: canvas.width,
        y: canvas.height - 15,  // Higher position for the collectible
        width: 20,
        height: 20
    };
    collectibles.push(collectible);
}

// Start the game
function startGame() {
    gameStarted = true;
    score = 0;
    gameOver = false;
    obstacles = [];
    collectibles = [];
    timeLeft = 60; // Reset timer to 60 seconds
    runner.y = canvas.height - runner.height;  // Reset runner position
    lastUpdate = performance.now(); // Initialize last update time
    obstacleSpeed = 3; // Reset speed to initial value
    requestAnimationFrame(gameLoop);
}

// Game Over function
function endGame() {
    gameOver = true;
    setTimeout(() => {
        document.location.reload();  // Reload the page after a short delay
    }, 1000);  // Delay for the game over state
}

// Main game loop
function gameLoop(timestamp) {
    if (gameOver) return;
    if (!gameStarted) return;

    // Check for time update
    if (timestamp - lastUpdate >= 1000) { // If at least one second has passed
        timeLeft--; // Decrease time left
        lastUpdate = timestamp; // Update last timestamp

        // Increase obstacle speed gradually as time progresses
        obstacleSpeed += 0.1; // Gradually increase speed by 0.1 every second
    }

    if (timeLeft <= 0) {
        endGame(); // Trigger game over when time is up
    }

    if (timestamp - lastObstacleTime > obstacleCooldown) {
        createObstacle();
        lastObstacleTime = timestamp;
    }

    if (timestamp - lastCollectibleTime > collectibleCooldown) {
        createCollectible();
        lastCollectibleTime = timestamp;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw runner
    ctx.drawImage(runnerImage, runner.x, runner.y, runner.width, runner.height);

    // Update runner position
    runner.velocityY += runner.gravity;
    runner.y += runner.velocityY;

    if (runner.y + runner.height > canvas.height) {
        runner.y = canvas.height - runner.height;
        runner.velocityY = 0;
    }

    // Update and draw obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= obstacleSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);  // Remove off-screen obstacles
        }
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Collision detection with the runner
        if (
            runner.x < obstacle.x + obstacle.width &&
            runner.x + runner.width > obstacle.x &&
            runner.y < obstacle.y + obstacle.height &&
            runner.y + runner.height > obstacle.y
        ) {
            endGame();  // Trigger game over
        }
    });

    // Update and draw collectibles
    collectibles.forEach((collectible, index) => {
        collectible.x -= obstacleSpeed;
        if (collectible.x + collectible.width < 0) {
            collectibles.splice(index, 1);  // Remove off-screen collectibles
        }
        ctx.drawImage(collectibleImage, collectible.x, collectible.y, collectible.width, collectible.height);

        // Collision detection for collecting items
        if (
            runner.x < collectible.x + collectible.width &&
            runner.x + runner.width > collectible.x &&
            runner.y < collectible.y + collectible.height &&
            runner.y + runner.height > collectible.y
        ) {
            score++;
            collectibles.splice(index, 1);  // Remove the collected item
        }
    });

    // Update score and timer display
    document.getElementById('score').innerText = 'Score: ' + score;
    document.getElementById('timer').innerText = 'Time Left: ' + timeLeft; // Update timer display

    // Keep looping
    requestAnimationFrame(gameLoop);
}

// Tap to jump or start the game
document.addEventListener('touchstart', (event) => {
    if (!gameStarted) {
        startGame();
    } else if (runner.y === canvas.height - runner.height) {
        runner.velocityY = -runner.jumpHeight;
    }
});

// Click to jump (for desktop testing)
document.addEventListener('click', (event) => {
    if (!gameStarted) {
        startGame();
    } else if (runner.y === canvas.height - runner.height) {
        runner.velocityY = -runner.jumpHeight;
    }
});