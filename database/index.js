const mongoose = require("mongoose");

// Database Connection Logic.
async function connectMongoDB(mongoDbUrl) {
	try {
		await mongoose.connect(mongoDbUrl);
		console.log("MongoDB Connected Successfully!!");
	} catch (error) {
		console.log("MongoDB conection error.", error);
	}
}

module.exports = connectMongoDB;
