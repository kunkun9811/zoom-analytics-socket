/* analytics.js */
/*
        - This is the class for socket io connection
*/

/*
-- These are all the "LIVE" rooms currently being used, each room is going to have the following structure
room = {
  room_1_Id: {
    user_1_Id: user_1_Obj,
    user_2_Id: user_2_Obj,
    user_3_Id: user_3_Obj,
  },
  room_2_Id: {
    user_4_Id: user_4_Obj,
    user_5_Id: user_5_Obj,
    user_6_Id: user_6_Obj,
  },
}
        - roomId => zoom room id used to join in the frontend
        - user1, user2, ... => these are objects of the "user" structure mention below

-- Each user is going to have the following structure
user = {
  id: 1234567890,
  name: "Timo",
  confusionState: "confused",
  [... in the future we could have more analytics here]
}
*/
const rooms = {};

const defaultUser = {
  id: "anon",
  name: "Anonymous",
  confusionState: "none",
};

// connection class
class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("sendMessage", (message) => this.sendMessage(message));

    //     socket.on("disconnect", (roomId) => this.disconnect(roomId));
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  sendMessage(message) {
    console.log(message);
    console.log(`User ${this.socket.id} joined room number ${message.roomNumber}`);
    //     socket.emit("client-receive-message", message);
  }

  // TODO: might need to see if this work
  //   disconnect(roomId) {
  //     console.log("=====================this.socket=====================");
  //     console.log(this.socket);
  //     delete rooms[roomId][this.socket];
  //   }
}

function chat(io) {
  io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected!`); // DEBUG:
    new Connection(io, socket);
  });
}

module.exports = chat;

// TODO: to be deleted. I am only putting it here to see

// class Connection {
//   constructor(io, socket) {
//     this.socket = socket;
//     this.io = io;

//     socket.on("getMessages", () => this.getMessages());
//     socket.on("message", (value) => this.handleMessage(value));
//     socket.on("disconnect", () => this.disconnect());
//     socket.on("connect_error", (err) => {
//       console.log(`connect_error due to ${err.message}`);
//     });
//   }

//   sendMessage(message) {
//     this.io.sockets.emit("message", message);
//   }

//   getMessages() {
//     messages.forEach((message) => this.sendMessage(message));
//   }

//   handleMessage(value) {
//     const message = {
//       id: uuidv4(),
//       user: users.get(this.socket) || defaultUser,
//       value,
//       time: Date.now(),
//     };

//     messages.add(message);
//     this.sendMessage(message);

//     setTimeout(() => {
//       messages.delete(message);
//       this.io.sockets.emit("deleteMessage", message.id);
//     }, messageExpirationTimeMS);
//   }

//   disconnect() {
//     users.delete(this.socket);
//   }
// }

// function chat(io) {
//   io.on("connection", (socket) => {
//     new Connection(io, socket);
//   });
// }
