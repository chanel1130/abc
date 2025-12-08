const express = require('express');

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour
const portHTTPS = 4200; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));


// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
    cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app)


const { Server } = require('socket.io'); // include library
const io = new Server(HTTPSserver); // start socket io 

// socket.id -> { userId, username }
let sockets = {};
// userId -> socket.id
let users = {};

let messages = [];
let DATA_PATH = "chat-data.json";

try {
    //if the file exists
  if (fs.existsSync(DATA_PATH)) {
    const file = fs.readFileSync(DATA_PATH, 'utf8');
    messages = JSON.parse(file);
    console.log('Loaded chat history:', messages.length, 'messages');
  }
  //if the file doesn't exist yet, messages[] stays empty
} catch (err) {
  console.log('Could not load chat history, starting empty');
  messages = [];
}

io.on('connection', (socket) => {

    // we manage the connection inside here
    console.log('a user connected', socket.id);

    socket.on("identify", function (data) {
        console.log("iddent", data)
        // connect username and user id to socket ids
        sockets[socket.id] = {
            userId: data.userId,
            username: data.username
        }

        users[data.userId] = socket.id;
        console.log("currently online:", sockets);
        // console.log(users);
    })

    // could update other about who's online
    socket.emit("chat-history", messages)


    socket.on("name-change", function (data) {
        // handle change of username
        sockets[socket.id].username = data.newUsername;
    })

    socket.on("message-from-client", function (data) {
        console.log("got a msg from client", data);

        // message object shoylt contain message, username and userID
        let message = {
            message: data.message,
            sender: sockets[socket.id]
        }
        //append messages to runtime message object
        messages.push(message);
        //save the new message array to the local JSON file
        let stringifiedMessages = JSON.stringify(messages, null, 2);
        //(which file to write into, which message, 'utf-8')
        fs.writeFileSync(DATA_PATH, stringifiedMessages, 'utf-8');


        io.emit("message-from-server", message);
        
    })

    socket.on("disconnect", function () {
        console.log("someone disconnected", socket.id)

        // delete user from our records

        let me = sockets[socket.id];
        console.log("me", me)
        if (me) {
            delete sockets[socket.id];
            delete users[me.userId];
        }

        console.log("online socket", sockets)
        console.log("online users", users)

    })
})






// Creating servers and make them listen at their ports:

HTTPSserver.listen(portHTTPS, function (req, res) {
    console.log("HTTPS Server started at port", portHTTPS);
});





