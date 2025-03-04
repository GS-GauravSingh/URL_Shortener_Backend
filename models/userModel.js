const mongoose = require("mongoose");
const validator = require("validator"); // `validator` is a Node.js library used for string sanitization and validation.
const bcrypt = require("bcrypt"); // library used to hash passwords.

const userSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			trim: true,
			required: [true, "First name is required."],
		},

		lastname: {
			type: String,
			trim: true,
		},

		email: {
			type: String,
			trim: true,
			unique: true,
			required: [true, "Email is required."],
			validate: {
				validator: function (email) {
					// isEmail(): Checks if a string is a valid email or not, if it is a valid email, then it return true. Otherwise, it return false.
					return validator.isEmail(email);
				},
				message: (prop) =>
					`${prop.value} is not a valid email address!`,
			},
		},

		password: {
			type: String,
			required: [true, "Password is required."],
			minLength: [6, "Password must be at least 6 characters long."],
		},

		passwordChangedAt: {
			type: Date,
		},

		otp: {
			type: String,
		},

		otpExpiryTime: {
			type: Date,
		},

		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Mongoose allows us to define middlewares (also called pre and post hooks) that can be executed before or after certain Mongoose operations like save, remove, updateOne, etc.
userSchema.pre("save", async function (next) {
	// Hashing Password
	if (this.password && this.isModified("password")) {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(this.password, saltRounds);
		this.password = hashedPassword;
	}

	// Hashing OTP
	if (this.otp && this.isModified("otp")) {
		const saltRounds = 10;
		const hashedOTP = await bcrypt.hash(this.otp, saltRounds);
		this.otp = hashedOTP;
	}

	next();
});

// Mongoose allows us to define instance methods on schemas.
userSchema.methods.isPasswordCorrect = async function (userEnteredPassword) {
	return await bcrypt.compare(userEnteredPassword, this.password);
};

userSchema.methods.isOtpCorrect = async function (userEnteredOtp) {
	return await bcrypt.compare(userEnteredOtp, this.otp);
};

userSchema.methods.isTokenValid = function (jwtTimestamp) {
	// If the user has changed their password after the token was issued. Then `this.passwordChangedAt` is not `undefined` it must contain a date object.
	if (this.passwordChangedAt) {
		// Convert JWT timestamp to milliseconds and compare
		// JWT timestamps (iat - issued at) are in seconds.
		return jwtTimestamp * 1000 > this.passwordChangedAt.getTime();
	}

	// if passwordChangedAt is undefined (i.e., the password was never changed after token issuance).
	return true;
};

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
