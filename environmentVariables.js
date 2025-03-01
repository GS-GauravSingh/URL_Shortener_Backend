const dotenv = require("dotenv");

// loading environment variable (.env) file.
dotenv.config();

const environmentVariables = {
	PORT: process.env.PORT,
	MONGO_DB_URL: process.env.MONGO_DB_URL,
	NODEMAILER_USERNAME: process.env.NODEMAILER_USERNAME,
	NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};

module.exports = environmentVariables;
