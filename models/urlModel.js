const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
	{
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		originalUrl: {
			type: String,
			required: true,
		},

		shortId: {
			type: String,
			required: true,
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
