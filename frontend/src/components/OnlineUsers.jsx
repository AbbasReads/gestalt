import { SocketContext } from "../context/SocketProvider";
import { useContext, useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams } from "react-router";
import InviteButton from "./InviteButton";
import { enqueueSnackbar,closeSnackbar } from "notistack";

const OnlineUsers = ({ sessionId, setShowOnline }) => {
  const action = snackbarId => (
    <>
      <button
        onClick={() => closeSnackbar(snackbarId)}
        className="m-1 p-2 rounded-xl bg-black/30 backdrop-blur-sm text-white transition"
      >
        Dismiss
      </button>

    </>
  );
  const { passcode } = useParams();
  const { socket, username } = useContext(SocketContext);
  const [online, setOnline] = useState([]);

  const handleInvite = ({name,id}) => {
    socket.emit("invite", { id, sessionId, sender: username, passcode });
    enqueueSnackbar(`Invite sent to ${name}`, { action, variant: 'info' });
  }

  useEffect(() => {
    socket.emit("get-users", sessionId)
    const interval = setInterval(() => socket.emit("get-users", sessionId), 5000);
    socket.on("got-users", (users) => setOnline(users));

    return () => {
      clearInterval(interval)
      socket.off("got-users");
    };
  }, [socket, sessionId]);

  return (
    <motion.div exit={{ opacity: 0 }} className="absolute top-2 left-3 z-50">
      <div className="w-64 rounded-xl bg-neutral-800 border border-blue-800 p-4 flex flex-col justify-between max-h-96 overflow-y-auto">
        <div className="justify-end w-full flex">
          <button
            onClick={() => setShowOnline(false)}
            className="font-patrick  text-lg"
          >
            X
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Online</h2>
          {online.length === 0 ? (
            <div className="text-gray-400 italic text-sm">No outsiders online</div>
          ) : (
            online.map((item) => (
              <div key={item.id}
                className="flex px-3 py-2 m-1 rounded-lg bg-neutral-700 justify-between">
                <div
                  className="text-2xl text-gray-200 font-patrick break-words mb-2"
                >
                  {item.username}
                </div>
                <InviteButton text="Invite" onClick={() => handleInvite({id:item.id,name:item.username})} />
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OnlineUsers;
