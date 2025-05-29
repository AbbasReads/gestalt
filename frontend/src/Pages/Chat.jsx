import { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../main.jsx';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { nanoid } from 'nanoid';

function Chat() {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const username = localStorage.getItem("username")
  const [file, setFile] = useState({})
  const { slug } = useParams();
  const socketRef = useContext(SocketContext);
  const [users, setusers] = useState([])
  const uploadRef=useRef();
  useEffect(() => {
    // socketRef.current = io('http://localhost:3000');
    socketRef.emit('join-user', { slug, username });
    socketRef.on('reply', (payload) => {
      setChats((prev) => [...prev, payload]);
    });
    socketRef.on('users', (users) => {
      setusers(users);
    })
    return () => {
      socketRef.disconnect();
    };
  }, [slug]);

  const handleSubmit =async (e) => {
    e.preventDefault();
    if (message.trim()) {
      if(file){
        const fileLink=await fetch("http://localhost:3000",{
          method:"POST",
          file:file     //to be looked into
        })
        socketRef.emit("file",{slug,downlaodLink,message})
      }
      socketRef.emit('message', { slug, username, message });
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-6xl h-[90vh] flex border border-neutral-700 rounded-xl overflow-hidden">
        {/* Sidebar for Users */}
        <div className="w-64 bg-neutral-800 border-r border-neutral-700 p-4 space-y-2 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          {users.map((user, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-neutral-700 rounded-lg text-sm break-all"
            >
              {user}
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-800">
            {chats.map((chat, i) => (
              <div
                key={i}
                className={`max-w-xs px-4 py-2 rounded-lg break-words ${chat.username === username
                    ? 'ml-auto bg-blue-600'
                    : 'mr-auto bg-neutral-700'
                  }`}
              >
                <span className="text-xs opacity-70 block mb-1">{chat.username}</span>
                <span>{chat.message}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-4 border-t border-neutral-700 bg-neutral-900"
          >
            <input
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Styled File Input */}
            <div className="relative">
              <label ref={uploadRef} className="cursor-pointer px-4 py-2 hover:bg-blue-700 rounded-lg transition bg-blue-600">
                Upload
                <input
                  type="file"
                  onChange={(e) => {
                    console.log(e.target.files[0])
                    if (e.target.files[0]){
                      setFile(e.target.files[0])
                      // console.log(uploadRef.current.classList["6"]="bg-green-400")
                      // uploadRef.current.classList.append("")
                    }
                      // console.log(file);
                      // TODO: emit via socket or handle upload
                    }
                  }
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );

}

export default Chat;
