const express = require("express");
const app = express();
const chats = require("./data/data.js")
const dotenv = require("dotenv");
const cors = require('cors');
const connectDB = require("./config/db.js");
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");

dotenv.config();
connectDB();


app.use(express.json());
app.use('/api/user', userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`server started on ${PORT}`));
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(`User ${userData._id} connected to socket`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("typing", (room) => 
    socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => 
    socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat || !chat.users) {
    return console.log("chat or chat.users not defined");
}

    chat.users.forEach(user => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup",() =>{
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
