const UserModel = require("../models/userModel");
const otpEmailTemplate = require("../template/otpEmailTemplate");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../utils/CustomError");
const otpGenerator = require("otp-generator");
const mailer = require("../utils/mailer");
const { generateJwtToken, verifyJwtToken } = require("../utils/JWT");
const environmentVariables = require("../environmentVariables");

// Register/Signup
module.exports.register = asyncHandler(async (req, res, next) => {
	// get user details from the `req.body`.
	const { firstname, lastname, email, password } = req.body;

	// Step 1: We need to check if there is any account already present in our database with the provided email.
	const accountAlreadyExists = await UserModel.findOne({
		email,
	});

	if (accountAlreadyExists && accountAlreadyExists.verified) {
		// Account already exists and is verified
		throw new CustomError("Account already exists! Login Instead.", 400);
	}

	if (accountAlreadyExists && !accountAlreadyExists.verified) {
		// it means account exists but it's not verified.
		// In this case delete this record and create a new one.
		await UserModel.findOneAndDelete({ email: email });
	}

	// Step 2: So as we reached the step 2. In this step, we create a new user inside our database.
	const user = await UserModel.create({
		firstname,
		lastname,
		email,
		password,
	});

	// Step 3: Store the newly created user document id in the request object and call the next middleware.
	req.userId = user._id;
	next();
});

// Send OTP
module.exports.sendOTP = asyncHandler(async (req, res, next) => {
	// get the user document id from the request object.
	const { userId } = req;

	// Step 1: find the user document using the id.
	const user = await UserModel.findById(userId);

	// Step 2: Generate a 4-digit OTP using the `otp-generator` npm package.
	const generatedOtp = otpGenerator.generate(4, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});

	// Step 3: Store the generate OTP to the user document in the database.
	user.otp = generatedOtp.toString(); // converting OTP (in Number format) to String format.
	user.otpExpiryTime = Date.now() + 2 * 60 * 1000; // once generated OTP will expire in 2 minutes.

	// save the changes
	await user.save({
		validateModifiedOnly: true, // run validation on updated fields only.
	});

	// Step 4: Send OTP to the user email address.
	const userName = `${
		user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1)
	} ${user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1)}`;

	const htmlEmail = otpEmailTemplate(userName, generatedOtp);

	await mailer({
		recipientEmail: user.email,
		subject: "URL Shortener: OTP for verification",
		textMessage: `Your OTP for URL Shortener is: ${generatedOtp}.`,
		htmlMessage: htmlEmail,
	});

	// Step 5: if we reach this step, it means OTP sent successfully.
	return res.status(200).json({
		status: "success",
		message: "OTP Sent Successfully!",
	});
});

// Resend OTP
module.exports.resendOTP = asyncHandler(async (req, res, next) => {
	// get the user email from the req.body.
	const { email } = req.body;

	// Step 1: find the user document using the email.
	const user = await UserModel.findOne({ email: email });

	// simple check: whether user with given email is present in the database or not.
	if (!user) {
		// return next(new CustomError("Invalid email: User not found.", 400));
		throw new CustomError("Invalid email: User not found.", 400);
	}

	// Step 2: Generate a 4-digit OTP using the `otp-generator` npm package.
	const generatedOtp = otpGenerator.generate(4, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});

	// Step 3: Store the generate OTP to the user document in the database.
	user.otp = generatedOtp;
	user.otpExpiryTime = Date.now() + 2 * 60 * 1000; // once generated OTP will expire in 2 minutes.

	// save the changes
	await user.save({
		validateModifiedOnly: true, // run validation on modified fields only.
	});

	// Step 4: Send OTP to the user email address.
	const userName = `${
		user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1)
	} ${user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1)}`;

	const htmlEmail = otpEmailTemplate(userName, generatedOtp);
	mailer({
		recipientEmail: user.email,
		subject: "URL Shortener: OTP for verification",
		textMessage: `Your OTP for URL Shortener is: ${generatedOtp}.`,
		htmlMessage: htmlEmail,
	});

	// Step 5: if we reach this step, it means OTP sent successfully.
	return res.status(200).json({
		status: "success",
		message: "OTP Re-Sent Successfully!",
	});
});

