let shapes = []; // save finished shapes

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(90, 200, 190);


  stroke(0);
  strokeWeight(3);
  fill(255, 0, 0, 60);
  for (const shape of shapes) {
    beginShape();
    for (const pt of shape) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);
  }

  // count how many fingers
  let n = touches.length;
  if (n >= 2) {
    stroke(0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (const t of touches) {
      vertex(t.x, t.y);
    }
    endShape(CLOSE);
  }

  // draw finger points
  noStroke();
  fill(255, 0, 0);
  for (const t of touches) {
    circle(t.x, t.y, 20);
  }
}

// save the shapes when the touch ends
function touchEnded() {
  if (touches.length === 0) {
    if (__touches && __touches.length >= 2) {
      shapes.push(__touches.map(t => ({ x: t.x, y: t.y })));
    }
  }
  return false;
}

let __touches = [];
function touchMoved() {
  __touches = touches.map(t => ({ x: t.x, y: t.y }));
  return false;
}
function touchStarted() {
  __touches = touches.map(t => ({ x: t.x, y: t.y }));
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
