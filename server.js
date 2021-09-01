const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const CORS_ORIGIN = "https://zoomdemo.aankh.co";

const io = new Server(server, {
	cors: {
		origin: "*",
	},
});
const chat = require("./analytics");
const port = 3000;

app.get("/", (req, res) => {
  res.send("<h1>Socket server :)</h1>");
});

chat(io);

server.listen(port, () => {
  console.log(`Socket server listening @ ${port}`);
});
