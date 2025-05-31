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

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  //  socket.on('chat message', (msg) => {
  //   // console.log('message: ' + msg);
  //   io.emit('chat message', msg);
  // });

  // socket.broadcast.emit('chat message', 'A new user has joined the chat!');

  socket.on('chat message', (msg) => {
    // console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
