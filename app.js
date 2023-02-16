const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const rooms = {};
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("index", { rooms });
});
app.post("/room", (req, res) => {
  if (rooms[req.body.roomName] != null) {
    return res.redirect("/");
  }
  rooms[req.body.roomName] = { users: {} };
  res.redirect(req.body.roomName);
  // Send message that new room was created
  io.emit("room-created", req.body.roomName);
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.render("room", { roomName: req.params.room });
});

server.listen(port);

io.on("connection", (socket) => {
  socket.on("new-user-joined", (roomName, name) => {
    socket.join(roomName);
    rooms[roomName].users[socket.id] = name;
    socket.broadcast.to(roomName).emit("new-user-name", name);
  });

  socket.on("send-chat-message", (message, roomName) => {
    socket.broadcast.to(roomName).emit("receive-chat-message", {
      name: rooms[roomName].users[socket.id],
      message,
    });
  });
  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket.broadcast
        .to(room)
        .emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}
