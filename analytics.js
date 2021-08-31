/* TODO BOARD */
/*
  - fix the schema
  - remove room functionality (when all instructor leaves room or see if we can actually check if the meeting has ended)

*/

SEND_ANALYTICS_INTERVAL = 10000;

/* analytics.js */
/*
        - This is the class for socket io connection
*/

/* 
-- These are all the "LIVE" rooms currently being used, each room is going to have the following structure
NOTE: students are SETS of student id's (or more precisely their connected socket id)

// TODO: actually... might not need confusionPercentage
room = {
  room_1_Id: {
    confusionPercentage: [percentage from 0 ~ 100]
    students: Set(
      student_1_id,
      student_2_id,
      ...
    )
  },
  room_2_Id: {
    confusionPercentage: [percentage from 0 ~ 100]
    students: Set(
      student_3_id,
      student_4_id,
      ...
    )
  },
  
}
        - roomId => zoom room id used to join in the frontend

-- USERS is going to have the following structure
NOTE: USERS is a MAP

USERS = Map{
  "user_1_id": {
    roomNumber: 12345,
    confusionState: "CONFUSED", // NOTE: this will be "CONFUSED", "NEUTRAL", "ERROR", or "N/A"
  }
}

user = {
  id: 1234567890,
  confusionState: "confused",
  [... in the future we could have more analytics here]
}
*/
const rooms = {};
const USERS = {};

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

    // send aggregate data every SEND_ANALYTICS_INTERVAL seconds for each room
    setInterval(() => {
      console.log("SENDING AGGREGATE DATA");
      for (let room in rooms) {
        console.log(room);
        const confusionPercentage = this.calculateCurrentRoomConfusedPercentage(room);
        // socket.to(room).emit("send_aggregate_analytics", confusionPercentage);
        io.in(room).emit("send_aggregate_analytics", confusionPercentage);
      }
    }, SEND_ANALYTICS_INTERVAL);
  }

  // add user to corresponding room and create user object + join SOCKET IO's own join implementation
  handleJoinRoom(roomNumber) {
    console.log(`User ${this.socket.id} JOIN room number: ${roomNumber}`);
    // create new user
    const newUser = {
      roomNumber: roomNumber,
      confusionState: "Neutral",
    };

    // KEY: add user to users object
    USERS[this.socket.id] = newUser;

    // KEY: add user to sets of users in the corresponding room
    if (rooms.hasOwnProperty(roomNumber)) {
      rooms[roomNumber].students.add(this.socket.id);
    } else {
      // create new room
      const newSet = new Set();
      rooms[roomNumber] = {
        confusionPercentage: 0,
        students: newSet,
      };
      rooms[roomNumber].students.add(this.socket.id);
    }

    // KEY: instruct SOCKET IO to add user to a room according to their implementation
    this.socket.join(roomNumber);

    // DEBUG: to be deleted
    // console.log("============room============");
    // console.log(roomNumber);
    // console.log("=====================rooms=====================");
    // console.log(rooms);
    // console.log("=====================rooms[roomNumber]=====================");
    // console.log(rooms[roomNumber]);
    // console.log("===================USERS===================");
    // console.log(USERS);
  }

  // udpate confusion state of the corresponding user
  handleReceivedConfusedState(newConfusionState) {
    if (USERS[this.socket.id]) {
      USERS[this.socket.id].confusionState = newConfusionState;
      // console.log(`====================updated ${this.socket.id} data====================`);
      // console.log(USERS[this.socket.id]);
    }
  }

  // calculate current "room's" overall confusion percentage
  calculateCurrentRoomConfusedPercentage(room) {
    const studentSet = rooms[room].students;
    const totalStudents = studentSet.size;
    let numberOfConfused = 0;

    console.log("=================ROOMS=================");
    console.log(rooms);
    console.log("=================USERS=================");
    console.log(USERS);
    console.log("================student set================");
    console.log(studentSet);

    // for (let studentId in studentSet) {
    //   console.log(`__________________student ${studentId} confused state__________________`);
    //   console.log(USERS[studentId].confusionState);
    //   if (USERS[studentId].confusionState === "Confused") numberOfConfused++;
    // }

    studentSet.forEach((studentId) => {
      console.log(`__________________student ${studentId} confused state__________________`);
      console.log(USERS[studentId].confusionState);
      if (USERS[studentId].confusionState === "Confused") numberOfConfused++;
    });

    return numberOfConfused / totalStudents;
  }

  // remove user from the corresponding room in "rooms" object
  handleUserLeaving() {
    console.log(`==========================User ${this.socket.id} Leaving==========================`);
    const currentUser = USERS[`${this.socket.id}`];
    rooms[currentUser.roomNumber].students.delete(this.socket.id);
  }

  // DEBUG: show the rooms after removing user from room in "handleUserLeaving()"
  disconnect() {
    // console.log("========================DISCONNECTED========================");
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
