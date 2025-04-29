const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const scoreEl = document.getElementById("score");
const eatSound = document.getElementById("eatSound");
const crashSound = document.getElementById("crashSound");

let box = 20;
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let snake = [];
let food = {};
let direction = "RIGHT";
let score = 0;
let gameInterval = null;
let speed = 150;
let paused = false;

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvasWidth / box)) * box,
    y: Math.floor(Math.random() * (canvasHeight / box)) * box,
  };
}

function resetGameState() {
  snake = [{ x: Math.floor(canvasWidth / 2 / box) * box, y: Math.floor(canvasHeight / 2 / box) * box }];
  direction = "RIGHT";
  food = spawnFood();
  score = 0;
  speed = 150;
  paused = false;
  scoreEl.textContent = "分數：0";
}

function drawGame() {
  if (paused) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#0f0" : "#3f3";
    ctx.fillRect(s.x, s.y, box, box);
  });

  // Draw food
  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x, food.y, box, box);

  // Move snake
  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  // Check collision with walls or itself
  if (
    head.x < 0 || head.x >= canvasWidth ||
    head.y < 0 || head.y >= canvasHeight ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    crashSound.play();
    clearInterval(gameInterval);
    pauseBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
    return;
  }

  snake.unshift(head);

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    score++;
    scoreEl.textContent = "分數：" + score;
    food = spawnFood();

    // Increase speed
    if (score % 5 === 0 && speed > 50) {
      speed -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(drawGame, speed);
    }
  } else {
    snake.pop();
  }
}

function startGame() {
  resetGameState();
  startBtn.style.display = "none";
  restartBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  scoreEl.textContent = "倒數 3 秒開始遊戲...";

  let count = 3;
  const countdown = setInterval(() => {
    if (count === 0) {
      clearInterval(countdown);
      gameInterval = setInterval(drawGame, speed);
      scoreEl.textContent = "分數：0";
    } else {
      scoreEl.textContent = `倒數 ${count--} 秒...`;
    }
  }, 1000);
}

function restartGame() {
  clearInterval(gameInterval);
  startGame();
}

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️ 繼續" : "⏸️ 暫停";
}

function changeDirection(e) {
  const key = e.key;
  if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

// Event listeners
document.addEventListener("keydown", changeDirection);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
pauseBtn.addEventListener("click", togglePause);

// Prevent page scroll on arrow key press
window.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});
