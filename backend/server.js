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
    origin: [
      /^http:\/\/localhost:\d+$/,
      "https://gestalt-ashy.vercel.app"
    ]
  }
});


const sessionUsers = {}; // Key: sessionId, Value: usernames, passcode, files
let onlineUsers = [];

connectDB()
  .then(() => {
    io.on("connection", (socket) => {
      console.log("connection established");
      socket.emit('connected');
      socket.on("register-user", username => {
        socket.username = username
        onlineUsers.push({ username, id: socket.id })
      });

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

      socket.on('get-users', sessionId => {
        const uninvitees = sessionUsers[sessionId]?.usernames;
        const others = onlineUsers.filter(e => (!(uninvitees?.includes(e.username))));
        // console.log(others)
        // console.log(uninvitees)
        socket.emit('got-users', others);
      })

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

          sessionUsers[slug].usernames.push(username);
          const session = await Session.findOne({ sessionId: slug })
          socket.emit('joined', { messages: session.messages })
          io.to(slug).emit("users", sessionUsers[slug].usernames);
          io.to(slug).emit("new-entry", username);
        }
      });

      socket.on("leave", async () => {
        const { sessionId, username } = socket;
        if (sessionId && sessionUsers[sessionId]?.usernames) {
          console.log(`${username} left`)
          io.to(sessionId).emit("left", username);
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
      }
      )

      socket.on('invite', ({ id, sessionId, sender,passcode }) => {
        socket.to(id).emit("send-invite", { sessionId, sender,passcode });
      })

      socket.on("disconnect", async () => {
        const { sessionId, username } = socket;
        if (sessionId && sessionUsers[sessionId]?.usernames) {
          if (sessionUsers[sessionId].usernames.includes(username)) {
            console.log(`${username} left`)
            io.to(sessionId).emit("left", username);
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
        }
        onlineUsers = onlineUsers.filter(e => e.id !== socket.id)
        console.log(`${socket.id} disconnected`);
      }
      );
    });

    httpServer.listen(process.env.PORT, () => {
      console.log("Server is active.", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });