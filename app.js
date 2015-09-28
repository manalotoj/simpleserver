var express = require('express');
var bodyParser = require('body-parser');
var logger = require('./logger');
var config = require('./config');
var documentProcessor = require('./lib/document');
var eventNotification = require('./lib/eventNotification');

var db = require('mongoose-promised');
db.connect('localhost:27017/sv-event-notifications');

var app = express();
app.use(bodyParser.json({ extended: false }));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

function parse(request) {
	//logger.debug(request.body);
	var notifications = request.body;
	if (!notifications || notifications.length == 0) { 
		logger.warn('no event notifications received.')
		return 
	};

	var messages = eventNotification.save(notifications);
	for(i = 0; i < messages.length; i++) {
		var message = messages[i];
		
		// look for document events
		if (message.eventId > 400 && message.eventId < 500) {
			documentProcessor.process(message)
				.then(console.log('doc processing successful!'))
				.catch(function(error) { logger.warn(error.stack); });
		}
	}
}

function processDocumentEvent(db, message) {
	var oauthRequest = config.oauthWrapRequest;

	switch(message.eventId) {
		case 401:
			logger.debug('got a good one: ', message.eventId);
			oauth.getAuthHeader(oauthRequest.url,
            	oauthRequest.creds.uid,
            	oauthRequest.creds.pwd,
            	oauthRequest.wrapScope)
				.then(function(authorization) {
					svApi.documents.get(config.svApi.rootUrl, authorization, message.documentId, config.outputDir)
						.then(function(result) { console.log(result); })
						.catch(function(error) { logger.warn(error.stack); });
				})
				.catch(function(error){ logger.warn(error.stack); });
			break;

		default:
			logger.debug('Unexpected event type detected: ', message.eventId);
	}
}

function createMessages(notifications) {
	var messages = [];
	for(i = 0; i < notifications.length; i++) {
		var message = createMessage(notifications[i]);
		if (message) messages.push(message);
	}
	return messages;
}

function createMessage(notification) {
	var eventId;
	var message;
	try {
		eventId = parseInt(notification.EventNotificationId);
		logger.debug('eventId: ', eventId);

		if (!isNaN(eventId)) {
			message = { 
				eventId: eventId,
				studentId: notification.StudentId, 
				transactionId: notification.SvTransactionId, 
				transactionCategory: notification.SvTransactionCategoryId,
				awardYear: notification.AwardYear,
				documentId: notification.SvDocumentId
			};
		} else {
			logger.warn('Invalid notification detected: ', notification);			
		}		
	} catch(e) {
		logger.warn('Invalid notification detected: ', notification);
	}	
	return message;
}

app.post('/', function(request, response) {
	parse(request);
	response.sendStatus(200);
});

/*
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
*/
  app.listen(3000);

  //console.log('Example app listening at http://%s:%s', host, port);
//});