'use strict';
var Promise = require('promise');
var logger = require('../logger');
var config = require('../config');
var oauth = require('oauth-wrap');
var svApi = require('sv-api');

module.exports.process = function(message) {
	var oauthRequest = config.oauthWrapRequest;
	var promise = new Promise(function(resolve, reject) {
		switch(message.eventId) {
			case 401:
				logger.debug('got a good one: ', message.message.eventId);
				oauth.getAuthHeader(oauthRequest.url,
	            	oauthRequest.creds.uid,
	            	oauthRequest.creds.pwd,
	            	oauthRequest.wrapScope)
					.then(function(authorization) {
						svApi.documents.get(config.svApi.rootUrl, authorization, message.message.documentId, config.outputDir)
							.then(function(result) { logger.debug(result); })
							.catch(function(error) { 
								logger.debug(error);
								reject(error);
							});
					})
					.catch(function(error) {
					 	reject(error);
					 });
				break;

			default:
				logger.debug('Unexpected event type detected: ', message.eventId);
				resolve;
		}
	});

	return promise;
}