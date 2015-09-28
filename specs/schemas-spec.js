jasmine.getEnv().addReporter(new jasmine.ConsoleReporter(console.log));

var x = require('../lib/schemas/schemas');
var db = require('mongoose-promised');
db.connect('localhost:27017/sv-event-notifications');

describe("sv-api.isirs", function() {
	it('test', function(done) {		
		expect(db).toBeDefined();		

		var Notification = x.createModel(db, 'Notification');
		var notification = new Notification(
			{ 
				eventId: 401, 
				receivedDate: new Date(),
				updateDate: new Date(),
				processedDate: null,
				isProcessed: false,
				retryCount: 0,
				maxRetryCount: 3,
				errorMessage: null,
				message: { eventId: 401, documentId: '27388' }
			});
		expect(notification.saveQ).toBeDefined();
		notification.saveQ()
			.then(function() {				
				notification.removeQ().then(function(){ done();});
				done();
			})
			.fail(function(error) { 
				console.log(error.stack);
				done(new Error(error));
			})
	});

/*
	it('test', function() {		
		expect(db).toBeDefined();
		//expect(x.createModel).toBeDefined();

		var schema = new db.Schema({ test: 'string' });
		var Test = db.model('Test', schema);
		var testing = new Test({test: '12345'});
		console.log(testing);
		testing.save(function(err) {
			if (err) {
				console.log(err);
			} else {
				done();
			}
		});
	});	
*/	
});