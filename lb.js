const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });


// dimensions of the board needed here so that we can divide up the work between all sockets
var xdim = 1000; //x axis
var ydim = 500; //y axis

var numSockets = 1; // num machines that will handle a section of the board
var ranges = Math.floor(xdim / numSockets); // range that each socket will handle
var whichSocket = new Array(numSockets);
//go through array only if num of sockets is greater than one (machine)
for (i = 0; i < numSockets - 1; i++) {
    whichSocket[i] = ranges * (i + 1);
}
whichSocket[numSockets - 1] = xdim; // add final dimension possiblility (greatest x which is xdim)

var hosts = new Array(numSockets);
hosts = ["localhost"];
var ports = new Array(numSockets);
ports = [8082]

wss.on('close', function() {
    console.log('8081disconnected');
});


wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};


// for heartbeat to make sure connection is alive 
function noop() {}

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', function(ws) {
    // heartbeat
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    // when we get a message from the client
    ws.on('message', function(message) {
        console.log(message);
        //var o = JSON.parse(message);

        /*
        // assess o.x to see which section (and therefore which socket to send to)
        for (i = 0; i < numSockets; i++) {
            if (numSockets[i] > o.x) {
                var sendSocket = i; // array index that will be used to pick which socket to send to
            }
        }
        */

        //**********server socket opening*********
        var serversocket;
        // socket = new WebSocket("ws://cslinux.utm.utoronto.ca:8001");
        // socket = new WebSocket("ws://localhost:8001");
        serversocket = new WebSocket("ws://" + hosts[0] + ":" + ports[0] + "");

        serversocket.onopen = function(event) {
            console.log("serversocket connected");
        };
        serversocket.onclose = function(event) {
            alert("closed code:" + event.code + " reason:" + event.reason + " wasClean:" + event.wasClean);
        };
        //****************************************

        serversocket.send(message);

    });
});

// Static content
var express = require('express');
var app = express();

// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html
app.use('/', express.static('static_files')); // this directory has files to be returned

app.listen(8085, function() {
    console.log('Load balancer listening on port 8085!');
});