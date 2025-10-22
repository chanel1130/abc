let alpha, beta, gamma = 0;
//map the canvas in width
let t;
//color 1
let c1;
//color 2
let c2;
//initial circle size
let circleSize = 10;
//when touching screen
let targetSize = 20;

function setup() {
  c1 = color(0, 150, 255);
  // c1 = color(255, 150, 255);
  c2 = color(0, 255, 150);
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  background(0);
}

function draw() {

  // background(0, 20)
  //clear the canvas if flipping the phone on the beta axis
  if (beta < -150 || beta > 150) {
    background(0);
  }

  //map gamma - posX, beta - poxY
  posX = map(gamma, -60, 60, 0, windowWidth);
  posY = map(beta, -30, 80, 0, windowHeight);
  t = map(posX, 0, windowWidth, 0, 1);
  c = lerpColor(c1, c2, t);

  circleSize = lerp(circleSize, targetSize, 0.01);

  // fill(255,255,255);
  // stroke(c);
  // circle(posX, posY, circleSize);

  fill(c);
  noStroke();
  drawMirroredCircles(posX, posY, circleSize);

  noStroke();
  fill(0, 150);
  rect(0, 0, 150, 60);
  fill(255,255,255);
  text("alpha: " + round(alpha), 10, 30);
  text("beta: " + round(beta), 10, 40);
  text("gamma: " + round(gamma), 10, 50);
}

function drawMirroredCircles(x, y, s) {
  
  let cx = width / 2;
  let cy = height / 2;

  let dx = x - cx;
  let dy = y - cy;


  // circle(x,y,s);
  circle(cx + dx, cy + dy, s);   // original
  circle(cx - dx, cy + dy, s);   // vertical 
  circle(cx + dx, cy - dy, s);   // horizontal
  circle(cx - dx, cy - dy, s);   
}


// P5 touch events: https://p5js.org/reference/#Touch

function touchStarted() {
  console.log(touches);
  //increase the target size if holding on the screen
  targetSize = 120;
}

function touchMoved() {
}

function touchEnded() {
  //circle size goes back to normal if releasing
  targetSize = 10;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function handleOrientation(eventData) {
  document.querySelector('#requestOrientationButton').style.display = "none";

  console.log(eventData.alpha, eventData.beta, eventData.gamma);

  alpha = eventData.alpha;
  beta = eventData.beta;
  gamma = eventData.gamma;

}
