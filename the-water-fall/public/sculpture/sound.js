let noise, filter, reverb;
let playing = false;
let speed = 0; // simulate the speed

function setup() {
  createCanvas(400, 200);
  textAlign(CENTER, CENTER);
  textSize(16);

  //white noise
  noise = new p5.Noise('white');

  //high-pass filter
  filter = new p5.HighPass();
  noise.disconnect();
  noise.connect(filter);

  //reverb
  reverb = new p5.Reverb();
  filter.connect(reverb);
  reverb.amp(0.3);
  reverb.drywet(0.2);
}

function draw() {
  background(230);

  if (playing) {

    speed = abs(sin(frameCount * 0.01));

    //the higer frequency indicates the speed is faster
    let freq = map(speed, 0, 1, 1000, 3000) + random(-100, 100);
    filter.freq(freq);

    //the louder indicates faster
    let amp = map(speed, 0, 1, 0.015, 0.05);
    noise.amp(amp, 0.1);

    text(`Speed: ${speed.toFixed(2)}\nSound playing`, width / 2, height / 2);
  } else {
    text('Click to start', width / 2, height / 2);
  }
}

function mousePressed() {
  userStartAudio();

  if (!playing) {
    noise.start();
    noise.amp(0.02, 0.01); // transition in
    playing = true;
  } else {
    noise.amp(0, 0.5); // transition out
    setTimeout(() => noise.stop(), 600);
    playing = false;
  }
}

