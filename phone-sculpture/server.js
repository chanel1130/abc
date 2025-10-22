const express = require('express');
const http = require("http");
const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour

const portHTTPS = 3001; // port for https

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

let real;
let reflection;
let conductor;
io.on("connection", (socket) => {

    console.log('a user connected', socket.id);

    socket.on("disconnect", function () {
        console.log("someone disconnected");
    });

    socket.on("my-role", function (data) {
        console.log(data);
        if (data.role == "real") {
            real = socket.id;
            if (conductor) {
                io.to(conductor).emit("new-sculpture")
            }
        } else if (data.role == "reflection") {
            reflection = socket.id;
            if (conductor) {
                io.to(conductor).emit("new-sculpture")
            }
        
        } else if (data.role == "conductor") {
            conductor = socket.id;

        }

    })

    socket.on("orientation-data", (data) =>{
        if(real) io.to(real).emit("draw", data);
        if(reflection) io.to(reflection).emit("draw", data);
    })

    socket.on("size-data",(data) =>{
        if(real) io.to(real).emit("size", data);
        if(reflection) io.to(reflection).emit("size", data);
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




