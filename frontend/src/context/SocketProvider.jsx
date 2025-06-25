// src/context/SocketContext.js
import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../../info";
import { enqueueSnackbar,closeSnackbar } from "notistack";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket] = useState(() => io(BACKEND_URL));
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username')||"");
  const [closed, setClosed] = useState(false)


  useEffect(() => {
    enqueueSnackbar("Connecting...", { variant: 'info', persist: true })
    const handleConnect = () => {
      closeSnackbar()
      setConnected(true)
    };
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected,username,setUsername,closed,setClosed }}>
      {children}
    </SocketContext.Provider>
  );
};
