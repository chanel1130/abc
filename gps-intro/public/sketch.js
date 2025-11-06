let mappa = new Mappa('Leaflet'); // map library
let myMap;
let canvas;
let currentLongitude = 0; // global variables will be updated as we get GPS data
let currentLatitude = 0; // global variables will be updated as we get GPS data
let mapInit = false; // we only do map stuff once mapInit is true (see in draw)
let me; // point object showing our own location
let others = {};

if(location.hostname.toLowerCase().startsWith('browsercircus')){
  socket = io({path: "/chanel/port-4200/socket.io"});  // yields '/leon/port-4100/socket.io' or '/socket.io'
}else{
  socket = io(); 
}

let cameras = [];

let deleteButton = document.getElementById("deleteLast");


let unlockButton = document.getElementById("unlock");
let lastButtonClick = -5000;
let timeToMarkCamera = 5000;

unlockButton.addEventListener("click", function(){
  lastButtonClick = millis();
})

let lastLat = 0;
let lastLng = 0;
deleteButton.addEventListener("click", function(){
  // lastButtonClick = millis();


  socket.emit("deletePrevious");
  deleteButton.style.display = "none";
  for(let i = cameras.length-1; i >= 0 ; i--){
    if(cameras[i].lat == lastLat && cameras[i].lng == lastLng){
      console.log(cameras)
      cameras.splice(i, 1);
      console.log(cameras)
    } 

  }
})


// options for map
// we only actually initialize the map once we get data where we are (in draw)
// there are differnt suppliers and styles of maps available
let mappa_options = {
  lat: 0, // will change once we have data
  lng: 0, // will change once we have data
  zoom: 16, // initial zoom level
  // style: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
  // style: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
  style: 'https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}',
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  me = new MyPoint();
  // others = new MyPoint();

}

function draw() {
  clear();


  if(millis()-lastButtonClick<timeToMarkCamera){
    let timeLeft = floor(((5000-(millis()-lastButtonClick))/1000));
    // text(timeLeft, 50, 300)
    unlockButton.innerHTML = "mark camera (" + timeLeft + ")"
    unlockButton.style.color = "red";
  }else{
     unlockButton.innerHTML = "UNLOCK";
     unlockButton.style.color = "green";
  }
  // Initialize full screen map
  if (!mapInit && GPS_GRANTED && currentLongitude != 0) {
    console.log("starting map");
    mappa_options.lat = currentLatitude;
    mappa_options.lng = currentLongitude;
    // mappa_options.lat = 31.798695;
    // mappa_options.lng = 119.900453;
    myMap = mappa.tileMap(mappa_options);
    myMap.overlay(canvas);
    myMap.onChange(updateMapContent);
    unlockButton.style.display = "block";
    deleteButton.style.display = "block";
    mapInit = true
  }

  if (mapInit) {

    for (let id in others) {
      others[id].update();
      others[id].display();
    }


    for (let i = 0; i < cameras.length; i++) {
      let c = cameras[i];
      let d = getDistanceFromLatLonInM(currentLatitude, currentLongitude, c.lat, c.lng);
      if (d < 100) {
        stroke(0, 0, 255);
        strokeWeight(1);
        line(me.x, me.y, c.x, c.y);
      }
    }


    // only update and draw our point if we actually have data
    me.update();
    me.display();
    // console.log(me)

  }

  for (let i = 0; i < cameras.length; i++) {
    let c = cameras[i];
    //from location to screen pixel
    let camPos = myMap.latLngToPixel(c.lat, c.lng);
    fill(255);
    noStroke();
    circle(camPos.x, camPos.y, 10);
  }



}

socket.on("camera-from-server", (data) => {
  cameras.push({
    lat: data.lat,
    lng: data.lng
  })
})

// P5 touch events: https://p5js.org/reference/#Touch
function touchStarted() {
  if (mapInit) {



    if(millis()-lastButtonClick<timeToMarkCamera){
      //from screen pixel to location
      let pos = myMap.pixelToLatLng(touches[0].x, touches[0].y);
      console.log("TOUCHED", pos);
      cameras.push({
        lat: pos.lat,
        lng: pos.lng
      })
      lastLat = pos.lat;
      lastLng = pos.lng;
      socket.emit("camera-from-client", {
        lat: pos.lat,
        lng: pos.lng
      })
      console.log(cameras)
      lastButtonClick = 0;
      deleteButton.style.display = "block";

    }
    
    


  } else {
    console.log("TOUCHED", touches);
  }

}

function touchMoved() {
}

function touchEnded() {
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//directly called from GPS listener whenever our location updates;
function handleNewPosition(pos) {
  // fix location for chinese map tiles
  let lonlat = fixForChineseMap(pos);
  currentLongitude = lonlat[0];
  currentLatitude = lonlat[1];
  console.log(currentLatitude, currentLongitude);
  if (mapInit) {
    // if map already displayed, update the point
    updateMapContent();
  }
  let locForSer = {
    lat: currentLatitude, 
    lng: currentLongitude
  }
  socket.emit("location-from-client", { locForSer });
 
}
// socket.on("location-from-server", function (data) {
//   console.log("other location", data);


// })

socket.on("location-from-server", function (data) {
  console.log("other location", data);
  // let othersPosOnCanvas = myMap.latLngToPixel(data.lat, data.lng);
  // others.goalX = othersPosOnCanvas.x;
  // others.goalY = othersPosOnCanvas.y;

  if (!others[data.id]) {
    others[data.id] = new MyPoint();
  }

  let pos = myMap.latLngToPixel(data.lat, data.lng);
  others[data.id].goalX = pos.x;
  others[data.id].goalY = pos.y;
})


function updateMapContent() {
  let myPosOnCanvas = myMap.latLngToPixel(currentLatitude, currentLongitude)
  me.goalX = myPosOnCanvas.x;
  me.goalY = myPosOnCanvas.y;





  //update the camera locations
  for (let i = 0; i < cameras.length; i++) {
    let c = cameras[i];
    let camPixel = myMap.latLngToPixel(c.lat, c.lng);
    c.x = camPixel.x;
    c.y = camPixel.y;
  }
}

class MyPoint {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.goalX = 0;
    this.goalY = 0;
    this.size = 14;
    this.col = color(170, 240, 255);

  }
  update() {
    // lerp to each new location to keep things smoother
    this.x = lerp(this.x, this.goalX, 0.2)
    this.y = lerp(this.y, this.goalY, 0.2)

  }
  display() {
    push();
    translate(this.x, this.y);
    fill(this.col);
    // stroke("pink");
    noStroke();
    let dia = this.size + sin(frameCount * 0.1)
    circle(0, 0, dia);

    pop();
  }
}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius of the earch
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    sin(dLat / 2) * sin(dLat / 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    sin(dLon / 2) * sin(dLon / 2);
  const c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c;
}