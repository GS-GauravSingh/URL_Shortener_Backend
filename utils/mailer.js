const nodemailer = require("nodemailer");
const environmentVariables = require("../environmentVariables");

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: environmentVariables.NODEMAILER_USERNAME,
		pass: environmentVariables.NODEMAILER_PASSWORD,
	},
	logger: true, // Enable logging for debugging
	debug: true, // Enable debug mode
});

async function mailer({ recipientEmail, subject, textMessage, htmlMessage }) {
	try {
		const info = await transporter.sendMail({
			from: environmentVariables.NODEMAILER_USERNAME,
			to: recipientEmail,
			subject: subject,
			text: textMessage,
			html: htmlMessage,
		});

		console.log("OTP sent successfully: ", info);
	} catch (error) {
		console.error("Error sending OTP email:", error);
		throw new Error("Failed to send OTP email");
	}
}

module.exports = mailer;
