// const audio = new Audio('marble.mp3'); 


let sandsFall = [];
let sands = [];
let fishFall = [];
let fish = [];

let spawnInterval = null;
let number;
let displayWaterHeight = 0;
let waterHeight = 60;

let socket;
socket = io();


let button1 = document.querySelector("#button1");
let button2 = document.querySelector("#button2");
let button3 = document.querySelector("#button3");
let button4 = document.querySelector("#button3");

button1.addEventListener("click", function () {
  number = "1";
  button1.remove();
  button2.remove();
  button3.remove();
  socket.emit("my-number", { number })
})

button2.addEventListener("click", function () {
  number = "2";
  button1.remove();
  button2.remove();
  button3.remove();
  socket.emit("my-number", { number })
})

button3.addEventListener("click", function () {
  number = "3";
  button1.remove();
  button2.remove();
  button3.remove();
  socket.emit("my-number", { number })
})

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");


}

function draw() {
  background(0);

  //the water level
  if (number === "3") {
    fill(30, 76, 87);
    displayWaterHeight = lerp(displayWaterHeight, waterHeight, 0.05);
    let flow = sin(frameCount * 0.05) * 2;
    let dynamicWaterHeight = displayWaterHeight + flow;
    rect(0, 0, dynamicWaterHeight, windowHeight);
  }
  // fill(0, 20);
  // rect(0, 0, windowWidth, windowHeight);
  noStroke();
  fill(255, 200);



  for (let i = sandsFall.length - 1; i >= 0; i--) {
    let s = sandsFall[i];
    s.x -= s.vx;
    s.vx += s.gx;


    let speed = abs(s.vx) + abs(s.gx);
    // let baseFreq;
    // if (s.screenNumber === "1") {
    //   baseFreq = 2500;
    // } else if (s.screenNumber === "2") {
    //   baseFreq = 1000;
    // }
    let freq = 1000 + random(-80, 80) + speed * 800;
    let amp = map(speed, 0, 3, 0.01, 0.04);

    if (s.noise) {
      s.filter.freq(freq);
      s.noise.amp(amp, 0.001);
    }


    //stop at the edge of the screen
    if (s.x + s.size / 2 <= 0) {
      // b.vx = 0;
      // b.gx = 0;

      if (s.noise) {
        s.noise.amp(0, 0.3);
        setTimeout(() => s.noise.stop(), 300);
        s.noise = null;
      }

      socket.emit("sand-finished", { y: s.y, size: s.size, from: number });
      sandsFall.splice(i, 1);
    }
    // circle(s.x, s.y, s.size);
    drawSand(s.x, s.y, s.size);
  }

  for (let i = sands.length - 1; i >= 0; i--) {

    let s = sands[i];
    s.x -= s.vx;
    s.vx += s.gx;

    if (s.x <= waterHeight) {
      s.vx = 0.2;
      if (s.x - s.size / 2 <= 0) {
        s.x = s.size / 2;
        s.vx = 0;
        s.gx = 0;

        if (!s.hitGround) {
          s.hitGround = true;
          waterHeight += 2;
        }
      }
    }

    //collision + piling up
    for (let j = 0; j < sands.length; j++) {
      if (i != j) {
        let o = sands[j];
        let dx = o.x - s.x;
        let dy = o.y - s.y;
        let d = sqrt(dx * dx + dy * dy);
        let minD = (s.size + o.size) / 2;
        if (d < minD) {

          let overlap = (minD - d) / 2;
          let angle = atan2(dy, dx);
          s.x -= cos(angle) * overlap;
          s.y -= sin(angle) * overlap;
          o.x += cos(angle) * overlap;
          o.y += sin(angle) * overlap;

          let tvy = s.vy;
          s.vy = o.vy;
          o.vy = tvy;
        }
      }
    }

    //circle(s.x, s.y, s.size);
    drawSand(s.x, s.y, s.size);
  }

  fill(255, 255, 200);
  for (let i = fishFall.length - 1; i >= 0; i--) {
    let f = fishFall[i];
    f.x -= f.vx;
    f.vx += f.gx;

    if (f.x + f.size / 2 <= 0) {
      socket.emit("fish-finished", { y: f.y, size: f.size, from: number });
      fishFall.splice(i, 1);
    }

    circle(f.x, f.y, f.size);

  }

  for (let i = fish.length - 1; i >= 0; i--) {
    let f = fish[i];
    let glowSize = f.size;
    let color;
    f.x -= f.vx;
    f.vx += f.gx;


    if (f.x <= waterHeight - random(8, 30)) {
      f.hitWater = true;
      f.vx = 0;
    }

    if (f.hitWater) {
      // outside glow
      for (let i = 3; i > 0; i--) {
        let glowSize = f.size * (1 + i * 0.3);
        let alpha = 50 - i * 10;
        fill(255, 200, 255, alpha);
        circle(f.x, f.y, glowSize);
      }

      fill(255, 255, 200, 180);
      circle(f.x, f.y, f.size);

      // swimming
      if (frameCount % 60 == 0) {
        f.targetY = f.y - random(-100, 100);
      }
      f.y += (f.targetY - f.y) * 0.05;
    }

    else {
      f.y += f.vy;
      fill(255, 255, 200);
      circle(f.x, f.y, f.size);
    }


    circle(f.x, f.y, f.size);


  }
}


