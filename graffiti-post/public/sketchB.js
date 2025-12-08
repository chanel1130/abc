let myImg;
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;
let lastDist = null; //last distance between two fingers
let lastTouchX = null;
let lastTouchY = null;
let rotation = 0;
let lastAngle = null;

let fitScale = 1; //fit the window

let socket;
let allGraffiti = [];



function preload() {
  //get the graffiti the user drew on pageA from localStorage
  // let base64 = localStorage.getItem("savedGraffiti");
  // if (base64) {
  //   myImg = loadImage(base64);
  // }

  let url = localStorage.getItem("savedGraffitiURL");
  if (url) {
    myImg = loadImage(
      url,
      img => {
        console.log("loaded OK");

        // calculate fitScale after image is loaded
        fitScale = 0.5 * min(windowWidth / img.width, windowHeight / img.height);
      },
      () => {
        console.warn("File missing");
        localStorage.removeItem("savedGraffitiURL");
        window.location.href = "pageA.html";
      }
    );
  }
}

function setup() {
  socket = io();

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  document.getElementById("backBtn").addEventListener("click",confirmAndBack)


  canvas.elt.addEventListener("touchstart", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  canvas.elt.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  canvas.elt.addEventListener("gesturestart", e => e.preventDefault());
  canvas.elt.addEventListener("gesturechange", e => e.preventDefault());
  canvas.elt.addEventListener("gestureend", e => e.preventDefault());


  // canvas.elt.addEventListener("touchstart", (e) => {
  //   if (e.touches.length > 1) e.preventDefault();
  // }, { passive: false });

  // canvas.elt.addEventListener("touchmove", (e) => {
  //   if (e.touches.length > 1) e.preventDefault();
  // }, { passive: false });


  // canvas.touchMoved(() => false);

  // fit the initial size to the window
  // if (myImg) {
  //   fitScale = min(width / myImg.width, height / myImg.height);
  // }

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

 
}

function draw() {
  background(0);

  // draw the historical graffiti
  for (let g of allGraffiti) {
    push();
    translate(g.x, g.y);
    scale(g.scale);
    rotate(g.rotation || 0);
    imageMode(CENTER);
    image(g.img, 0, 0);
    pop();
  }

  // draw the graffiti that the user is editing
  if (myImg) {
    push();
    // translate(offsetX, offsetY);
    translate(offsetX + myImg.width * scaleFactor * fitScale / 2,
      offsetY + myImg.height * scaleFactor * fitScale / 2);
    imageMode(CENTER);
    scale(scaleFactor * fitScale);
    rotate(rotation);
    image(myImg, 0, 0);

    //draw the bounding box
    noFill();
    rectMode(CENTER);
    strokeWeight(0.1);
    stroke(0, 0, 255, 180);
    strokeWeight(3 / (scaleFactor * fitScale));
    rect(0, 0, myImg.width, myImg.height);


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

    //rotation
    let angle = atan2(
      touches[1].y - touches[0].y,
      touches[1].x - touches[0].x
    );

    if (lastAngle !== null) {
      let delta = angle - lastAngle;
      rotation += delta;
    }

    lastAngle = angle;


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
    lastAngle = null;
  }
}


function confirmAndBack() {
  if (!myImg) {
    window.location.href = "pageA.html";
    return;
  }


  const realScale = scaleFactor * fitScale;

  const centerX = offsetX + (myImg.width * realScale) / 2;
  const centerY = offsetY + (myImg.height * realScale) / 2;


  socket.emit("confirmGraffiti", {
    // img: myImg.canvas.toDataURL("image/png"),
    img: localStorage.getItem("savedGraffitiURL"),
    x: centerX,
    y: centerY,
    scale: scaleFactor * fitScale,
    rotation: rotation
  });

  localStorage.removeItem("savedGraffitiURL");

  window.location.href = "pageA.html";
}
