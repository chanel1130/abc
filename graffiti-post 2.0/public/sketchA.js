const prefix = location.pathname.replace(/\/$/, '');      
const socket = io({ path: prefix + '/socket.io' });

if (location.hostname.toLowerCase().startsWith('browsercircus') || location.hostname.toLowerCase().startsWith('www')) {
  socket = io({ path: "/chanel/port-4200/socket.io" });  // yields '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}


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

let myFont;
let canvas;
let touchingCanvas = false;
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

let lastX = null;
let lastY = null;

// let softBrushSize = 3;
// let lastSoftX = null;
// let lastSoftY = null;

//for a continuously drawing marker
let prevX, prevY;


let currentBrush = "spray";  // default
let currentColor = "#ff55ff";

function setBrush(name) {
  currentBrush = name;

  lastX = null;
  lastY = null;
  // console.log("Switched to:", name);
}



window.addEventListener("load", () => {
  // select the brush
  document.querySelectorAll(".brush-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentBrush = btn.dataset.brush;
      //remove the selected circle from every button
      document.querySelectorAll(".brush-btn").forEach(b => b.classList.remove("selected"));
      //add to the clicked button
      btn.classList.add("selected");
    });
  });

  // select the color
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentColor = btn.dataset.color;

      document.querySelectorAll(".color-btn").forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
});

// function preload() {
//   myFont = loadFont("https://fonts.gstatic.com/s/gloriahallelujah/v15/LYjDdGzzklQtCMpNq5E-oY9BbCBe.woff2");

// }

function setup() {
  socket = io();
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  // textFont(myFont);

  //call the saveDrawing function onclick
  // document.getElementById("saveBtn").onclick = saveDrawing;

  document.getElementById("saveBtn").addEventListener("click", saveDrawing);
  document.getElementById("clearBtn").onclick = () => {
    clear();
  };

  // document.getElementById("btn-soft").onclick = () => setBrush("soft");
  // document.getElementById("btn-spray").onclick = () => setBrush("spray");
  // document.getElementById("btn-fine").onclick = () => setBrush("fine");


  //enable toucheStarted only within the p5 canvas
  canvas.touchStarted(handleTouchStart);
  canvas.touchEnded(handleTouchEnd);



}

function draw() {

  noStroke();

  if (touchingCanvas) {
    for (const t of touches) {
      if (touches.length === 1) {

        if (prevX === undefined) {
          prevX = t.x;
          prevY = t.y;
        }

        if (currentBrush === "spray") sprayBrush(t.x, t.y);
        if (currentBrush === "marker") markerPen(prevX, prevY, t.x, t.y);
        if (currentBrush === "pen") finePen(t.x, t.y);

        prevX = t.x;
        prevY = t.y;
      } else {
        prevX = undefined;
        prevY = undefined;
      }



      minX = min(minX, t.x);
      minY = min(minY, t.y);
      maxX = max(maxX, t.x);
      maxY = max(maxY, t.y);
    }
  }


}


function handleTouchStart() {
  console.log("touch inside canvas:", touches);
  touchingCanvas = true;

  lastX = null;
  lastY = null;


  return false;
}

function handleTouchEnd() {
  console.log("touch ended");
  touchingCanvas = false;

  prevX = undefined;
  prevY = undefined;
  return false;
}

// function touchStarted() {
//   console.log(touches);
//   return false;
// }

// function touchMoved() {
// }

// function touchEnded() {

// }

function saveDrawing() {
  console.log("saving...");

  //Local Storage
  //canvas.els: elements on the canvas
  //.toDataURL: save the elements as a base64 string
  // let base64 = canvas.elt.toDataURL("image/png");
  // //add the item to localStorage
  // localStorage.setItem("savedGraffiti", base64);
  //go to pageB
  // window.location.href = "pageB.html";


  //Save the whole screen
  // canvas.elt.toBlob(blob => {
  //   fetch('/upload-graffiti', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'image/png' },
  //     body: blob
  //   })
  //     .then(r => r.json())
  //     .then(data => {
  //       console.log("Uploaded URL:", data.url);

  //       // save the URL sent from server to localStorage
  //       localStorage.setItem("savedGraffitiURL", data.url);
  //       // go to pageB
  //       window.location.href = "pageB.html";
  //     });
  // }, 'image/png');


  //Save the trimmed drawing
  if (minX === Infinity) {
    alert("You haven't drawn anything!");
    return;
  }
  //add some padding to the trimmed drawing
  let padding = 40;
  let cropW = (maxX - minX) + padding * 2;
  let cropH = (maxY - minY) + padding * 2;
  //create a new canvas for the trimmed drawing
  let gfx = createGraphics(cropW, cropH);
  //.copy() from p5.js
  //copy the drawn part to a new canvas
  //copy(srcImage, sx, sy, sw, sh, dx, dy, dw, dh)
  gfx.copy(
    canvas,
    minX - padding,
    minY - padding,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  );


  gfx.elt.toBlob(blob => {
    fetch('/upload-graffiti', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: blob
    })
      .then(r => r.json())
      .then(data => {
        console.log("Uploaded URL:", data.url);

        //save the URL sent from server to localStorage
        //localStorage.setItem("savedGraffitiURL", data.url);


        //save graffiti to server
        socket.emit("saveGraffitiToServer", {
          img: data.url,
          userId: myUserId
        });


        //go to pageB
        window.location.href = "pageB.html";
      });
  }, 'image/png');




}


