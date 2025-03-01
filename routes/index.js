const express = require("express");
const authRoutes = require("./authRoutes");
const urlRoutes = require("./urlRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/url", urlRoutes);

module.exports = router;
