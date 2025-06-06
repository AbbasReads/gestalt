import React, { createContext } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Chat from "./Pages/Chat";
import "./index.css";
import { io } from "socket.io-client";
import Unauthorised from "./Pages/Unauthorised";

// Create socket context
export const SocketContext = createContext();

// Create socket instance
const socket = io(`http://localhost:3000/`)

// Get root element
const root = document.getElementById("root");

// Render app with context provider
ReactDOM.createRoot(root).render(
  <SocketContext.Provider value={socket}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/session/:slug/:passcode" element={<Chat />} />
        <Route path="/error" element={<Unauthorised/>}></Route>
        <Route path="/session/:slug" element={<Unauthorised/>}></Route>
      </Routes>
    </BrowserRouter>
  </SocketContext.Provider>
);
