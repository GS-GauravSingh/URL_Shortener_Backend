const UserModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../utils/CustomError");

// Get Me
module.exports.getMe = asyncHandler(async (req, res, next) => {
	// Extract the user details form the request object.
	const { user } = req;

	// Send a successfull response back to the frontend.
	return res.status(200).json({
		status: "success",
		message: `Welcome, ${user.firstname}! Let's make your links shorter and smarter.`,
		user,
	});
});
