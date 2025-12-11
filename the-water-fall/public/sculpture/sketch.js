let balls = [];
let bounceBalls = [];
let spawnInterval = null;
let number;
let yToGy = {};


let audio1;
let audio2;
let audio3;
let audio4;
let audio5;
let audio6;

// const audio1 = new Audio('assets/audio/bell1.mp3');
// const audio2 = new Audio('assets/audio/bell2.mp3');
// const audio3 = new Audio('assets/audio/bell3.mp3');
// const audio4 = new Audio('assets/audio/bell4.mp3');
// const audio5 = new Audio('assets/audio/bell5.mp3');
// const audio6 = new Audio('assets/audio/bell6.mp3');


// let socket;
// socket = io();
const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
console.log(parts)

let importantParts = []
for(p of parts){
    importantParts.push(p);
    if(p.startsWith("port-")){
        break
    }
}

const socket = io({ path: "/"+importantParts.join("/") + '/socket.io' });

let button1 = document.querySelector("#button1");
let button2 = document.querySelector("#button2");
let button3 = document.querySelector("#button3");
let button4 = document.querySelector("#button4");

button1.addEventListener("click", function () {
  number = "1";
  button1.remove();
  button2.remove();
  button3.remove();
  button4.remove();
  socket.emit("my-number", { number });
   userStartAudio();
})

button2.addEventListener("click", function () {
  number = "2";
  button1.remove();
  button2.remove();
  button3.remove();
  button4.remove();
  socket.emit("my-number", { number });
   userStartAudio();
})

button3.addEventListener("click", function () {
  number = "3";
  button1.remove();
  button2.remove();
  button3.remove();
  button4.remove();
  socket.emit("my-number", { number });
   userStartAudio();
  // loadAudios();


  // audio1 = document.createElement("audio");
  // audio1.innerHTML = `
  //       <source src="assets/audio/bell1.mp3" type="audio/mpeg">
  //       Your browser does not support the audio element.
  //   `

  // audio2 = document.createElement("audio");
  // audio2.innerHTML = `
  //       <source src="assets/audio/bell2.mp3" type="audio/mpeg">
  //       Your browser does not support the audio element.
  //   `

  // audio3 = document.createElement("audio");
  // audio3.innerHTML = `
  //       <source src="assets/audio/bell3.mp3" type="audio/mpeg">
  //       Your browser does not support the audio element.
  //   `

  // audio4 = document.createElement("audio");
  // audio4.innerHTML = `
  //       <source src="assets/audio/bell4.mp3" type="audio/mpeg">
  //       Your browser does not support the audio element.
  //   `

  // audio5 = document.createElement("audio");
  // audio5.innerHTML = `
  //       <source src="assets/audio/bell5.mp3" type="audio/mpeg">
  //       Your browser does not support the audio element.
  //   `

  // audio6 = document.createElement("audio");
  // audio6.innerHTML = `
  //       <source src="assets/audio/bell6.mp3" type="audio/mpeg">
  // Your browser does not support the audio element.
  // `

  // audio1 = new Audio('assets/audio/bell1.mp3');
  // audio2 = new Audio('assets/audio/bell2.mp3');
  // audio3 = new Audio('assets/audio/bell3.mp3');
  // audio4 = new Audio('assets/audio/bell4.mp3');
  // audio5 = new Audio('assets/audio/bell5.mp3');
  // audio6 = new Audio('assets/audio/bell6.mp3');



})

button4.addEventListener("click", function () {
  number = "4";
  button1.remove();
  button2.remove();
  button3.remove();
  button4.remove();
  socket.emit("my-number", { number });
   userStartAudio();



})




function preload() {
  audio1 = loadSound("assets/audio/bell1.mp3");
  audio2 = loadSound("assets/audio/bell2.mp3");
  audio3 = loadSound("assets/audio/bell3.mp3");
  audio4 = loadSound("assets/audio/bell4.mp3");
  audio5 = loadSound("assets/audio/bell5.mp3");
  audio6 = loadSound("assets/audio/bell6.mp3");
}


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");


  noise = new p5.Noise('pink');
  filter = new p5.HighPass();
  reverb = new p5.Reverb();

  noise.disconnect();
  noise.connect(filter);
  filter.connect(reverb);
  filter.freq(800);
  filter.res(1.5);
  reverb.amp(0.2);
  reverb.drywet(0.3);

  noise.amp(0);

}


function playAudio(audio) {
  // const clone = audio.cloneNode();
  // clone.currentTime = 0;
  // clone.play();

  if (audio && audio.isLoaded()) {
    audio.play();
  }

}

