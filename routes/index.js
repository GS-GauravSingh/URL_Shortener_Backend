const express = require("express");
const authRoutes = require("./authRoutes");
const urlRoutes = require("./urlRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/url", urlRoutes);
router.use("/user", userRoutes);

module.exports = router;
