const express = require('express');

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");


const app = express(); // the server "app", the server behaviour

const portHTTPS = 4200; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));
app.use(express.json({ limit: "20mb" }));

app.post('/upload-graffiti', (req, res) => {
  console.log("Receiving graffiti PNG...");

  const fileName = Date.now() + '.png';
  const filePath = 'public/uploads/' + fileName;

  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);

  req.on('end', () => {
    res.json({ url: 'uploads/' + fileName });
  });
});


let allGraffiti = [];
// let currentEditingGraffiti = {};

//get the current allGraffiti data
app.get("/graffiti", (req, res) => {
  //turn allGraffiti into a json file
  // res.json(allGraffiti);

  res.json({
    allGraffiti: allGraffiti,
    // currentGraffiti: currentEditingGraffiti
  });
});


// Creating object of key and certificate
// for SSL
const options = {
  key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
  cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app)


const { Server } = require('socket.io'); // include library
// const { del } = require('framer-motion/client');
const io = new Server(HTTPSserver); // start socket io 


let displayUsers = {};

io.on('connection', (socket) => {
  // we manage the connection inside here
  console.log('a user connected', socket.id);


  //if from page B, emit "allGraffiti"
  // let comesFromDisplayPage = socket.handshake.headers.referer.endsWith("pageB.html")
  // console.log(socket.handshake.headers)
  // if (comesFromDisplayPage == true) {
  //   // socket.emit("allGraffiti", allGraffiti);
  //   console.log('sending', allGraffiti)
  //   socket.emit("allGraffiti", allGraffiti);

  // }

  socket.on("identify", function(userId){
    displayUsers[socket.id] = userId;
    console.log("current display userrs", displayUsers)


    console.log('sending', allGraffiti)
    socket.emit("allGraffiti", allGraffiti);
  })



  // socket.on("confirmGraffiti", (data) => {
  //   allGraffiti.push(data);
  //   socket.broadcast.emit("newGraffiti", data);
  // });

  socket.on("saveGraffitiToServer", (data) => {

    let drawing = {
      userId: data.userId,
      imgURL: data.img,
      drawingId: 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      locationConfirmed: false,
      offsetX: 0,
      offsetY: 0,
      scaleFactor: 1,
      rotation: 0,
      timestamp: Date.now(),
      socketId: socket.id
    }


    // save to alll drawings
    allGraffiti.push(drawing);
    console.log(allGraffiti)

    // save allGraffiti to JSON

    // send to current clients of page 2
    socket.broadcast.emit("new-drawing-from-server", drawing)


  })

  socket.on("editingGraffiti", (data) => {

    let index = allGraffiti.findIndex(g => g.drawingId === data.drawingId);
    if (index > -1) {

      allGraffiti[index].offsetX = data.x;
      allGraffiti[index].offsetY = data.y;
      allGraffiti[index].scaleFactor = data.scaleFactor;
      allGraffiti[index].rotation = data.rotation;

      socket.broadcast.emit("othersEditingGraffiti", allGraffiti[index]);
    }

  });


  socket.on("saveFinalizedGraffitiToServer", (data) => {

    socket.broadcast.emit("confirm-drawing-from-server", data.drawingId);

    // const editingGraffiti = currentEditingGraffiti[socket.id];
    let drawingIndex = allGraffiti.findIndex(g => g.drawingId == data.drawingId)
    if (drawingIndex > -1) {
      console.log("confirming", allGraffiti[drawingIndex]);
      allGraffiti[drawingIndex].x = data.x;
      allGraffiti[drawingIndex].y = data.y;
      // allGraffiti[drawingIndex].x = data.offsetX;
      // allGraffiti[drawingIndex].y = data.offsetY;
      allGraffiti[drawingIndex].scaleFactor = data.scale;
      allGraffiti[drawingIndex].rotation = data.rotation;
      allGraffiti[drawingIndex].locationConfirmed = true;
    }

    // if (editingGraffiti) {

    //   const finalGraffiti = {
    //     img: editingGraffiti.img,
    //     x: data.x,
    //     y: data.y,
    //     scale: data.scale,
    //     rotation: data.rotation
    //   };


    //   allGraffiti.push(finalGraffiti);

    //   socket.broadcast.emit("newGraffiti", finalGraffiti);
    // }
  })

  socket.on("disconnect", function () {
    console.log("someone disconnected", socket.id);

    // let idx = allGraffiti.findIndex(g=> g.socketId == socket.id && g.locationConfirmed == false);
    // if(idx>-1){
    //   console.log("deleting", allGraffiti[idx])
    //   allGraffiti.splice(idx, 1);
    // }
    if(displayUsers[socket.id]){
      console.log(displayUsers[socket.id]);
      
      let idx = allGraffiti.findIndex(g=> g.userId == displayUsers[socket.id] && g.locationConfirmed == false);
      if(idx>-1){
        console.log("delete-drawing-from-server", allGraffiti[idx])
        socket.broadcast.emit("delete-drawing-from-server", allGraffiti[idx].drawingId);
        allGraffiti.splice(idx, 1);
      }

      delete displayUsers[socket.id]
      console.log("current dusplay users", displayUsers)
    }


    // delete currentEditingGraffiti[socket.id];

    // delete user from our records

    // let me = sockets[socket.id];
    // console.log("me", me)
    // if (me) {
    //   delete sockets[socket.id];
    //   delete users[me.userId];
    // }

    // console.log("online socket", sockets)
    // console.log("online users", users)

  })
})






// Creating servers and make them listen at their ports:

HTTPSserver.listen(portHTTPS, function (req, res) {
  console.log("HTTPS Server started at port", portHTTPS);
});





