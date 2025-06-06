import React, { useState, useEffect,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../main.jsx';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const socketRef = useContext(SocketContext);
  useEffect(() => {
    socketRef.on('chatpage', (payload) => {
      navigate(`/session/${payload.sessionId}/${payload.passcode}`);
    });
  }, []);

  const handleCreateSession = () => {
    // if (!username.trim()) {
    //   alert('Please enter a username.');
    //   return;
    // }
    // localStorage.setItem("username",username);
    socketRef.emit('create-session');
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-neutral-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-white text-2xl font-semibold mb-6 text-center">Create Chat Session</h1>
        {localStorage.getItem("username")!=='' || <input
          type="text"
          placeholder="Enter your username"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />}
        <button
          onClick={handleCreateSession}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Session
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
