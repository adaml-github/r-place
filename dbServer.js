var express = require('express');
var app = express();

const constants = require('./constants');
var dbUtils = require('./dbUtils');

var board = "";

function getBoardState(res) {
    var canvas = new Uint8Array(constants.canvasWidth * (constants.canvasHeight/2));
    var offset = 0;
    var timestamp;
    
    //For each chunk -> reshift the bits to get the appropriate colour value
    function handleChunk(responseArray) {
        // Each byte in the responseArray represents two values in the canvas
        for (var i = 0; i < responseArray.byteLength; i++) {
            canvas[offset + 2 * i] = responseArray[i] >> 4;
            canvas[offset + 2 * i + 1] = responseArray[i] & 15;
        }
		offset += responseArray.byteLength * 2;
    }
    //redis.get(constants.boardTable, function(err, result) {
    dbUtils.getRedisBoard('canvas',function(result) {
        handleChunk(new Uint8Array(result));
    	board = canvas;
        if (res){
        	res.end(JSON.stringify(board));
        }
	
    });
}

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://' + constants.host);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function (req, res) {
	if (board.length) {
		res.end(JSON.stringify(board));
	} else {
		getBoardState(res);
	}
})

setInterval(function () {
	getBoardState();
}, 1000);

var server = app.listen(2021, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
})
