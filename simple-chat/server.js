const express = require('express');
// const http = require("http");
const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");
const emoji = require('node-emoji');


const synonyms = {
    // ❤️ heart
    love: "heart",
    like: "heart",
    adore: "heart",
    cherish: "heart",
    // 😄 smile
    smile: "smile",
    laugh: "smile",
    grinning: "smile",
    giggle: "smile",
    happy: "smile",
    // 😂 joy
    lol: "joy",
    lmao: "joy",
    ha: "joy",
    // 😢 cry
    cry: "cry",
    weep: "cry",
    sob: "cry",
    sad: "cry",
    miserable: "cry",
    // 😎 sunglasses
    chill: "sunglasses",
    relax: "sunglasses",
    cool: "sunglasses",
    // 😡 angry
    rage: "angry",
    fume: "angry",
    yell: "angry",
    pissed: "angry",
    angry: "angry",
    mad: "angry",
    // 🥳 party
    celebrate: "tada",
    party: "tada",
    cheer: "tada",
    // 😱 scream
    scream: "scream",
    shout: "scream",
    shock: "scream",
    fear: "scream",
    scared: "scream",
};
const blacklist = ["it", "us"];


// get all the functions in node-emoji
// console.log(Object.keys(emoji));
// const allNames = emoji.search("").map(e => e.key);
// console.log(allNames.slice(0, 20));
// console.log("Total number:", allNames.length);


function getEmoji(name) {
    console.log("Checking word:", name);

    //if the word is in the blacklist, return the word
    if (blacklist.includes(name)) {
        return name;
    }
    if (synonyms[name]) {
        return emoji.get(synonyms[name]);
    }
    return emoji.get(name);
}


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

    socket.on("startGrow", (messageID) => {
        io.emit("startGrow", messageID);
    });

    socket.on("stopGrow", (messageID) => {
        io.emit("stopGrow", messageID);
    });


    //receive a msg from any one client
    //event name should be the same in script.js (now both are "message")
    socket.on("message", function (incomingMessage) {
        console.log("got new message", incomingMessage);

        let id = incomingMessage.id;
        let sender = incomingMessage.sender;
        let text = incomingMessage.message;

        //split the content by word
        // map words into emoji
        // send the converted messages back to the client end
        let words = text.split(" ");
        let converted = words.map(word => getEmoji(word) || word).join(" ");
        console.log(emoji.names);

        let messageToAllClients = {
            id: id,
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
