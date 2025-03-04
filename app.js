const express = require("express");

// `express-mongo-sanitize` is a middleware used to remove malicious data from user supplied data, by default, $ and . characters are removed completely from the user supplied data that may present in: req.body, req.params, req.headers, and req.query.
const expressMongoSanitize = require("express-mongo-sanitize");

// `HPP` is a middleware used to protect against HTTP Parameter Pollution attacks.
const hpp = require("hpp");

// `CORS` is a middleware used to configure the CORS options for express application.
const cors = require("cors");

// `Cookie Parser` is a middleware used to parse cookies and populate `req.cookies`.
const cookieParser = require("cookie-parser");

// Global Error Handling Middleware
const globalErrorHandlingMiddleware = require("./middlewares/globalErrorHandlingMiddleware");

// URL Controllers.
const urlControllers = require("./controllers/urlControllers");

// Routes
const appRoutes = require("./routes");

// Initializing `app`.
const app = express();

// Middlewares
app.use(
	cors({
		origin: "http://127.0.0.1:5173",
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true, // Allows sending cookies from backend to frontend
	})
);
app.use(express.json()); // to parse json data, and populate json data in req.body.
app.use(express.urlencoded({ extended: true })); // to parse form data, and populate the form data in req.body.
app.use(cookieParser()); // used to parse cookies.
app.use(hpp()); // Protect against HTTP Parameter Pollution.
app.use(expressMongoSanitize()); // Prevent NoSQL Injection Attacks.

// Routes

// Home Route
app.get("/", (req, res) => {
	return res.send("Hello form server!!");
});

// Redirect Route
app.get("/:shortId", urlControllers.redirectUserToOriginalUrl);

// Other Routes
app.use("/api/v1", appRoutes);

// Global Error Handling Middleware - Place it here after placing all other middlewares and routes.
// because when you call `Global Error Handling Middleware` express will skip all other middlewares present in the middleware stack and directly executes the `Global Error Handling Middleware`. So it has to present at the end of all the middlewares.
app.use(globalErrorHandlingMiddleware);

module.exports = app;
