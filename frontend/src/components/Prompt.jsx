import  { useState,useContext } from 'react';
import { createPortal } from 'react-dom';
import { SocketContext } from '../context/SocketProvider';

const Prompt = () => {
 const {socket,username,setUsername,setClosed}=useContext(SocketContext);

  const handleClick = () => {
    if (!username.trim()) return;
    localStorage.setItem('username', username.trim());
    socket.emit("register-user",username);
    setClosed(true)
  };

  return createPortal(
    <>
      {/* Background Overlay with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleClick}
      />

      {/* Centered Popup */}
      <div className="fixed flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-6 rounded-xl shadow-lg z-50 w-80">
        <h2 className="text-white text-xl font-semibold mb-4 text-center">
          Enter display name
        </h2>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type here..."
        />
        <button
          onClick={handleClick}
          className="font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </>,
    document.body
  );
};

export default Prompt;
