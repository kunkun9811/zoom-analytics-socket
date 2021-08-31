/* analytics.js */
/*
        - This is the class for socket io connection
*/

/* TODO: Might need to update the following schema
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
const USERS = {};

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

    socket.on("join_room", (roomNumber) => this.handleJoinRoom(roomNumber)); // user join room
    socket.on("send_confused_state", (newConfusionState) => this.handleReceivedConfusedState(newConfusionState)); // user send confusion state (for aggregate analytics for instructors)

    socket.on("disconnecting", () => this.handleUserLeaving()); // clean up before user leaves
    socket.on("disconnect", () => this.disconnect()); // DEBUG: for now log updated "rooms" object
    socket.on("connect_error", (err) => {
      // error handling
      console.log(`connect_error due to ${err.message}`);
    });

    // TODO: send aggregate data every 2.5 seconds - I could probably just use setInterval();
  }

  // add user to corresponding room and create user object + join SOCKET IO's own join implementation
  handleJoinRoom(roomNumber) {
    console.log(`User ${this.socket.id} JOIN room number: ${roomNumber}`);
    const newUser = {
      roomNumber: roomNumber,
      confusionState: "NEUTRAL",
    };

    // KEY: add user to users object
    USERS[this.socket.id] = newUser;

    // KEY: add user to sets of users in the corresponding room
    if (rooms.hasOwnProperty(roomNumber)) {
      rooms[roomNumber].add(this.socket.id);
    } else {
      rooms[roomNumber] = new Set();
      rooms[roomNumber].add(this.socket.id);
    }

    // KEY: instruct SOCKET IO to add user to a room according to their implementation
    this.socket.join(roomNumber);

    // DEBUG: to be deleted
    console.log("=====================rooms=====================");
    console.log(rooms);
    console.log("=====================rooms[roomNumber]=====================");
    console.log(rooms[roomNumber]);
    console.log("===================USERS===================");
    console.log(USERS);
  }

  // udpate confusion state of the corresponding user
  handleReceivedConfusedState(newConfusionState) {
    USERS[this.socket.id].confusionState = newConfusionState;
    console.log(`====================updated ${this.socket.id} data====================`);
    console.log(USERS[this.socket.id]);
  }

  // remove user from the corresponding room in "rooms" object
  handleUserLeaving() {
    console.log(`==========================User ${this.socket.id} Leaving==========================`);
    const currentUser = USERS[`${this.socket.id}`];
    rooms[currentUser.roomNumber].delete(this.socket.id);
  }

  // DEBUG: show the rooms after removing user from room in "handleUserLeaving()"
  disconnect() {
    console.log("========================DISCONNECTED========================");
    console.log(rooms);
  }
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