function sprayBrush(x, y) {

  for (let i = 0; i < 120; i++) {
    let angle = random(TWO_PI);
    let r = random(20);

    let px = x + cos(angle) * r;
    let py = y + sin(angle) * r;
    fill(withAlpha(currentColor, random(20, 80)));
    // fill(255, 0, 255, random(20, 80));
    noStroke();
    circle(px, py, random(1, 4));
  }

  // calculate the speed
  let speed = 1;
  if (lastX !== null && lastY !== null) {
    speed = dist(x, y, lastX, lastY);
  }
  lastX = x;
  lastY = y;

  // the slower ...
  let maxR = map(speed, 0, 20, 20, 5, true);   // the bigger
  let baseCount = map(speed, 0, 20, 280, 80, true); // the denser


  for (let i = 0; i < baseCount; i++) {

    // use sqrt to make the center denser
    let r = maxR * sqrt(random());
    let angle = random(TWO_PI);

    let px = x + cos(angle) * r;
    let py = y + sin(angle) * r;

    // give the center dots with a higher alpha
    let alpha = map(r, 0, maxR, 200, 10);

    fill(withAlpha(currentColor, alpha));
    noStroke();

    // give the center bigger dots
    let dotSize = map(r, 0, maxR, 4, 2);
    circle(px, py, dotSize);
  }


}



// function softBrush(x, y) {
//   // calculate the speed
//   let speed = 0;
//   if (lastSoftX !== null && lastSoftY !== null) {
//     speed = dist(x, y, lastSoftX, lastSoftY);
//   }
//   lastSoftX = x;
//   lastSoftY = y;

//   // the slower...
//   let targetSize = map(speed, 0, 15, 15, 3, true); // the bigger

//   // lerp
//   softBrushSize = lerp(softBrushSize, targetSize, 0.2);

//   let layers = 6; // how many circles in one stroke
//   let spread = softBrushSize * 0.35;  // how spreaded the layers are
//   let baseSize = softBrushSize;       // size of the inner circle

//   noStroke();
//   for (let i = 0; i < layers; i++) {
//     let r = baseSize + i * spread;
//     //give the inner layer a higher alpha
//     let alpha = map(i, 0, layers - 1, 200, 5);
//     // fill(255, 0, 255, alpha);
//     fill(withAlpha(currentColor, alpha));
//     circle(x, y, r);
//   }
// }



// https://erraticgenerator.com/blog/gradient-lines-and-brushes-in-p5js/#:~:text=It%20goes%20through%20the%20whole,helpful%20p5js%20method%20lerpColor()%20.

function markerPen(x1, y1, x2, y2) {
  //calculate the distance from prevX,prevY to touch.x, touch.y
  //add one more every /x pixels
  let steps = int(dist(x1, y1, x2, y2) / 2);

  //loop through the distance
  //add points with lerp()
  for (let i = 0; i < steps; i++) {
    let t = i / steps;
    let x = lerp(x1, x2, t);
    let y = lerp(y1, y2, t);
    markerPenFunction(x, y);
  }

}

function markerPenFunction(x, y) {

  push();
  translate(x, y);
  rotate(radians(40));  // fixed direction
  noStroke();
  fill(currentColor);
  rect(0, 0, 30, 4);
  pop();

}


function finePen(x, y) {
  stroke(currentColor);
  // stroke(255, 255, 255);
  strokeWeight(3);

  if (lastX !== null && lastY !== null) {
    line(lastX, lastY, x, y);
  }

  //update
  lastX = x;
  lastY = y;
}

function withAlpha(hex, alpha) {
  return color(red(hex), green(hex), blue(hex), alpha);
}

function goHome() {
  window.location.href = 'page0.html';
}