socket.on("new-sand", (data) => {
  sandsFall.push({
    x: width,
    y: data.y,
    vx: 1,
    gx: 0.3,
    size: data.size
  })
})

socket.on("pile-sand", (data) => {
  sands.push({
    x: width,
    y: data.y,
    vx: 1,
    gx: 0.3,
    vy: 0,
    gy: 0.3,
    size: data.size,
    hitGround: false

  })
})

socket.on("pile-fish", (data) => {
  fish.push({
    x: width,
    y: data.y,
    targetY: data.y,
    vx: 1,
    gx: 0.3,
    vy: 0,
    gy: 0.3,
    size: data.size,
    hitWater: false
  })
})

// socket.on("ball-bounce", (data) => {
//   bounceBalls.push({
//     x: 0,
//     y: data.y,
//     vx: 0.5,
//     vy: 0.5,
//     gx: 0.3,
//     gy: random(-0.5, 0.5),
//     size: data.size
//   })
// })

// socket.on("ball-bounce-back", (data)=>{
//     bounceBalls.push({
//     x: windowWidth - size,
//     y: data.y,
//     vx: -0.5,
//     vy: 0.5,
//     gx: 0.3,
//     gy: random(-0.5, 0.5),
//     size: data.size
//   })
// })



// P5 touch events: https://p5js.org/reference/#Touch


function drawSand(x, y, size) {
  // push();
  // noStroke();

  // // outside glow
  // for (let i = 3; i > 0; i--) {
  //   let glowSize = size * (1 + i * 0.2);
  //   let alpha = 40 - i * 10;
  //   fill(180, 200, 255, alpha);
  //   circle(x, y, glowSize);
  // }

  // // main color + offset
  // // fill(200 + random(-20, 20), 220 + random(-10, 10), 255, 180);
  // // beginShape();
  // // let offset = random(1000);
  // // for (let a = 0; a < TWO_PI; a += radians(30)) {
  // //   let r = size / 2 + noise(offset + cos(a) * 0.1, offset + sin(a) * 0.1) * 6 - 2;
  // //   let sx = x + cos(a) * r;
  // //   let sy = y + sin(a) * r;
  // //   vertex(sx, sy);
  // // }
  // // endShape(CLOSE);
  // fill(200 + random(-20, 20), 220 + random(-10, 10), 255, 180);
  // circle(x,y,size);

  // pop();

  push();

  // 球体的底色（半透明蓝色）
  fill(180, 220, 255, 80);
  ellipse(x, y, size);

  // 内层渐变（制造球面深度）
  for (let r = size * 0.9; r > 0; r -= 4) {
    let alpha = map(r, 0, size * 0.9, 0, 80);
    fill(200, 230, 255, alpha);
    ellipse(x, y, r);
  }

  // 高光（亮斑）
  fill(255, 255, 255, 180);
  ellipse(x - size * 0.2, y - size * 0.2, size * 0.3);

  // 反光（下半部一点点）
  fill(255, 255, 255, 40);
  ellipse(x + size * 0.15, y + size * 0.25, size * 0.5, size * 0.3);

  pop();
}



function touchStarted() {
  userStartAudio();

  if (!spawnInterval) {
    spawnInterval = setInterval(() => {
      //touches: a built-in global variable
      for (let t of touches) {
        if (number === "1") {
  
          // audio.play();

          //create the sound
          let noise = new p5.Noise('white');
          let filter = new p5.HighPass();
          let reverb = new p5.Reverb();
          noise.disconnect();
          noise.connect(filter);
          filter.connect(reverb);
          reverb.amp(0.3);
          reverb.drywet(0.25);
          noise.start();
          noise.amp(0.02, 0.1);


          sandsFall.push({
            x: t.x,
            y: t.y,
            vx: 1,
            gx: 0.3,
            size: random(30, 50),
            noise: noise,
            filter: filter,
            reverb: reverb,
            screenNumber: number
          })
          // playMarbleSound("1");
        }
        else if (number === "2") {
          fishFall.push({
            x: t.x,
            y: t.y,
            vx: 1,
            vy: random(-1, 1),
            gx: 0.3,
            gy: 0.3,
            size: random(10, 15)
          })
        }

      }
    }, 100) // spawn a ball every xx milliseconds
  }

}

function touchMoved() {
  clearInterval(spawnInterval);
  spawnInterval = null;
}

function touchEnded() {


}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}





// function playMarbleSound(screenNumber) {
//   userStartAudio(); 

//   let noise = new p5.Noise('white');
//   let filter = new p5.HighPass();
//   let reverb = new p5.Reverb();

//   noise.disconnect();
//   noise.connect(filter);
//   filter.connect(reverb);

//   //frequency based on screen numbers
//   let freqBase;
//   if (screenNumber === "1") freqBase = 2500; // fast
//   else if (screenNumber === "2") freqBase = 1800; // mid
//   else freqBase = 1200; // slow


//   let freq = freqBase + random(-150, 150);
//   filter.freq(freq);

//   reverb.amp(0.3);
//   reverb.drywet(0.25);

//   noise.start();
//   noise.amp(0.03, 0.01); // transition in
//   noise.amp(0, 0.3); // transition out
//   // setTimeout(() => noise.stop(), 400);
// }

