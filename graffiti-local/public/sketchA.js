let canvas, socket;
let touchingCanvas = false;

function setup() {
  socket = io();
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  //call the saveDrawing function onclick
  // document.getElementById("saveBtn").onclick = saveDrawing;

  document.getElementById("saveBtn").addEventListener("click", saveDrawing);

  //enable toucheStarted only within the p5 canvas
  canvas.touchStarted(handleTouchStart);
  canvas.touchEnded(handleTouchEnd);


}

function draw() {

  noStroke();

  if(touchingCanvas){
    for (const t of touches) {
      fill(255, 0, 255);
      circle(t.x, t.y, 30);
      fill(255, 255, 255, 50);
      circle(t.x, t.y, 45);
      fill(255, 255, 255, 50);
      circle(t.x, t.y, 60);
    }
  }
  

}


function handleTouchStart() {
  console.log("touch inside canvas:", touches);
  touchingCanvas = true
  return false; 
}

function handleTouchEnd() {
  console.log("touch ended");
  touchingCanvas = false
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

function saveDrawing(){
  console.log("saving...");
  //canvas.els: elements on the canvas
  //.toDataURL: save the elements as a base64 string
  let base64 = canvas.elt.toDataURL("image/png");
  //add the item to localStorage
  localStorage.setItem("savedGraffiti", base64);
  //go to pageB
  window.location.href = "pageB.html";
}