import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import dotenv from "dotenv";
import { deleteFolder } from "./utils/cloudinary.util.js";
import connectDB from "./db/index.js";
import { Session } from "./models/session.model.js";
import { createSession } from "./controllers/session.controller.js";

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
      socket.emit('connected');
      socket.on("message", async (payload) => {
        const { slug, message, username } = payload;
        io.to(slug).emit("reply", {
          sentBy: username,
          text: message,
          file: ''
        });
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
      });

      socket.on("file", async (payload) => {
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

        sessionUsers[payload.slug].files = true;
        io.to(payload.slug).emit("download-file", {
          sentBy: payload.username,
          file: payload.fileLink,
          text: payload.message
        });
      });

      socket.on("create-session", () => {
        createSession()
          .then((response) => {
            sessionUsers[response.sessionId] = {
              passcode: response.passcode,
              usernames: [],
              files: false
            };
            socket.emit("chatpage", {
              sessionId: response.sessionId,
              passcode: response.passcode
            });
          })
          .catch(err => {
            console.log(err);
          });
      });

      socket.on("join-user", async (payload) => {
        console.log(`${payload.username} (${socket.id}) joining ${payload.slug}`);
        const { slug, passcode, username } = payload;

        if (sessionUsers[slug]?.passcode !== passcode) {
          socket.emit('unauthorised');
        } else {
          socket.join(slug);
          socket.sessionId = slug;
          socket.username = username;

          sessionUsers[slug].usernames.push(username);
          const session = await Session.findOne({ sessionId: slug })
          socket.emit('joined', { messages: session.messages })
          io.to(slug).emit("users", sessionUsers[slug].usernames);
          io.to(slug).emit("new-entry", username);
        }
      });

      socket.on("disconnect", async () => {
        const { sessionId, username } = socket;
        io.to(sessionId).emit("left", username);
        if (sessionId && sessionUsers[sessionId]?.usernames) {
          sessionUsers[sessionId].usernames = sessionUsers[sessionId].usernames.filter(
            (u) => u !== username
          );

          if (sessionUsers[sessionId].usernames.length > 0) {
            io.to(sessionId).emit("users", sessionUsers[sessionId].usernames);
          } else {
            if (sessionUsers[sessionId].files) {
              await deleteFolder(sessionId);
            }

            Session.findOneAndDelete({ sessionId }).catch(err => {
              console.log(err)
            })
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
