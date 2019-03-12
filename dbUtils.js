var constants = require('./constants');
var mysql = require('mysql');
var moment = require('moment');
var Redis = require('ioredis');
var redis_address = process.env.REDIS_ADDRESS || 'redis.uoikke.ng.0001.cac1.cache.amazonaws.com:6379';

var redis = new Redis(redis_address);
module.exports = {
	createMySQLConnection: function(){
		return connection = mysql.createConnection(constants.mySQL.connection);
	},
	queryMySQL: function(query, callback) {
		var connection = module.exports.createMySQLConnection();
		console.log("Querying mySQL: " +query)
		
		connection.connect(function(err) {
		  if (err) {
		    console.error('Database connection failed: ' + err.stack);
		    return;
		  }

		  connection.query(query, function (err, result, fields) {
		    if (err) {
		        console.log(err.message)
		        return
		    };
		    console.log("Returned result: ");
		    console.log(result)
		    if (callback){
		    	callback(result);
		    }
		  });
		 
		  connection.end(function(err) {
		    if (err) {
		      return console.log(err.message);
		    }
		  });
		});

	},
    createUserHistoryTable: function() {
    	module.exports.queryMySQL(constants.mySQL.createUserHistoryQuery)
    },
    createBoardHistoryTable: function() {
    	module.exports.queryMySQL(constants.mySQL.createBoardHistoryQuery)
    },
    dropUserHistoryTable: function(){
    	module.exports.queryMySQL("DROP TABLE userHistory;")
    },
    //REDIS
    createRedisBoard: function(dim) {
    	var board=new Array(dim);
		var date = moment.now();
		for(var x=0;x<dim;x++){
		    board[x]=new Array(dim);
		    for(var y=0;y<dim;y++){
		        var white = { 'r':255, 'g':255, 'b':255 };
		        board[x][y]=white;
		    }
		}
		redis.set(constants.boardTable, JSON.stringify(board));
		return board;
    },
    getRedisBoard: function(canvas,callback) {
	    return redis.getBuffer(canvas, function (err, result) {
			if (err) {
				console.error(err);
			} else {
				if (callback){
					callback(result)	
				}
			}
		})
	},
    getRedis: function(key,callback){
    	return redis.get(key, function (err, result) {
			if (err) {
				console.error(err);
			} else {
				if(callback){
					callback(result)	
				}
			}
		});
    },
    setRedisBoard: function(canvas,x,y,colour){
    	offset = y * constants.canvasWidth + x
    	return redis.bitfield(canvas, 'SET', constants.UINT_SIZE, '#' + offset, colour);
    }
}

