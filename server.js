const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");

const chat = require("./analytics");
const port = 4001;

var whitelist = ["http://localhost:4001", "http://www.zoomdemo.aankh.co/overlay", "https://www.zoomdemo.aankh.co/overlay", "http://www.zoomdemo.aankh.co", "https://www.zoomdemo.aankh.co/overlay"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.options("*", cors(corsOptions)); // include before other routes

app.get("/", (req, res) => {
  res.send("<h1>Socket server :)</h1>");
});

// app.options();

chat(io);

server.listen(port, () => {
  console.log(`Socket server listening @ ${port}`);
});
