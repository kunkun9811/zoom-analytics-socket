const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001"],
  },
});
const chat = require("./analytics");
const port = 4001;

app.get("/", (req, res) => {
  res.send("<h1>Socket server :)</h1>");
});

chat(io);

server.listen(port, () => {
  console.log(`Socket server listening @ ${port}`);
});
