// Oyun değişkenleri
let username = '';
let score = 0;
let highScores = [];
let gameInterval, obstacleInterval;
let isJumping = false;
let velocityY = 0;
let gravity = 0.7;
let gameOver = false;
let gameSpeed = 7;
let minObstacleInterval = 800;
let maxObstacleInterval = 1800;
let nextObstacleTimeout;

// Canvas ve context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Görseller
const playerImg = new Image();
playerImg.src = 'assets/anoma2.png';
const obstacleImg = new Image();
obstacleImg.src = 'assets/anoma4.png';
const bgImg = new Image();
bgImg.src = 'assets/anoma6.png';

// Platform ayarları
const PLATFORM_HEIGHT = 30;
const PLATFORM_Y = () => canvas.height * 0.85;
const PLAYER_SIZE = 60;
const OBSTACLE_SIZE = 70;

// Karakter ve engel objeleri
const player = {
  x: 50,
  y: 0, // Başlangıçta platformun üstüne ayarlanacak
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  draw() {
    ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
  }
};

let obstacles = [];

function createObstacle() {
  obstacles.push({
    x: canvas.width,
    y: PLATFORM_Y() - OBSTACLE_SIZE,
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE
  });
  // Sonraki engel için rastgele bir süre belirle
  const nextInterval = Math.floor(Math.random() * (maxObstacleInterval - minObstacleInterval + 1)) + minObstacleInterval;
  nextObstacleTimeout = setTimeout(createObstacle, nextInterval);
}

function resizeCanvas() {
  // Hem canvas boyutunu hem de CSS boyutunu pencereyle eşleştir
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Ekranlar
const usernameScreen = document.getElementById('username-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDiv = document.getElementById('score');
const finalScoreDiv = document.getElementById('final-score');
const leaderboardOl = document.getElementById('leaderboard');

// Kullanıcı adı girip başlatma
startBtn.onclick = () => {
  const val = usernameInput.value.trim();
  if (val.length > 0) {
    username = val;
    usernameScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    startGame();
  }
};

restartBtn.onclick = () => {
  gameoverScreen.style.display = 'none';
  usernameScreen.style.display = 'flex';
  usernameInput.value = '';
};

function startGame() {
  score = 0;
  obstacles = [];
  isJumping = false;
  velocityY = 0;
  gameOver = false;
  player.y = PLATFORM_Y() - PLAYER_SIZE;
  scoreDiv.textContent = 'Intent: 0';
  gameSpeed = 7;
  minObstacleInterval = 800;
  maxObstacleInterval = 1800;
  document.addEventListener('keydown', handleJump);
  gameInterval = setInterval(gameLoop, 1000 / 60);
  // İlk engel için başlat
  if (nextObstacleTimeout) clearTimeout(nextObstacleTimeout);
  nextObstacleTimeout = setTimeout(createObstacle, 1200);
  resizeCanvas();
}

function endGame() {
  clearInterval(gameInterval);
  if (nextObstacleTimeout) clearTimeout(nextObstacleTimeout);
  document.removeEventListener('keydown', handleJump);
  gameScreen.style.display = 'none';
  gameoverScreen.style.display = 'flex';
  finalScoreDiv.textContent = `You won +${score} intent`;
  saveScore();
  renderLeaderboard();
}

function handleJump(e) {
  if ((e.code === 'Space' || e.key === ' ') && !isJumping && !gameOver) {
    isJumping = true;
    velocityY = -16;
  }
}

function gameLoop() {
  // Arka planı tam ekran ölçekle
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  // Platformu çiz
  ctx.fillStyle = '#b31217';
  ctx.fillRect(0, PLATFORM_Y(), canvas.width, PLATFORM_HEIGHT);
  // Karakter
  player.y += velocityY;
  velocityY += gravity;
  const groundY = PLATFORM_Y() - PLAYER_SIZE;
  if (player.y > groundY) {
    player.y = groundY;
    isJumping = false;
  }
  player.draw();
  // Engeller
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= gameSpeed;
    ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
    // Çarpışma kontrolü
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver = true;
      endGame();
      return;
    }
  }
  // Ekran dışına çıkan engelleri sil
  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
  // Skor
  score++;
  scoreDiv.textContent = 'Intent: ' + score;
  // Oyun hızını ve engel aralığını artır
  if (score % 200 === 0 && gameSpeed < 18) {
    gameSpeed += 0.7;
    if (minObstacleInterval > 1000) minObstacleInterval -= 50;
    if (maxObstacleInterval > 1200) maxObstacleInterval -= 50;
  }
}

function saveScore() {
  const scores = JSON.parse(localStorage.getItem('anoma_leaderboard') || '[]');
  scores.push({ username, score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('anoma_leaderboard', JSON.stringify(scores.slice(0, 10)));
}

function renderLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('anoma_leaderboard') || '[]');
  leaderboardOl.innerHTML = '';
  scores.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.textContent = `${idx + 1}. ${entry.username} - ${entry.score}`;
    leaderboardOl.appendChild(li);
  });
} 