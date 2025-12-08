const express = require('express');

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");


const app = express(); // the server "app", the server behaviour

const portHTTPS = 3010; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));
app.use(express.json({ limit: "20mb" }));

let allGraffiti = [];

//get the current allGraffiti data
app.get("/graffiti", (req, res) => {
  //turn allGraffiti into a json file
  res.json(allGraffiti);
});


// Creating object of key and certificate
// for SSL
const options = {
  key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
  cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app)


const { Server } = require('socket.io'); // include library
const io = new Server(HTTPSserver); // start socket io 

// // socket.id -> { userId, username }
// let sockets = {};
// // userId -> socket.id
// let users = {};

// let messages = [];
// let DATA_PATH = "chat-data.json";

// try {
//     //if the file exists
//   if (fs.existsSync(DATA_PATH)) {
//     const file = fs.readFileSync(DATA_PATH, 'utf8');
//     messages = JSON.parse(file);
//     console.log('Loaded chat history:', messages.length, 'messages');
//   }
//   //if the file doesn't exist yet, messages[] stays empty
// } catch (err) {
//   console.log('Could not load chat history, starting empty');
//   messages = [];
// }

io.on('connection', (socket) => {

  // we manage the connection inside here
  console.log('a user connected', socket.id);

  socket.on("confirmGraffiti", (data) => {
    allGraffiti.push(data);
    socket.broadcast.emit("newGraffiti", data);
  });

  socket.on("disconnect", function () {
    console.log("someone disconnected", socket.id)

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





