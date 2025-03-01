function globalErrorHandlingMiddleware(error, req, res, next) {
	error.statusCode = error.statusCode || 500;
	error.status =
		error.status ||
		"Global Error Handling Middleware: Internal Server Error";
	return res.status(error.statusCode).json({
		status: error.status,
		message: error.message,
	});
}

module.exports = globalErrorHandlingMiddleware;