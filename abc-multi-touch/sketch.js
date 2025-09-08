let shapes = []; //save finished shapes
let __touches = []; //touching fingers
let balls = [];

let score = 0;
let lives = 3;

const MAX_BALLS = 20;   // number of balls on the screen
const BALL_LIFETIME = 10000; // lifetime of each ball
let bestScore = 0;

let gameState = "start"; // "start" | "play" | "gameover"

let titleFont;

function preload() {
  titleFont = loadFont("assets/Caveat.ttf");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  textAlign(CENTER, CENTER);

  //store the best score
  let savedBest = localStorage.getItem("bestScore");
  if (savedBest !== null) {
    bestScore = int(savedBest);
  }
}

function draw() {
  background(0);

  // for different pages
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "play") {
    drawGame();
  } else if (gameState === "gameover") {
    drawGameOver();
  }
}

// THE GAME PAGE
function drawGame() {
  let now = millis();

  // saved shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    let age = now - s.time;

    if (age > 1000) { // lifetime of each saved shape
      shapes.splice(i, 1);
      continue;
    }

    let alpha = map(age, 0, 1000, 100, 0);
    fill(0, 100, 200, alpha);
    stroke(0, 50, 150, alpha);
    strokeWeight(2);

    beginShape();
    for (let p of s.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  // shapes in real time (when the fingers are touching)
  if (__touches.length >= 2) {
    fill(50, 100, 255, 80);
    stroke(50, 50, 200);
    strokeWeight(2);
    beginShape();
    for (let p of __touches) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  // guiding coordinates (yellow balls) in real time
  noStroke();
  fill(255, 255, 0);
  for (let t of __touches) {
    circle(t.x, t.y, 20);
  }

  // generate balls in ratio
  if (frameCount % 30 === 0 && balls.length < MAX_BALLS) {
    let r = random();
    let colorType;
    if (r < 0.3) {
      colorType = "red";   // 30%
    } else if (r < 0.9) {
      colorType = "blue";  // 60%
    } else {
      colorType = "green"; // 10%
    }

    // push balls to the screen
    balls.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      color: colorType,
      born: millis()
    });
  }

  // draw and update the balls
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];

    // check the life time of each ball
    if (now - b.born > BALL_LIFETIME) {
      balls.splice(i, 1);
      continue;
    }

    // moving
    b.x += b.vx;
    b.y += b.vy;

    // bouncing
    if (b.x < 0 || b.x > width) b.vx *= -1;
    if (b.y < 0 || b.y > height) b.vy *= -1;

    // check if the ball is inside a shape
    let inside = false;
    for (let s of shapes) {
      if (ballInShape(b.x, b.y, s.points)) {
        inside = true;
        break;
      }
    }

    if (inside) {
      if (b.color === "blue") {
        score += 1;
      } else if (b.color === "red") {
        lives -= 1;
        if (lives <= 0) {
          gameState = "gameover";
        }
      } else if (b.color === "green") {
        if (lives < 3) lives += 1;
      }
      balls.splice(i, 1); // delete a ball inside a shape
    } else {
      if (b.color === "red") {
        fill(255, 100, 100);
      } else if (b.color === "blue") {
        fill(100, 100, 255);
      } else if (b.color === "green") {
        fill(100, 255, 100);
      }
      noStroke();
      circle(b.x, b.y, 20);
    }
  }

  // UI in the game page
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 15);

  textAlign(RIGHT, TOP);
  text("Lives: " + lives, width - 20, 15);
}

// THE STARTING PAGE
function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(64);
  textFont(titleFont);
  text("Net hunter", width / 2, height / 2 - 120);

  textSize(18);
  textFont('monospace');
  textAlign(LEFT, CENTER);

  // blue
  fill(100, 100, 255);
  circle(width / 2 - 50, height / 2 - 40, 15);
  fill(255);
  text("+1 Score", width / 2 - 30, height / 2 - 40);

  // red
  fill(255, 100, 100);
  circle(width / 2 - 50, height / 2, 15);
  fill(255);
  text("-1 Life", width / 2 - 30, height / 2);

  // green
  fill(100, 255, 100);
  circle(width / 2 - 50, height / 2 + 40, 15);
  fill(255);
  text("+1 Life", width / 2 - 30, height / 2 + 40);


  drawButton(width / 2 - 60, height / 2 + 100, 120, 50, "Start", () => {
    resetGame();
    gameState = "play";
  });
}

// THE ENDING PAGE
function drawGameOver() {

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(48);
  textFont(titleFont);
  text("Game Over", width / 2, height / 2 - 120);

  textSize(18);
  textFont('monospace');
  text("Final Score: " + score, width / 2, height / 2 - 30);
  text("History Best: " + bestScore, width / 2, height / 2 + 10);

  drawButton(width / 2 - 80, height / 2 + 60, 160, 50, "Restart", () => {
    resetGame();
    gameState = "play";
  });
}

// BUTTON
function drawButton(x, y, w, h, label, callback) {
  fill(200);
  rect(x, y, w, h, 10);
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);

  if (
    mouseIsPressed &&
    mouseX > x && mouseX < x + w &&
    mouseY > y && mouseY < y + h
  ) {
    callback();
  }
}

// TOUCH
function touchStarted() {
  __touches = touches.map(t => ({ x: t.x, y: t.y }));
  return false;
}
function touchMoved() {
  __touches = touches.map(t => ({ x: t.x, y: t.y }));
  return false;
}
function touchEnded() {
  if (__touches && __touches.length >= 2) {
    shapes.push({
      points: __touches.map(t => ({ x: t.x, y: t.y })),
      time: millis()
    });
  }
  __touches = [];
  return false;
}


function ballInShape(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x, yi = polygon[i].y;
    let xj = polygon[j].x, yj = polygon[j].y;

    let intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

// RESTART
function resetGame() {
  score = 0;
  lives = 3;
  shapes = [];
  balls = [];
}
