var notificationSchema;

var root = { 
	createSchema: function(db, schemaName) {
		var schema;
		switch (schemaName) {
			case 'Test':
				schema = new db.Schema({ test: String });
				break;
			case 'Notification':
				if (notificationSchema) {
					schema = notificationSchema;
				} else {
					schema = new db.Schema({
						eventId: Number,
						receivedDate: Date,
						updatedDate: Date,
						processedDate: Date,
						isProcessed: Boolean,
						retryCount: Number,
						maxRetryCount: Number,
						errorMessage: String,
						message: {
							eventId: Number,
							studentId: String, 
							transactionId: String, 
							transactionCategory: String,
							awardYear: String,
							documentId: String
						}
					});
				}
				break;
			default:
				break;
		}
		return schema;
	},
	createModel: function(db, name) {
		var schema = this.createSchema(db, name);
		return db.model(name, schema);
	}	
};

module.exports = root;