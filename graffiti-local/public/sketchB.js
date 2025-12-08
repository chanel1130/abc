let myImg;
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;
let lastDist = null; //last distance between two fingers

let fitScale = 1; //fit the window

let socket;
let allGraffiti = [];

function preload() {
  //get the graffiti the user drew on pageA from localStorage
  let base64 = localStorage.getItem("savedGraffiti");
  if (base64) {
    myImg = loadImage(base64);
  }
}

function setup() {
  socket = io();

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");


  // canvas.touchMoved(() => false);

  // fit the initial size to the window
  if (myImg) {
    fitScale = min(width / myImg.width, height / myImg.height);
  }

  // load historical graffiti
  fetch("/graffiti")
    .then(res => res.json())
    .then(data => {
      allGraffiti = data.map(g => ({
        ...g,
        img: loadImage(g.img)
      }));
    });

  socket.on("newGraffiti", data => {
    data.img = loadImage(data.img);
    allGraffiti.push(data);
  });

  document.getElementById("backBtn").onclick = confirmAndBack;
}

function draw() {
  background(0);

  // draw the historical graffiti
  for (let g of allGraffiti) {
    push();
    translate(g.x, g.y);
    scale(g.scale);
    image(g.img, 0, 0);
    pop();
  }

  // draw the graffiti that the user is editing
  if (myImg) {
    push();
    translate(offsetX, offsetY);
    scale(scaleFactor * fitScale);
    image(myImg, 0, 0);
    pop();
  }
}

function touchMoved() {
  if (!myImg) return false;

  // one finger - adjust the position
  if (touches.length === 1) {
    if (lastTouchX != null) {
      offsetX += touches[0].x - lastTouchX;
      offsetY += touches[0].y - lastTouchY;
    }
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
  }

  // two fingers - adjust the size
  if (touches.length === 2) {
    //distance between the first and second fingers
    let d = dist(
      touches[0].x, touches[0].y,
      touches[1].x, touches[1].y
    );

    if (lastDist !== null) {
      scaleFactor *= d / lastDist;
      scaleFactor = constrain(scaleFactor, 0.3, 8);
    }
    lastDist = d;


    lastTouchX = null;
    lastTouchY = null;
  }

  return false;
}

function touchEnded() {
  //clear
  lastTouchX = null;
  lastTouchY = null;
  if (touches.length < 2) {
    lastDist = null;
  }
}


function confirmAndBack() {
  if (!myImg) {
    window.location.href = "pageA.html";
    return;
  }

  socket.emit("confirmGraffiti", {
    img: myImg.canvas.toDataURL("image/png"),
    x: offsetX,
    y: offsetY,
    scale: scaleFactor * fitScale
  });

  localStorage.removeItem("savedGraffiti");

  window.location.href = "pageA.html";
}
