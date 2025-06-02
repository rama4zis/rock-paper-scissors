const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

const rooms = 
{
  // 
}

// declare winner
function declareWinner(player1, player2) {
  const choice1 = player1.choice;
  const choice2 = player2.choice;


  console.log(`player1: ${choice1}, player2: ${choice2}`)
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

    if(!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // console.log(`User ${userName} joined room ${roomId}`);
    const totalUsers = (await io.in(roomId).fetchSockets()).length;
    // console.log(`total user in room ${roomId}: ${totalUsers}`);

    // Limit max 2 users
    if (totalUsers > 2) {
      socket.emit('room full');
      socket.leave(roomId);
      console.log(`The room is full. User ${userName} left.`);
      return;
    }

    // Save user
    rooms[roomId][socket.id] = {
      userName,
      choice: null,
    }

    console.log(`User ${userName} joined room ${roomId}`)
  });

  socket.on('play', ({ playerChoice }) => {
    console.log(`${socket.userName} choice ${playerChoice}, room: ${socket.currentRoomId}`);
    const roomId = socket.currentRoomId;
    // if (!roomId || !roomId[roomId]) return 

    rooms[roomId][socket.id].choice = playerChoice;
    const players = Object.entries(rooms[roomId]);
    // console.log(`Rooms : ${JSON.stringify(rooms)}`)
    // console.log(`players : ${JSON.stringify(players)}`)
    // console.log(`players : ${JSON.stringify(players[0])}`)
    // console.log(`players : ${JSON.stringify(players[0][0])}`)
    // console.log(`players : ${JSON.stringify(players[0][1])}`)
    // console.log(`player total = ${Object.keys(rooms[roomId]).length}`)
    // console.log(`${players[0][1]} `)
    // All player already choice
    if (
      players.length === 2 &&
      players[0][1].choice &&
      players[1][1].choice
    ) {
      const result = declareWinner(players[0][1], players[1][1]);

      if (result === 'draw') {
        io.to(roomId).emit('draw');
      } else {
        io.to(roomId).emit('win', result);
      }

      console.log(`result: ${result.winner.userName} win!`);
      
    }


  })

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