// Verify OTP
module.exports.verifyOTP = asyncHandler(async (req, res, next) => {
	// get the user email and otp from the req.body.
	const { email, otp } = req.body;

	// Step 1: find the user document using the email and OTP expiry time.
	// if otpExpiryTime is greater than current time, it means that OTP hasn't expired yet because otpExpiryTime is storing the time at which OTP is created.
	const user = await UserModel.findOne({
		email: email,
		otpExpiryTime: { $gt: Date.now() },
	}).select("-password");

	// Step 2: If the OTP has expired then we are unable to find the document in the above query. In this case the `user` will be `null`.
	if (!user) {
		// OTP has expired.
		throw new CustomError(
			"Either the email was incorrect, or the OTP was expired.",
			400
		);
	}

	// Step 3: Check whether user is already verified or not.
	if (user.verified) {
		// User is already verified
		throw new CustomError("Email is already verified.", 400);
	}

	// Step 4: Check whether user enters the correct otp or not.
	if (!(await user.isOtpCorrect(otp))) {
		throw new CustomError("Incorrect OTP!!", 400);
	}

	// Step 5: if we reach here, it means user entered the correct OTP. Now generate JWT token and send a successfull response.

	// But first, set the user to verified.
	user.verified = true;
	user.otp = undefined;
	user.otpExpiryTime = undefined;

	// save the changed made to ths user document.
	const updatedUser = await user.save({
		validateModifiedOnly: true, // Runs validation only on modified fields
	});

	const token = generateJwtToken({ userId: user._id });

	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	};

	if (environmentVariables.NODE_ENV === "production") {
		cookieOptions.secure = true; // Ensures the cookie is only sent over HTTPS.
	}

	return res.status(201).cookie("token", token, cookieOptions).json({
		status: "success",
		message: "Email Verified Successfully.",
		user: updatedUser,
		token,
	});
});

// Login/Signin
module.exports.login = asyncHandler(async (req, res, next) => {
	// take out email and password from the `req.body`.
	const { email, password } = req.body;

	// simple check: if any of the required fileds are missing.
	if (!email || !password) {
		throw new CustomError(
			"Some required fields are missing. Both email and password is required.",
			400
		);
	}

	// Step 1: find the user.
	const user = await UserModel.findOne({ email: email }).select("+password");
	//  `.select("+password")` method in Mongoose is used to explicitly include a field that is excluded by default in the schema.

	// simple check: we are able to find the user document or not.
	if (!user) {
		throw new CustomError("User not found, Signup instead.", 400);
	}

	// Step 2: check whether user entered the correct password or not.
	if (!(await user.isPasswordCorrect(password))) {
		throw new CustomError("Incorrect Password!!", 400);
	}

	// Step 3: Password is correct. Not, generate JWT token and send a successfull response.
	const token = generateJwtToken({ userId: user._id });

	// we don't want to send the password field to the client.
	user.password = undefined; // we are not saving this change because saving the document will make the password field undefined in the database and we don't want that.

	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	};

	if (environmentVariables.NODE_ENV === "production") {
		cookieOptions.secure = true; // Ensures the cookie is only sent over HTTPS.
	}

	return res.status(200).cookie("token", token, cookieOptions).json({
		status: "success",
		message: "Logged In Successfully!",
		user,
		token,
	});
});

// isUserAuthenticated
module.exports.isUserAuthenticated = asyncHandler(async (req, res, next) => {
	let token;

	// Extract the token, it can be present in cookies or in headers.
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies.token) {
		token = req.cookies.token;
	}

	// check if token exists
	if (!token) {
		throw new CustomError(
			"You are not logged in! Please log in to access the application.",
			401
		);
	}

	// Decode the token
	const decoded = verifyJwtToken(String(token));

	// Check if the user still exists
	const user = await UserModel.findById(decoded.userId).select("-password");

	if (!user) {
		throw new CustomError(
			"The user belonging to this token no longer exists. Log-in instead.",
			401
		);
	}

	// Check if the token is still valid (after a password change)
	if (!user.isTokenValid(decoded.iat)) {
		throw new CustomError(
			"Invalid Token: The user may have recently changed their password.",
			401
		);
	}

	// Attach user to request object
	req.user = user;
	next();
});
