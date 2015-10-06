'use strict';

var assert = require('assert');
var Promise = require('promise');
var logger = require('../logger');

var mongodb = require('mongodb');
var mongoDbQueue = require('mongodb-queue');
var dbConnect = Promise.denodeify(mongodb.MongoClient.connect);

var queue = null;
var deadQueue = null;
var initialized = false;
var database = null;

var notifQ = {
	logger: logger
}

var init = function(config) {
	notifQ.logger.debug('begin init');
	if (initialized === true) {
		notifQ.logger.debug('eventQueue already initialized; nothing to do');
		return;
	}

	var promise = new Promise(function(resolve, reject) {
		dbConnect(config.conn)
			.then(function(db) {
				notifQ.logger.debug('connected to mongodb');

				database = db;
				var queueing = config.queueing;
		    deadQueue = mongoDbQueue(db, config.deadQueueName);
				queue = mongoDbQueue(db, 
					config.queueName, 
					{ visibility : config.visibility, deadQueue: deadQueue, maxRetries: config.maxRetries }
				);
		    assert.notEqual(undefined, queue, 'queue is not defined');
		    assert.notEqual(undefined, deadQueue, 'deadQueue is not defined');
		    notifQ.logger.debug('queues created');
		    resolve(db);
			})
			.catch(function(err) {
				notifQ.logger.warn('initialization failed', err.stack);
				reject(err);
			});
	});

	return promise;
}

var ack = function(msg) {
	var promise = new Promise(function(resolve, reject) {
		queue.ack(msg.ack, function(err, id) {
			if (err === undefined) {
				resolve();
				logger.debug('message %s acknowleged', id);
			} else {
				logger.warn('failed to ack message %s: %s', id, err.stack);
				reject();
			}
		});
	});
	
	return promise;
}

var get = function() {
	var promise =  new Promise(function(resolve, reject) {
		queue.get(function(err, msg) {
			if (err === undefined) {
				resolve(msg);
				logger.debug('message %s acknowleged', id);
			} else {
				logger.warn('failed to ack message %s: %s', id, err.stack);
				reject();
			}
		});
	});
	
	return promise;
}

notifQ.init = init;
notifQ.ack = ack;
notifQ.get = get;

module.exports = notifQ;