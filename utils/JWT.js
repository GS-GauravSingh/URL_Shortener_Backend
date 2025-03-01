const environmentVariables = require("../environmentVariables");
const jsonWebToken = require("jsonwebtoken");

const generateJwtToken = (payload) => {
	return jsonWebToken.sign(payload, environmentVariables.JWT_SECRET_KEY, {
		expiresIn: "7d", // Token expires in 7 days
	});
};

const verifyJwtToken = (token) => {
	try {
		return jsonWebToken.verify(token, environmentVariables.JWT_SECRET_KEY);
	} catch (error) {
		return null; // Return `null` if the token is invalid or expired
	}
};

module.exports = { generateJwtToken, verifyJwtToken };
