const express = require('express');
// const http = require("http");
const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const emoji = require('emoji-dictionary');



const app = express(); // the server "app", the server behaviour
// const portHTTP = 3000; // port for http
const portHTTPS = 3001; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));

// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
    cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

const HTTPSserver = https.createServer(options, app);

const { Server } = require('socket.io'); //include library
const io = new Server(HTTPSserver); //start socket io

io.on('connection', (socket) => {
    //each connection gets a different id
    console.log('a user connected', socket.id);

    socket.on("disconnect", function () {
        console.log("someone disconnected");
    })

    //receive a msg from any one client
    //event name should be the same in script.js (now both are "message")
socket.on("message", function (incomingMessage) {
    console.log("got new message", incomingMessage);


    //split the content by word
    // map words into emoji
    // send the converted messages back to the client end
    let words = text.split(" ");
    let converted = words.map(word => emoji.getUnicode(word) || word).join(" ");

    let messageToAllClients = {
        sender: sender,
        message: converted
    };

    io.emit("newMessage", messageToAllClients);
});


})

// Creating servers and make them listen at their ports:
// http.createServer(app).listen(portHTTP, function (req, res) {
//     console.log("HTTP Server started at port", portHTTP);
// });
// https.createServer(options, app).listen(portHTTPS, function (req, res) {
//     console.log("HTTPS Server started at port", portHTTPS);
// });

HTTPSserver.listen(portHTTPS, function (req, res) {
    console.log("HTTPS Server started at port", portHTTPS)
});



