// src/context/SocketContext.js
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../../info";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const navigate=useNavigate();
  const [socket] = useState(() => io(BACKEND_URL));
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || "");
  const [closed, setClosed] = useState(false)

  const showSwal = ({sender,sessionId,passcode}) => {
    withReactContent(Swal).fire({
      title: `${sender} invited you.`,
      timer: 10000,
      timerProgressBar: true,
      position: 'bottom-left',
      showCancelButton: true,
      confirmButtonText: 'Accept',
      cancelButtonText: 'Decline',
      buttonsStyling: false,
      customClass: {
        popup: 'custom-popup',
        title: 'custom-title',
        confirmButton: 'custom-accept-btn',
        cancelButton: 'custom-decline-btn',
        timerProgressBar: 'timer-progress'
      }
    })
      .then((result) => {
        if (result.isConfirmed) {
                navigate(`/session/${sessionId}/${passcode}`);
        }
      }
      )
  }

  useEffect(() => {
    enqueueSnackbar("Connecting...", { variant: 'info', persist: true })
    const handleConnect = () => {
      closeSnackbar()
      setConnected(true)
    };
    const handleDisconnect = () => setConnected(false);
    socket.on('send-invite', (payload) => {
      showSwal(payload);
    })
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, username, setUsername, closed, setClosed }}>
      {children}
    </SocketContext.Provider>
  );
};
