const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;


app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", async (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on('join room', ({ userName, roomId }) => {
    socket.join(roomId);
    console.log(`${userName} joined room: ${roomId}`);

    socket.on('typing', (data) => {
      io.to(roomId).emit('typing', data);
    });

    socket.on('chat message', (data) => {
      io.to(roomId).emit('chat message', data);
    });
  });


})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
