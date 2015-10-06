var express = require('express');
var timeout = require('connect-timeout'); 
var bodyParser = require('body-parser');
var logger = require('./logger');
var config = require('./config');
var documentProcessor = require('./lib/document');
var eventNotification = require('./lib/eventNotification');
var queue = require('./lib/eventQueue');

var serverConfig = config.server;
var app;


//
// configure database
// 
//var db = require('mongoose');
//db.connect(config.dbConn);

function parse(request) {

	var notifications = request.body;
	if (!notifications || notifications.length === 0) { 
		logger.info('no event notifications received.')
		return 
	};

	// add each message to queue
	var messages = eventNotification.save(db, notifications);
	logger.debug('count: ', messages.length);
}

var initApp = function() {
	logger.debug('begin initApp');

	var app = express();
	app.use(timeout(serverConfig.timeout));
	app.use(bodyParser.json({ extended: false }));

	app.get('/', function (req, res) {
	  res.send('Hello World!');
	});

	app.post('/', function(request, response) {
		parse(request);
		response.sendStatus(200);
	});

	var server = app.listen(serverConfig.port, function () {
	  var host = server.address().address;
	  var port = server.address().port;
	  logger.debug('App listening at http://%s:%s', host, port);
	});
}

var main = function() {
	var queueingConfig = config.queueing;
	queueingConfig.conn = config.conn;

	queue.init(queueingConfig)
		.then(function(db) {
			logger.debug('queue init complete');
			initApp();
		})
		.catch(function(err) {
			logger.warn(err.stack);
			setTimeout(process.exit(1), 3000);
		});
}

main();