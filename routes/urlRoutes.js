const express = require("express");
const urlControllers = require("../controllers/urlControllers");
const authControllers = require("../controllers/authControllers");

const router = express.Router();

router.post(
	"/shorten-url",
	authControllers.isUserAuthenticated,
	urlControllers.generateNewShortUrl
);

module.exports = router;
