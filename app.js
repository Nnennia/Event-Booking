const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { db } = require("./config/db");
const cors = require("cors");

const socketHandler = require("./handler/socket.handler");

const userRouter = require("./routes/user.routes");
const indexRouter = require("./routes/index.routes");
const eventRouter = require("./routes/events.routes");
const searchRouter = require("./routes/search.routes");

require("dotenv").config();
const app = express();

const server = http.createServer(app);
const io = socketHandler(server);

PORT = process.env.PORT;
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.send("WebSocket is running");
});

app.use((err, req, res, nxt) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});

app.use("/", eventRouter);
app.use("/", userRouter);
app.use("/", indexRouter);
app.use("/", searchRouter);
const startServer = () => {
	try {
		db();
		server.listen(PORT, () => {
			console.log(`Server is listening on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};
startServer();
