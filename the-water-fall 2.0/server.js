const express = require('express');
const http = require("http");
const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour

const portHTTPS = 4201; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));



// to unpack json
// const bodyParser = require('body-parser')//add this
// app.use(bodyParser.json())


// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("localhost-key.pem"),
    cert: fs.readFileSync("localhost.pem"),
};


const HTTPSserver = https.createServer(options, app);
const { Server } = require('socket.io'); //include library
const io = new Server(HTTPSserver); //start socket io




let one;
let two;
let three;
let four;

io.on("connection", (socket) => {

    console.log('a user connected', socket.id);

    socket.on("disconnect", function () {
        console.log("someone disconnected");
    });

    socket.on("my-number", function (data) {
        console.log(data);
        if (data.number == "1") {
            one = socket.id;
        }
        else if (data.number == "2") {
            two = socket.id;
        }
        else if (data.number == "3") {
            three = socket.id;
        }else if (data.number == "4"){
            four = socket.id;
        }

    })


    socket.on("ball-finished", (data) => {
        if (data.from == "1" && two) {
            io.to(two).emit("new-ball", { y: data.y, size: data.size });
        }
        else if (data.from == "2" && three) {
            io.to(three).emit("new-ball", { y: data.y, size: data.size });
        }
        else if (data.from == "3" && four) {
            io.to(four).emit("new-ball", { y: data.y, size: data.size });
        } 
        else if (data.from == "4" && four) {
            io.to(four).emit("ball-bounce", { y: data.y, size: data.size });
        }
    });

    socket.on("ball-bounce-to-next-screen", (data) => {

        if (data.from == "4" && three) {
            io.to(three).emit("ball-bounce", { y: data.y, size: data.size, vy: data.vy, gy: data.gy });
        }
        if (data.from == "3" && two) {
            io.to(two).emit("ball-bounce", { y: data.y, size: data.size, vy: data.vy, gy: data.gy });
        }
       if (data.from == "2" && one) {
            io.to(one).emit("ball-bounce", { y: data.y, size: data.size, vy: data.vy, gy: data.gy });
        }
    })


})



// Creating https server by passing
// options and app object
// https.createServer(options, app).listen(portHTTPS, function (req, res) {
//     console.log("HTTPS Server started at port", portHTTPS);
// });

HTTPSserver.listen(portHTTPS, function (req, res) {
    console.log("HTTPS Server started at port", portHTTPS)
});




