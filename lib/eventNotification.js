// module that will write transform event notifications and write them to the db
var config = require('../config');
var logger = require('../logger');

var createMessages = function(db, notifications) {
	var messages = [];
	
	for(i = 0; i < notifications.length; i++) {
		var message = createMessage(notifications[i]);
		if (message) messages.push(message);
	}

	return messages;
}

var  createMessage = function(eventNotifications) {
	var eventId;
	var message;
	var now = new Date();
	try {
		eventId = parseInt(eventNotifications.EventNotificationId);
		logger.debug('eventId: ', eventId);

		if (!isNaN(eventId)) {
			message = {
				eventId: eventId, 
				receivedDate: now,
				updateDate: now,
				processedDate: null,
				isProcessed: false,
				retryCount: 0,
				maxRetryCount: config.maxRetryCount,
				errorMessage: null,			
				message: {
						eventId: eventId,						
						studentId: eventNotifications.StudentId, 
						transactionId: eventNotifications.SvTransactionId, 
						transactionCategory: eventNotifications.SvTransactionCategoryId,
						awardYear: eventNotifications.AwardYear,
						documentId: eventNotifications.SvDocumentId
				}
			};
		} else {
			logger.warn('Invalid eventNotifications detected: ', eventNotifications);			
		}		
	} catch(e) {
		logger.warn('Invalid eventNotifications detected: ', eventNotifications);
	}	
	return message;
}

module.exports.save = function(db, eventNotifications) {
	schemas.db = db;
	var messages = createMessages(db, eventNotifications);
	Model.collection.insert(messages, {}, function(error) { logger.debug(error.stack); });
	return messages;
}