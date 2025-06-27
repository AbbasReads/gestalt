
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Chat from "./Pages/Chat";
import "/src/index.css";
import Unauthorised from "./Pages/Unauthorised";
import { SnackbarProvider } from "notistack";
import { SocketProvider } from "./context/SocketProvider";




// Get root element
const root = document.getElementById("root");

// Render app with context provider
ReactDOM.createRoot(root).render(
  <SocketProvider>
    <BrowserRouter>
      <SnackbarProvider autoHideDuration={4000}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/session/:slug/:passcode" element={<Chat />} />
          <Route path="/error" element={<Unauthorised />}></Route>
          <Route path="/session/:slug" element={<Unauthorised />}></Route>
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  </SocketProvider>
);
