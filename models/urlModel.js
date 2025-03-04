const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
	{
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required."],
		},

		originalUrl: {
			type: String,
			required: [true, "Original URL is required."],
		},

		shortenUrl: {
			type: String,
			required: [true, "Shorten URL is required."],
		},

		shortId: {
			type: String,
			required: [true, "Short Id is required."],
			unique: true,
		},

		visitHistory: [
			{
				timestamp: { type: Date },
			},
		],
	},
	{ timestamps: true }
);

const UrlModel = mongoose.model("Url", urlSchema);
module.exports = UrlModel;
