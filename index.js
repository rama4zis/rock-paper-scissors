const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

const rooms = {};

// declare winner
function declareWinner(player1, player2) {
  const choice1 = player1.choice;
  const choice2 = player2.choice;

  if (choice1 === choice2) {
    return "draw";
  }

  if (
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "paper" && choice2 === "rock") ||
    (choice1 === "scissors" && choice2 === "paper")
  ) {
    return { winner: player1, loser: player2 };
  } else {
    return { winner: player2, loser: player1 };
  }
}

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  // console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  console.log(`A user connected: ${socket.id}`);

  socket.on('join room', async ({ userName, roomId }) => {

    socket.join(roomId);

    socket.currentRoomId = roomId;
    socket.userName = userName;

    console.log(`User ${userName} joined room ${roomId}`);
    const totalUsers = (await io.in(roomId).fetchSockets()).length;
    console.log(`total user in room ${roomId}: ${totalUsers}`);
    socket.emit('error', () => {
      // throw new Error('Room is full');
      alert('Room is full');
    });

    // Limit max 2 users
    if (totalUsers > 2) {
      socket.leave(roomId);
      console.log(`Total users in room ${roomId}: ${totalUsers}`);
      return;
    }
  });

  socket.on('typing', (data) => {
    const roomId = socket.currentRoomId;
    if (roomId) {
      io.to(roomId).emit('typing', data);
    }
  });

  socket.on('chat message', (data) => {
    const roomId = socket.currentRoomId;
    if (roomId) {
      io.to(roomId).emit('chat message', data);
    }
  });

});

server.listen(port, () => {
  console.log(`Example app listening on port ${port} `);
});
