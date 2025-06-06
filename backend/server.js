import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import dotenv from "dotenv";
import { deleteFile } from "./utils/cloudinary.util.js";
import { nanoid } from "nanoid";
import connectDB from "./db/index.js";
import { Session } from "./models/session.model.js";

dotenv.config({ path: './.env' });

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

const sessionUsers = {}; // Key: sessionId, Value: usernames, passcode, files

connectDB()
  .then(() => {
    io.on("connection", (socket) => {
      console.log("connection established");

      socket.on("message", async (payload) => {
        const { slug, message, username } = payload;

        await Session.findOneAndUpdate(
          { sessionId: slug },
          {
            $push: {
              messages: {
                text: message,
                sentBy: username,
                file: ''
              }
            }
          }
        );

        io.to(slug).emit("reply", {
          username,
          message,
          downloadLink: ''
        });
      });

      socket.on("file",async (payload) => {
        await Session.findOneAndUpdate(
          { sessionId: payload.slug },
          {
            $push: {
              messages: {
                text: payload.message,
                sentBy: payload.username,
                file: payload.fileLink
              }
            }
          }
        );

        const publicId = payload.fileLink.split("/").at(-1);
        sessionUsers[payload.slug].files.push(publicId);
        console.log(sessionUsers);

        io.to(payload.slug).emit("download-file", {
          username: payload.username,
          downloadLink: payload.fileLink,
          message: payload.message
        });
      });

      socket.on("create-session", () => {
        fetch(`http://localhost:${process.env.PORT}/api/v1/session/create-session`, {
          method: "POST",
        })
          .then((response) => response.json())
          .then((response) => {
            sessionUsers[response.data.sessionId] = {
              passcode: response.data.passcode,
              usernames: [],
              files: []
            };

            console.log(sessionUsers);
            socket.emit("chatpage", {
              sessionId: response.data.sessionId,
              passcode: response.data.passcode
            });
          })
          .catch(err => {
            console.log(err);
          });
      });

      socket.on("join-user", (payload) => {
        console.log(`${payload.username} (${socket.id}) joining ${payload.slug}`);
        const { slug, passcode, username } = payload;

        if (sessionUsers[slug]?.passcode !== passcode) {
          socket.emit('unauthorised');
        } else {
          socket.join(slug);
          socket.sessionId = slug;
          socket.username = username;

          sessionUsers[slug].usernames.push(username);
          console.log(sessionUsers);

          io.to(slug).emit("users", sessionUsers[slug].usernames);
        }
      });

      socket.on("disconnect", () => {
        const { sessionId, username } = socket;
        console.log(sessionUsers);

        if (sessionId && sessionUsers[sessionId]?.usernames) {
          sessionUsers[sessionId].usernames = sessionUsers[sessionId].usernames.filter(
            (u) => u !== username
          );

          if (sessionUsers[sessionId].usernames.length > 0) {
            io.to(sessionId).emit("users", sessionUsers[sessionId].usernames);
          } else {
            sessionUsers[sessionId]?.files?.forEach(async (element) => {
              await deleteFile(element);
            });
            delete sessionUsers[sessionId];
          }
        }

        console.log(`${socket.id} disconnected`);
      });
    });

    httpServer.listen(process.env.PORT, () => {
      console.log("Server is active.", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
