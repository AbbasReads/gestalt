import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../main.jsx';
import Button from '../components/Button.jsx';
import ScrambledText from '../components/ScrambledText.jsx';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const socketRef = useContext(SocketContext);

  useEffect(() => {
    const handleChatPage = (payload) => {
      navigate(`/session/${payload.sessionId}/${payload.passcode}`);
    };

    socketRef.on('chatpage', handleChatPage);

    return () => {
      socketRef.off('chatpage', handleChatPage);
    };
  }, [navigate, socketRef]);

  const handleCreateSession = () => {
    const savedUsername = localStorage.getItem('username');
    const nameToStore = username.trim() || savedUsername;

    if (!nameToStore) {
      alert("Please enter a username.");
      return;
    }

    localStorage.setItem('username', nameToStore);
    socketRef.emit('create-session');
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4 space-y-8">
      
      {/* Gestalt Title */}
      <div className="text-center px-4">
        <ScrambledText
          className="text-8xl  text-white font-patrick tracking-wide"
          radius={50}
          duration={1}
          speed={0.2}
          scrambleChars="~_"
        >
          Gestalt
        </ScrambledText>
      </div>

      {/* Session Creation Box */}
      <div className="w-full max-w-80 justify-items-center bg-neutral-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-white text-4xl font-patrick mb-6 text-center">
          Create Chat Session
        </h1>

        {!localStorage.getItem("username") && (
          <input
            type="text"
            placeholder="Enter your username"
            className="w-full mb-4 px-4 py-2 rounded-lg bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <Button text="GO" handleClick={handleCreateSession} />
      </div>

    </div>
  );
};

export default LandingPage;
