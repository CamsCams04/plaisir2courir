const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const runnerRunning1 = new Image();
const runnerRunning2 = new Image();
const runnerJumping = new Image();
const hedge = new Image();
const ground = new Image();
const road = new Image();

runnerRunning1.src = "../img/courreur1.png";
runnerRunning2.src = "../img/courreur2.png";
runnerJumping.src = "../img/courreur3.png";
hedge.src = "../img/haie.png";
ground.src = "../img/gourde.png";
road.src = "../img/route.png";

const runner = {
    x: 50,
    y: 140,
    width: 50,
    height: 50,
    isJumping: false,
    isLongJump: false,
    jumpSpeed: 0,
    gravity: 0.5,
    image: runnerRunning1,
    currentFrame: 0,
    animationFrames: [runnerRunning1, runnerRunning2],
};

const obstacles = [];
let score = 0;

const ANIMATION_FRAME_RATE = 10;
let animationCounter = 0;

let lastSpacePressTime = 0;
const DOUBLE_PRESS_DELAY = 200;

let obstacleSpeed = 5;
let runnerSpeed = 5;
let SPEED_INCREASE_INTERVAL = 50;
const OBSTACLE_INTERVAL = 1500;

let lastObstacleTime = 0;

const modal = new bootstrap.Modal(document.getElementById("gameOverModal"));
const replayButton = document.getElementById('replayButton');
const view_score = document.getElementById("nb_gourde");

let isGameRunning = false;
let animationFrameId;

function startGame() {
    resetGame();
    isGameRunning = true;
    gameLoop();
}

function resetGame() {
    runner.x = 50;
    runner.y = 140;
    runner.isJumping = false;
    runner.isLongJump = false;
    runner.jumpSpeed = 0;
    score = 0;
    obstacles.length = 0;
    obstacleSpeed = 5;
    runnerSpeed = 5;
    lastObstacleTime = Date.now();
}

function updateRunner() {
    if (runner.isJumping) {
        runner.y -= runner.jumpSpeed;
        runner.jumpSpeed -= runner.gravity;
        if (runner.y >= 140) {
            runner.y = 140;
            runner.isJumping = false;
            runner.jumpSpeed = 0;
        }
        runner.image = runnerJumping;
    } else {
        animationCounter++;
        if (animationCounter >= ANIMATION_FRAME_RATE) {
            runner.currentFrame = (runner.currentFrame + 1) % runner.animationFrames.length;
            runner.image = runner.animationFrames[runner.currentFrame];
            animationCounter = 0;
        }
    }
}

function generateObstacle() {
    const obstacle = {
        x: canvas.width,
        y: 145,
        width: 20,
        height: 50,
        image: hedge
    };
    obstacles.push(obstacle);
}

function generateGround() {
    const groundItem = {
        x: canvas.width,
        y: 150,
        width: 20,
        height: 20,
        image: ground
    };
    obstacles.push(groundItem);
}

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacleSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        if (runner.x < obstacle.x + obstacle.width &&
            runner.x + runner.width > obstacle.x &&
            runner.y < obstacle.y + obstacle.height &&
            runner.y + runner.height > obstacle.y) {
            if (obstacle.image === hedge) {
                // Collision avec un obstacle, fin de partie
                isGameRunning = false;
                cancelAnimationFrame(animationFrameId);
                modal.show();
                return;
            } else if (obstacle.image === ground) {
                // Collision avec une gourde, augmenter le score
                score += 10;
                const formattedScore = (score/10).toString().padStart(3, '0');
                view_score.textContent = formattedScore;

                obstacles.splice(i, 1);
                i--;
            }
        }
    }
}

function updateSpeed() {
    if (score >= SPEED_INCREASE_INTERVAL) {
        obstacleSpeed += 0.5; // Augmenter la vitesse des obstacles
        runnerSpeed += 0.5; // Augmenter la vitesse du coureur (si nécessaire)
        SPEED_INCREASE_INTERVAL += 50; // Augmenter le seuil pour la prochaine augmentation de vitesse
        console.log("Speed increased");
    }
}

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la route
    ctx.drawImage(road, 0, 180, canvas.width, 20);

    // Mettre à jour le coureur
    updateRunner();
    ctx.drawImage(runner.image, runner.x, runner.y, runner.width, runner.height);

    // Mettre à jour et dessiner les obstacles (haies et gourdes)
    updateObstacles();
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Générer de nouveaux obstacles et gourdes
    if (Date.now() - lastObstacleTime > OBSTACLE_INTERVAL) {
        if (Math.random() < 0.5) {
            generateObstacle();
        } else {
            generateGround();
        }
        lastObstacleTime = Date.now();
    }

    checkCollision();
    updateSpeed();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function imagesLoaded(callback) {
    let imagesToLoad = 6;
    let loadedImages = 0;

    function checkAllLoaded() {
        if (loadedImages === imagesToLoad) {
            callback();
        }
    }

    function onImageLoad() {
        loadedImages++;
        checkAllLoaded();
    }

    runnerRunning1.onload = onImageLoad;
    runnerRunning2.onload = onImageLoad;
    runnerJumping.onload = onImageLoad;
    hedge.onload = onImageLoad;
    ground.onload = onImageLoad;
    road.onload = onImageLoad;
}

function handleKeyPress(event) {
    if (event.code === 'Space') {
        if (!isGameRunning) {
            startGame();
        } else if (!runner.isJumping) {
            runner.isJumping = true;
            runner.isLongJump = false;
            runner.jumpSpeed = 10;
        }
    }
}

function handleTouchStart(event) {
    event.preventDefault(); // Empêche le comportement par défaut du toucher
    if (!isGameRunning) {
        startGame();
    } else {
        jump();
    }
}

// Cacher le bouton "Jump" sur les écrans plus larges
function updateJumpButtonVisibility() {
    const jumpButton = document.getElementById('jumpButton');
    if (window.innerWidth < 768) {
        jumpButton.classList.remove('hidden');
    } else {
        jumpButton.classList.add('hidden');
    }
}

function jump() {
    if (!runner.isJumping) {
        runner.isJumping = true;
        runner.isLongJump = false;
        runner.jumpSpeed = 10;
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.4;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initialiser la taille du canevas
updateJumpButtonVisibility();

const jumpButton = document.getElementById('jumpButton');
jumpButton.addEventListener('click', (event) => {
    handleTouchStart(event)
});

const startButton = document.getElementById("start");
startButton.addEventListener("click", (event)=>{
    jumpButton.classList.remove("d-none");
    startButton.classList.add("d-none");
    handleTouchStart(event);
})

replayButton.addEventListener('click', () => {
    modal.hide();
    startGame();
});

document.addEventListener('keydown', handleKeyPress);
