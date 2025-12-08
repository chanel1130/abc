// const { scale } = require("framer-motion");

function getOrCreateUserId() {
  // check if we have a userID already in local storage

  // if yes, return it
  let id = localStorage.getItem("chat-user-id");
  if (!id) {
    // if not, create one and return it (first time)
    id = 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("chat-user-id", id);
  }
  return id;
}

const myUserId = getOrCreateUserId();
console.log('My userId:', myUserId);



let myImg;
let myImgData;

let fitScale = 1; //fit the window
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;


let lastDist = null; //last distance between two fingers
let lastTouchX = null;
let lastTouchY = null;
let rotation = 0;
let lastAngle = null;


let socket;


let allGraffiti = [];



// function preload() {
// }

function setup() {
  socket = io();

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  document.getElementById("backBtn").addEventListener("click", confirmAndBack)


  canvas.elt.addEventListener("touchstart", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  canvas.elt.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  canvas.elt.addEventListener("gesturestart", e => e.preventDefault());
  canvas.elt.addEventListener("gesturechange", e => e.preventDefault());
  canvas.elt.addEventListener("gestureend", e => e.preventDefault());




  // load historical graffiti
  // fetch("/graffiti")
  //   .then(res => res.json())
  //   .then(data => {
  //     allGraffiti = data.allGraffiti.map(g => ({
  //       ...g,
  //       img: loadImage(g.img)
  //     }));

  //     const currentGraffiti = data.currentGraffiti[socket.id];
  //     if (currentGraffiti && currentGraffiti.img) {
  //       loadImage(currentGraffiti.img, img => {
  //         myImg = img;

  //         fitScale = 0.5 * min(windowWidth / img.width, windowHeight / img.height);

  //         offsetX = windowWidth / 2 - (img.width * fitScale) / 2;
  //         offsetY = windowHeight / 2 - (img.height * fitScale) / 2;

  //         console.log("Current graffiti loaded");
  //       });
  //     }
  //   })



  socket.on("allGraffiti", function (data) {
    console.log("allGraffiti", data);


    for (d of data) {



      // which one is my own
      if (d.userId == myUserId && d.locationConfirmed == false) {
        console.log(d, "is mine");
        myImgData = d;

        loadImage(d.imgURL, img => {
          myImg = img;

          fitScale = 0.5 * min(windowWidth / img.width, windowHeight / img.height);
          offsetX = windowWidth / 2;
          offsetY = windowHeight / 2;


          console.log("Current graffiti loaded");
        });



      } else {

        // d.img = loadImage(d.imgURL);
        // allGraffiti.push(d);
        d.img = loadImage(d.imgURL, img => {
          d.img = img;
          d.timestamp = d.timestamp || Date.now();

        });
        allGraffiti.push(d);

      }
    }
  })



  //when other users are editing their graffiti, update in real time
  socket.on("othersEditingGraffiti", updated => {

    // find the according graffiti
    let target = allGraffiti.find(g => g.drawingId === updated.drawingId);

    if (target) {
      target.x = updated.offsetX;
      target.y = updated.offsetY;
      target.scaleFactor = updated.scaleFactor;
      target.rotation = updated.rotation;
    }
  });


  // socket.on("newGraffiti", data => {
  //   data.img = loadImage(data.img);
  //   allGraffiti.push(data);
  // });




}

function draw() {
  background(0);


  // draw the historical graffiti
  for (let g of allGraffiti) {
    push();
    translate(g.x, g.y);
    // translate(g.offsetX, g.offsetY);
    scale(g.scaleFactor);
    rotate(g.rotation || 0);
    imageMode(CENTER);

    let ageSec = (Date.now() - g.timestamp) / 1000;
    let opacity = 255;
    if (ageSec > 60 && ageSec <= 120) {
      opacity = 80;
    } else if (ageSec > 120) {
      opacity = 50;
    }
    tint(255, opacity);

    image(g.img, 0, 0);




    if (g.userId != myUserId && g.locationConfirmed == false) {
      noFill();
      rectMode(CENTER);
      strokeWeight(0.1);
      stroke(255, 50);
      strokeWeight(3 / g.scaleFactor);
      rect(0, 0, g.img.width, g.img.height);

    }
    pop();
  }

  // draw the graffiti that the user is editing
  if (myImg) {
    push();
    translate(offsetX, offsetY);
    imageMode(CENTER);
    scale(scaleFactor * fitScale);
    // scale(scaleFactor);
    // scale(0.5)
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

  // setInterval(() => {
  //   if (!myImg || !myImgData) return;
  //   socket.emit("editingGraffiti", {
  //     userId: myUserId,
  //     drawingId: myImgData.drawingId,
  //     x: offsetX,
  //     y: offsetY,
  //     scaleFactor: scaleFactor * fitScale,
  //     rotation: rotation
  //   });
  // }, 100);
}

function touchMoved() {
  if (!myImg) return false;

  // one finger - adjust the position
  if (touches.length === 1) {
    if (lastTouchX != null) {
      offsetX += touches[0].x - lastTouchX;
      offsetY += touches[0].y - lastTouchY;

      // send to server
      // "adjustingLocation"
      // drawingId
      // and the x and y 

      socket.emit("editingGraffiti", {
        userId: myUserId,
        drawingId: myImgData.drawingId,
        x: offsetX,
        y: offsetY,
        scaleFactor: scaleFactor * fitScale,
        rotation: rotation
      })

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

      socket.emit("editingGraffiti", {
        userId: myUserId,
        drawingId: myImgData.drawingId,
        x: offsetX,
        y: offsetY,
        scaleFactor: scaleFactor * fitScale,
        rotation: rotation
      })
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

      socket.emit("editingGraffiti", {
        userId: myUserId,
        drawingId: myImgData.drawingId,
        x: offsetX,
        y: offsetY,
        scaleFactor: scaleFactor * fitScale,
        rotation: rotation
      })
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
  // socket.emit("confirmGraffiti", {
  //   // img: myImg.canvas.toDataURL("image/png"),
  //   img: localStorage.getItem("savedGraffitiURL"),
  //   x: centerX,
  //   y: centerY,
  //   scale: scaleFactor * fitScale,
  //   rotation: rotation
  // });

  // localStorage.removeItem("savedGraffitiURL");


  if (!myImg) {
    window.location.href = "pageA.html";
    return;
  }


  socket.emit("saveFinalizedGraffitiToServer", {
    drawingId: myImgData.drawingId,
    x: offsetX,
    y: offsetY,
    scale: scaleFactor * fitScale,
    rotation: rotation

  })



  window.location.href = "pageA.html";
}
