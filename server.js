const constants = require('./constants');
var dbUtils = require('./dbUtils')
var moment = require('moment');

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: constants.port+1 });
// var board = dbUtils.createRedisBoard(dim);


// dbUtils.queryMySQL("DROP TABLE userHistory;", console.log)
// dbUtils.queryMySQL("DROP TABLE boardHistory;", console.log)

// var insert ="INSERT INTO userHistory (userId, lastTileTime) VALUES ('" + "142.168.0.1" + "', '" + moment().utc().format('hh:mm:ss') + "')";
// dbUtils.queryMySQL(insert, console.log)

dbUtils.createUserHistoryTable();
dbUtils.createBoardHistoryTable();
dbUtils.queryMySQL("SELECT userId, lastTileTime FROM userHistory");
dbUtils.queryMySQL("SELECT * FROM boardHistory");

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

function isValidSet(o){
    var isValid=false;
    try {
       isValid = 
        Number.isInteger(o.x) && o.x!=null && 0<=o.x && o.x<constants.canvasWidth &&
        Number.isInteger(o.y) && o.y!=null && 0<=o.y && o.y<constants.canvasHeight && 
        Number.isInteger(o.colour) && o.colour!=null && 0<=o.colour && o.colour<=15;
    } catch (err){ 
        isValid=false; 
    } 
    return isValid;
}
wss.on('connection', function(ws) {
        // heartbeat
        ws.isAlive = true;
        ws.on('pong', heartbeat);
        
        var address = ws._socket.remoteAddress;

        // when we get a message from the client
        ws.on('message', function(message) {
            console.log(message);
            var o = JSON.parse(message);

            if(isValidSet(o)){
                colour = o.colour;
                var pos = o.canvas + ":" + o.x + ":"+ o.y

                var lastTimestampQuery = "SELECT * FROM userHistory WHERE userId = '" + address + "' AND lastTileTime >= NOW() - INTERVAL 5 MINUTE";
                //lastTimestampQuery = lastTimestampQuery +" OR TRUE";
				var saveLastTimestampQuery ="INSERT INTO userHistory (userId, lastTileTime) VALUES ('" + address + "', NOW()) ON DUPLICATE KEY UPDATE lastTileTime = NOW() ";
                var insertBoardHistory = "INSERT INTO boardHistory (pos,userId,colour,lastTileTime) VALUES ('" + pos + "' ,'" + address + "', '"+JSON.stringify(colour)+"', NOW()) ";
                insertBoardHistory = insertBoardHistory + "ON DUPLICATE KEY UPDATE userId='" + address+"', colour='"+JSON.stringify(colour)+"', lastTileTime=NOW();"
                //Callback funciton only called upon success
                dbUtils.queryMySQL(lastTimestampQuery, function(result){
                    if (result.length && false){
                        //They updated too recently
                        console.log("Go away bruh");
                    } else {
                        //If no timestamp was found within last X minutes
                        //Insert into board history
                        dbUtils.queryMySQL(insertBoardHistory, function(result){
                            dbUtils.queryMySQL(saveLastTimestampQuery, function(result){
                                // Update board
								console.log(message)
								console.log("help")
                                dbUtils.setRedisBoard(o.canvas,o.x,o.y,colour);
                                wss.broadcast(message);
                            });
                        });  
                    }
                    
                });
            }
        });
        
    });

// heartbeat (ping) sent to all clients
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

// Static content
var express = require('express');
var app = express();

// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html
app.use('/',express.static('static_files')); // this directory has files to be returned

app.listen(constants.port, function () {
  console.log('Example app listening on port 4040!');
});


