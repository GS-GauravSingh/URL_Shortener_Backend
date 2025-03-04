const express = require("express");
const urlControllers = require("../controllers/urlControllers");
const authControllers = require("../controllers/authControllers");

const router = express.Router();

router.post(
	"/shorten",
	authControllers.isUserAuthenticated,
	urlControllers.generateNewShortUrl
);
router.get(
	"/urls",
	authControllers.isUserAuthenticated,
	urlControllers.getAllUrls
);

router.get(
	"/recent",
	authControllers.isUserAuthenticated,
	urlControllers.getRecentUrl
);

module.exports = router;
