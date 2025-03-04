const express = require("express");
const authControllers = require("../controllers/authControllers");
const userControllers = require("../controllers/userControllers");

const router = express.Router();

router.get("/get-me", authControllers.isUserAuthenticated, userControllers.getMe);

module.exports = router;
