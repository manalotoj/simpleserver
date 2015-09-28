// module that will write transform event notifications and write them to the db
var logger = require('../logger');
var schemas = require('./schemas/schemas');

var createMessages = function(notifications) {
	var messages = [];
	for(i = 0; i < notifications.length; i++) {
		var message = createMessage(notifications[i]);
		if (message) messages.push(message);
	}
	return messages;
}

var  createMessage = function(notification) {
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

module.exports.save = function(db, notifications) {
	var messages = createMessages(notifications);
	schemas.db = db;
	
	// todo: save to mongodb
	// 
	return messages;
}