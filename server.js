const app = require("./app");
const http = require("http");
const environmentVariables = require("./environmentVariables");
const connectMongoDB = require("./database");

// Creating Server using the HTTP module, express is built on top of HTTP module.
const server = http.createServer(app);

// PORT on which our server will run.
const PORT = environmentVariables.PORT;

// Database Connection.
connectMongoDB(environmentVariables.MONGO_DB_URL);

// Start the server and listen for incoming requests.
server.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}`);
});
