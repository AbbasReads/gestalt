
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import dotenv from "dotenv";
import { deleteFile } from "./utils/cloudinary.util.js";
const httpServer = createServer(app);

dotenv.config({
  path: './.env'
})
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

const sessionUsers = {}; // Key: sessionId, Value: array of usernames

io.on("connection", (socket) => {
  console.log("connection established");

  socket.on("message", (payload) => {
    console.log(sessionUsers);
    io.to(payload.slug).emit("reply", {
      username: payload.username,
      message: payload.message,
    });
  });

  socket.on("file", (payload) => {
    if (sessionUsers[payload.slug]?.files===undefined) sessionUsers[payload.slug].files = [];
    const publicId = payload.fileLink.split("/").at(-1);
    sessionUsers[payload.slug].files.push(publicId);
    console.log(sessionUsers);
    io.to(payload.slug).emit("download-file", {
      username: payload.username,
      downloadLink: payload.fileLink,
      message: payload.message
    })
  })

  socket.on("create-session", () => {
    fetch(`http://localhost:${process.env.PORT}/api/v1/session/create-session`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((response) => {
        socket.emit("chatpage", response.data.sessionId);
      });
  });

  socket.on("join-user", (payload) => {
    console.log(`${payload.username} (${socket.id}) joining ${payload.slug}`);
    socket.join(payload.slug);
    socket.sessionId = payload.slug;
    socket.username = payload.username;

    if (!sessionUsers[payload.slug]) {
      sessionUsers[payload.slug] = {};
      sessionUsers[payload.slug].usernames = []
    }
    sessionUsers[payload.slug].usernames.push(payload.username);
    console.log(sessionUsers);

    // Broadcast updated user list to sessionsessionUsers[payload.slug]
    io.to(payload.slug).emit("users", sessionUsers[payload.slug].usernames);
  });

  socket.on("disconnect", () => {
    const { sessionId, username } = socket;
    console.log(sessionUsers);
    if (sessionId && sessionUsers[sessionId].usernames) {
      sessionUsers[sessionId].usernames = sessionUsers[sessionId].usernames.filter(
        (u) => u !== username
      );

      // If room still exists, update user list
      if (sessionUsers[sessionId].usernames.length > 0) {
        io.to(sessionId).emit("users", sessionUsers[sessionId].usernames);
      } else {
        sessionUsers[sessionId]?.files?.forEach(async element => {
          // console.log(sessionUsers[sessionId]?.files)
          await deleteFile(element)
        }
      );
        delete sessionUsers[sessionId]; // Clean up

      }
    }

    console.log(`${socket.id} disconnected`);
  });
});


httpServer.listen(process.env.PORT, () => {
  console.log("Server is active.", process.env.PORT)
});