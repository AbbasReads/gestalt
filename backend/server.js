
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import {apiError} from './utils/apiError.util.js'
import dotenv from "dotenv";
const httpServer = createServer(app);
dotenv.config({
  path:'./.env'
})
const io = new Server(httpServer, {
    cors: {
      origin:'*'
    }
  });

  const sessionUsers = {}; // Key: sessionId, Value: array of usernames

  io.on("connection", (socket) => {
    console.log("connection established");
  
    socket.on("message", (payload) => {
      io.to(payload.slug).emit("reply", {
        username: payload.username,
        message: payload.message,
      });
    });
  
    socket.on("create-session", () => {
      fetch("http://localhost:3000/api/v1/session/create-session", {
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
  
      if (!sessionUsers[payload.slug]) sessionUsers[payload.slug] = [];
      sessionUsers[payload.slug].push(payload.username);
  
      // Broadcast updated user list to session
      io.to(payload.slug).emit("users", sessionUsers[payload.slug]);
    });
  
    socket.on("disconnect", () => {
      const { sessionId, username } = socket;
  
      if (sessionId && sessionUsers[sessionId]) {
        sessionUsers[sessionId] = sessionUsers[sessionId].filter(
          (u) => u !== username
        );
  
        // If room still exists, update user list
        if (sessionUsers[sessionId].length > 0) {
          io.to(sessionId).emit("users", sessionUsers[sessionId]);
        } else {
          delete sessionUsers[sessionId]; // Clean up
        }
      }
  
      console.log(`${socket.id} disconnected`);
    });
  });
  

httpServer.listen(3000,()=>{
    console.log("Server is active.")
});