const environmentVariables = require("../environmentVariables");
const UrlModel = require("../models/urlModel");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../utils/CustomError");
const { nanoid } = require("nanoid"); // npm package for genarating short unique ids.

// Generate New Short URL
module.exports.generateNewShortUrl = asyncHandler(async (req, res, next) => {
	const { url } = req.body;
	const { user } = req;
	if (!url) {
		return next(new CustomError("URL is missing!!", 400));
	}

	// generate short id
	// using `nano id` npm package to generate short unique ids.
	const shortId = nanoid(8); // this will generate a unique id of length 8.

	// create a new URL inside our database.
	const urlDoc = await UrlModel.create({
		createdBy: user._id,
		originalUrl: url,
		shortId: shortId,
		visitHistory: [],
	});

	// send a response back to the client.
	return res.status(200).json({
		status: "success",
		message: "URL shortened successfully.",
		shortenUrl: `http://localhost:${environmentVariables.PORT}/${urlDoc.shortId}`,
		originalUrl: urlDoc.originalUrl,
	});
});

// Function to handle what to do when a user visits any particular shorten URL.
module.exports.redirectUserToOriginalUrl = asyncHandler(
	async (req, res, next) => {
		const shortId = req.params.shortId;

		// find the document with the given shortId.
		const urlDoc = await UrlModel.findOneAndUpdate(
			{ shortId: shortId },
			{
				$push: {
					visitHistory: {
						timestamp: Date.now(),
					},
				},
			}
		);

		if (!urlDoc) {
			return next(new CustomError("Invalid URL!!", 400));
		}

		// if the document exists, then redirect the user to the original URL.
		return res.status(200).redirect(urlDoc.originalUrl);
	}
);
