let value = 0;
let circles = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
}

function draw() {
  background(90, 200, 190);

  // fill(0, 0, value);
  // circle(width/2, height/2, 100);

  // fill(255, 255, 255);
  // for (let c of circles) {
  //   circle(c.x, c.y, 40);
  // }
  
  noStroke();
  for (const t of touches) {
    fill(255, 255, 255, 0);
    circle(t.x, t.y, 200);
    fill(255, 255, 255, 50);
    circle(t.x, t.y, 180);
     fill(255, 255, 255, 50);
    circle(t.x, t.y, 150);
  }
}

// P5 touch events: https://p5js.org/reference/#Touch

function touchStarted() {
  console.log(touches);

  if (value === 0) {
    value = 255;
  } else {
    value = 0;
  }

  // To save dots on the screen
  // for (let t of touches) {
  //   circles.push({x: t.x, y: t.y});
  // }



}


function touchMoved() {

}

function touchEnded() {

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