function draw() {
  // background(0);
  fill(0, 20);
  rect(0, 0, windowWidth, windowHeight);
  noStroke();
  fill(255, 200);

  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];

    if (number === "1") {
      b.gx = 0.4;
    } else if (number === "2") {
      b.gx = 0.35;
    } else if (number === "3") {
      b.gx = 0.3;
    } else if (number === "4") {
      b.gx = 0.25;
    };

    b.x -= b.vx;
    b.vx += b.gx;

    if (b.hit === undefined) {
      b.hit = false;
    }


    //stop at the edge of the screen
    if (b.x + b.size / 2 <= 0 && !b.hit) {
      b.hit = true;


      if (number === "4") {
        if (b.y >= 0 && b.y <= windowHeight / 6) {
          audio1.play();
          // playAudio(audio1);
          console.log("play1")
        } else if (b.y > windowHeight / 6 && b.y <= windowHeight / 3) {
          audio2.play();
          // playAudio(audio2);
          console.log("play2")
        } else if (b.y > windowHeight / 3 && b.y <= windowHeight / 2) {
          audio3.play();
          // playAudio(audio3);
          console.log("play3")
        } else if (b.y > windowHeight / 2 && b.y <= windowHeight * 2 / 3) {
          audio4.play();
          // playAudio(audio4);
          console.log("play4")
        } else if (b.y > windowHeight * 2 / 3 && b.y <= windowHeight * 5 / 6) {
          audio5.play();
          // playAudio(audio5);
          console.log("play5")
        } else {
          audio6.play();
          // playAudio(audio6);
          console.log("play6")
        }
      }


      socket.emit("ball-finished", {
        y: b.y,
        size: b.size,
        from: number
      });
      balls.splice(i, 1);
    } else if (b.x + b.size / 2 > 0) {
      b.hit = false;
    }
    circle(b.x, b.y, b.size);
  }



  for (let i = bounceBalls.length - 1; i >= 0; i--) {
    let b = bounceBalls[i];

    b.x += b.vx;
    b.vx += b.gx;
    b.y += b.vy;
    b.vy += b.gy;


    if (b.y + b.size / 2 < 0 || b.y - b.size / 2 > windowHeight) {
      b.vy = - b.vy;
      // b.color = color(random(100, 255), random(100, 255), random(100, 255));

    }

    if (b.x + b.size / 2 >= windowWidth) {


      socket.emit("ball-bounce-to-next-screen", {
        y: b.y,
        size: b.size,
        vy: b.vy,
        gy: b.gy,
        from: number
      });
      // bounceBalls.splice(i, 1);
      setTimeout(() => bounceBalls.splice(i, 1), 20);
    }

    // fill(204, 255, 255);
    fill(b.color || color(204, 255, 255));
    circle(b.x, b.y, b.size);
  }

}



socket.on("new-ball", (data) => {
  balls.push({
    x: width,
    y: data.y,
    vx: 1,
    vy: 0,
    gx: 0.3,
    gy: 0,
    size: data.size
  })
})

socket.on("ball-bounce", (data) => {

  //if coming from the same y axis, give a same random gy
  //to bounce back
  let sharedGy;
  if (typeof data.gy !== "undefined") {
    sharedGy = data.gy;
  } else {
    if (!yToGy[data.y]) {
      yToGy[data.y] = randomInRange(-0.5, 0.5);
    }
    sharedGy = yToGy[data.y];
  }

  bounceBalls.push({
    x: 0,
    y: data.y,
    vx: 0.5,
    vy: 0.5,
    gx: 0.3,
    gy: sharedGy,
    size: data.size
  })
})

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

let noise, filter, reverb;
function touchStarted(event) {



  if (!spawnInterval) {
    spawnInterval = setInterval(() => {
      //touches: a built-in global variable
      for (let t of touches) {
        balls.push({
          x: t.x,
          y: t.y,
          vx: 1,
          vy: 0,
          gx: 0.3,
          gy: 0,
          size: random(10, 30),
          // noise: noise,
          // filter: filter,
          // reverb: reverb
        })
      }
    }, 100) // spawn a ball every 50 milliseconds
  }

  //don't make any sound when pressing the buttons
  if (
    event.target.tagName === "BUTTON" ||
    event.target.id === "button1" ||
    event.target.id === "button2" ||
    event.target.id === "button3" ||
    event.target.id === "button4"
  ) {
    return;
  }


  userStartAudio();
  //create the sound
  noise.start();
  noise.amp(0.01, 2);
}

function touchMoved() {



}

function touchEnded() {
  clearInterval(spawnInterval);
  spawnInterval = null;
  if (noise) {
    noise.amp(0, 2);
    setTimeout(() => noise.stop(), 2000);
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
