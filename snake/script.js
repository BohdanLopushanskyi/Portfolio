const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const speedInput = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');
const gridSelect = document.getElementById('gridSize');
const status = document.getElementById('status');
const btnPause = document.getElementById('btnPause');
const btnRestart = document.getElementById('btnRestart');
const toggleWrapBtn = document.getElementById('toggleWrap');
const wrapLabel = document.getElementById('wrapLabel');
const saveHighBtn = document.getElementById('saveHigh');
const touchControls = document.getElementById('touchControls');

// Game settings
let grid = parseInt(gridSelect.value, 10);
let speed = parseInt(speedInput.value, 10);
let tileSize = Math.floor(canvas.width / grid);
let lastTime = 0;
let accumulated = 0;
let running = true;
let wrap = true;

// Game state
let score = 0;
let high = parseInt(localStorage.getItem('snake_high') || '0', 10);
highEl.textContent = high;

let snake = [];
let dir = {x:1, y:0};
let nextDir = {...dir};
let apple = null;
let growing = 0;
let gameOver = false;

// Reset game
function reset() {
  grid = parseInt(gridSelect.value, 10);
  tileSize = Math.floor(canvas.width / grid);
  speed = parseInt(speedInput.value, 10);
  speedLabel.textContent = speed;

  accumulated = 0;
  lastTime = 0;
  running = true;
  gameOver = false;

  score = 0;
  scoreEl.textContent = score;

  dir = {x:1, y:0};
  nextDir = {...dir};
  snake = [];

  const startLen = 4;
  const mid = Math.floor(grid/2);
  for (let i=0;i<startLen;i++){
    snake.push({x:mid - i, y:mid});
  }

  placeApple();
  status.textContent = 'Playing — good luck!';
}

function placeApple() {
  while (true) {
    const ax = Math.floor(Math.random()*grid);
    const ay = Math.floor(Math.random()*grid);
    if (!snake.some(s => s.x === ax && s.y === ay)) {
      apple = {x:ax,y:ay};
      return;
    }
  }
}

// Game tick
function step() {
  if (gameOver) return;

  if ((nextDir.x !== -dir.x || nextDir.y !== -dir.y) || snake.length===1) {
    dir = nextDir;
  }

  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  // Wrap walls
  if (wrap) {
    if (head.x < 0) head.x = grid-1;
    if (head.x >= grid) head.x = 0;
    if (head.y < 0) head.y = grid-1;
    if (head.y >= grid) head.y = 0;
  } else {
    if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid) {
      return die();
    }
  }

  // Self collision
  if (snake.some(cell => cell.x === head.x && cell.y === head.y)) {
    return die();
  }

  snake.unshift(head);

  // Apple
  if (head.x === apple.x && head.y === apple.y) {
    score += 10;
    scoreEl.textContent = score;
    growing += 2;
    placeApple();
  }

  if (growing > 0) {
    growing--;
  } else {
    snake.pop();
  }
}

function die() {
  gameOver = true;
  running = false;

  status.textContent = 'Game Over — press R to restart';

  if (score > high) {
    high = score;
    highEl.textContent = high;
    localStorage.setItem('snake_high', high);
    status.textContent = 'New High Score!';
  }
}

// Drawing
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Grid lines subtle
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#fff';
  for (let i=0;i<grid;i++){
    ctx.fillRect(i*tileSize,0,1,canvas.height);
    ctx.fillRect(0,i*tileSize,canvas.width,1);
  }
  ctx.restore();

  // Apple
  const grad = ctx.createRadialGradient(
    (apple.x+0.5)*tileSize, (apple.y+0.5)*tileSize, tileSize*0.1,
    (apple.x+0.5)*tileSize, (apple.y+0.5)*tileSize, tileSize*0.8
  );
  grad.addColorStop(0,'#ffd4d4');
  grad.addColorStop(0.5,'#ff8b8b');
  grad.addColorStop(1,'#ff6b6b');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.roundRect(
    apple.x*tileSize + tileSize*0.1,
    apple.y*tileSize + tileSize*0.1,
    tileSize*0.8,
    tileSize*0.8,
    tileSize*0.18
  );
  ctx.fill();

  // Snake
  for (let i=snake.length-1;i>=0;i--){
    const s = snake[i];
    const x = s.x*tileSize;
    const y = s.y*tileSize;

    if (i===0){
      ctx.fillStyle = '#b7ffe0';
    } else {
      const t = i / (snake.length-1);
      ctx.fillStyle = `rgba(${Math.floor(39+100*t)},${Math.floor(224-80*t)},${Math.floor(138-60*t)},1)`;
    }

    ctx.beginPath();
    ctx.roundRect(x+2, y+2, tileSize-4, tileSize-4, tileSize*0.2);
    ctx.fill();
  }
}

// Main loop
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime)/1000;
  lastTime = timestamp;

  if (running && !gameOver){
    accumulated += delta;
    const secPerStep = 1/speed;

    while (accumulated >= secPerStep) {
      step();
      accumulated -= secPerStep;
    }
  }

  draw();
  requestAnimationFrame(loop);
}

// Input
const keyMap = {
  ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
  w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0}
};

window.addEventListener('keydown', e=>{
  if (e.key === 'p') {
    running = !running;
    btnPause.textContent = running ? 'Pause' : 'Resume';
  }
  if (e.key === 'r') reset();

  const k = e.key.toLowerCase();
  if (keyMap[k]){
    const nd = keyMap[k];
    if (nd.x === -dir.x && nd.y === -dir.y) return;
    nextDir = nd;
  }
});

// Touch controls
touchControls.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const map = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const nd = map[btn.dataset.dir];
    if (nd.x === -dir.x && nd.y === -dir.y) return;
    nextDir = nd;
  });
});

// Resize
function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const size = Math.min(rect.width, window.innerHeight*0.75);
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// UI
btnPause.addEventListener('click', ()=>{
  running = !running;
  btnPause.textContent = running ? 'Pause (P)' : 'Resume (P)';
});

btnRestart.addEventListener('click', reset);

gridSelect.addEventListener('change', reset);

speedInput.addEventListener('input', ()=>{
  speed = parseInt(speedInput.value,10);
  speedLabel.textContent = speed;
});

toggleWrapBtn.addEventListener('click', ()=>{
  wrap = !wrap;
  wrapLabel.textContent = wrap ? "ON" : "OFF";
});

saveHighBtn.addEventListener('click', ()=>{
  localStorage.setItem('snake_high', high);
});

// Start
reset();
requestAnimationFrame(loop);