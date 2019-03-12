module.exports = Object.freeze({
	port: 4040,
	host: 'ec2-35-183-117-173.ca-central-1.compute.amazonaws.com:4040',
    canvasWidth: 500,
    canvasHeight: 500,
    drawDelay: 5, // interval to draw in minutes
    boardTable: 'canvas', //Name of board key in Redis
    UINT_SIZE: 'u4', // Size of unsigned int
    mySQL: {
	    connection: {
	    	host: 'myplacedb.csot5zzwynq0.ca-central-1.rds.amazonaws.com',
		    user: 'admin',
		    password : "Passw0rd",
		    port: '3306',
		    database: 'myplacedb',
		    multipleStatements: true
	    },
	    createUserHistoryQuery: "create table if not exists userHistory(userId varchar(25) key, lastTileTime TIMESTAMP not null);",
	    createBoardHistoryQuery: "create table if not exists boardHistory(pos varchar(25) key, userId varchar(25), colour varchar(50), lastTileTime TIMESTAMP not null);"

    },
    DEFAULT_COLOR_PALETTE: [
      '#FFFFFF', // white
      '#E4E4E4', // light grey
      '#888888', // grey
      '#222222', // black
      '#FFA7D1', // pink
      '#E50000', // red
      '#E59500', // orange
      '#A06A42', // brown
      '#E5D900', // yellow
      '#94E044', // lime
      '#02BE01', // green
      '#00D3DD', // cyan
      '#0083C7', // blue
      '#0000EA', // dark blue
      '#CF6EE4', // magenta
      '#820080', // purple
    ]
});

