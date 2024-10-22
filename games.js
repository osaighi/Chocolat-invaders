const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Variables
let playerWidth = 50;
let playerHeight = 50;
let playerX = (canvas.width / 2) - (playerWidth / 2);
let playerY = canvas.height - playerHeight - 80; // Ajusté pour être au-dessus des boutons
let playerSpeed = 5;

let croissants = [];
let croissantWidth = 40;
let croissantHeight = 40;
let initialCroissants = 10; // Augmenter le nombre initial de croissants
let croissantDirection = 1; // Direction initiale des croissants (1 = droite, -1 = gauche)

let bullets = [];
let bulletWidth = 5;
let bulletHeight = 20;
let bulletSpeed = 5;

let score = 0;
let isGameOver = false;

// Key press management
let keys = {
    left: false,
    right: false,
    space: false,
};

// Load images
const painAuChocolatImg = new Image();
painAuChocolatImg.src = 'assets/IMG_2233.png';

const croissantImg = new Image();
croissantImg.src = 'assets/IMG_2234.png';

// Event listeners for keyboard controls
document.addEventListener("keydown", function(event) {
    if (event.code === "ArrowLeft") keys.left = true;
    if (event.code === "ArrowRight") keys.right = true;
    if (event.code === "Space") keys.space = true;
});
document.addEventListener("keyup", function(event) {
    if (event.code === "ArrowLeft") keys.left = false;
    if (event.code === "ArrowRight") keys.right = false;
    if (event.code === "Space") keys.space = false;
});

// Mobile controls: touch events
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const fireButton = document.getElementById("fireButton");

leftButton.addEventListener("touchstart", () => keys.left = true);
leftButton.addEventListener("touchend", () => keys.left = false);

rightButton.addEventListener("touchstart", () => keys.right = true);
rightButton.addEventListener("touchend", () => keys.right = false);

fireButton.addEventListener("touchstart", () => keys.space = true);
fireButton.addEventListener("touchend", () => keys.space = false);

// Create croissants
function createCroissants() {
    for (let i = 0; i < initialCroissants; i++) {
        croissants.push({
            x: i * (croissantWidth + 10), // Moins d'espace entre les croissants
            y: 50,
            width: croissantWidth,
            height: croissantHeight,
        });
    }
}

// Calculer la vitesse des croissants en fonction du nombre et de la hauteur de l'écran
function calculateCroissantSpeed() {
    const remainingCroissants = croissants.length;
    const maxSpeed = 5; // Vitesse maximale des croissants
    const minSpeed = 1; // Vitesse minimale des croissants
    const speedIncreaseFactor = 0.01 * canvas.height/canvas.width; // Facteur basé sur la hauteur du canvas

    // La vitesse augmente lorsque le nombre de croissants diminue
    let calculatedSpeed = minSpeed + (maxSpeed - minSpeed) * (1 - remainingCroissants / initialCroissants);
    return Math.min(calculatedSpeed + speedIncreaseFactor, maxSpeed); // Limiter à la vitesse maximale
}

// Update game
function update() {
    if (keys.left && playerX > 0) playerX -= playerSpeed;
    if (keys.right && playerX + playerWidth < canvas.width) playerX += playerSpeed;

    if (keys.space) {
        bullets.push({ x: playerX + playerWidth / 2 - bulletWidth / 2, y: playerY });
        keys.space = false;
    }

    bullets = bullets.map(b => ({ x: b.x, y: b.y - bulletSpeed })).filter(b => b.y > 0);

    // Mouvement des croissants (horizontal comme dans Space Invaders)
    let moveDown = false; // Indicateur pour descendre les croissants
    let croissantSpeedX = calculateCroissantSpeed(); // Calculer la vitesse des croissants

    croissants.forEach(croissant => {
        croissant.x += croissantSpeedX * croissantDirection;

        // Change de direction si un croissant atteint le bord
        if (croissant.x + croissant.width > canvas.width || croissant.x < 0) {
            croissantDirection *= -1; // Inverser la direction
            moveDown = true;
        }
    });

    // Descendre tous les croissants si l'un d'eux a atteint un bord
    if (moveDown) {
        croissants.forEach(croissant => {
            croissant.y += croissantHeight; // Descendre d'une ligne
        });
    }

    checkCollisions();
    checkGameOver();
}

// Check for collisions
function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        croissants.forEach((croissant, croissantIndex) => {
            if (
                bullet.x < croissant.x + croissant.width &&
                bullet.x + bulletWidth > croissant.x &&
                bullet.y < croissant.y + croissant.height &&
                bullet.y + bulletHeight > croissant.y
            ) {
                croissants.splice(croissantIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 10;
            }
        });
    });
}

// Check if game over
function checkGameOver() {
    croissants.forEach(croissant => {
        if (croissant.y + croissantHeight > playerY) {
            isGameOver = true;
        }
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(painAuChocolatImg, playerX, playerY, playerWidth, playerHeight);

    // Draw croissants
    croissants.forEach(croissant => {
        ctx.drawImage(croissantImg, croissant.x, croissant.y, croissant.width, croissant.height);
    });

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = "brown";
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });

    // Draw score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    if (isGameOver) {
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    }
}

// Main game loop
function gameLoop() {
    if (!isGameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game
createCroissants();
gameLoop();
