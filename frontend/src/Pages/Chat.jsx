import { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../main.jsx';
import { useParams } from 'react-router-dom';
import Prompt from './Prompt.jsx';
import Loader from '../components/Loader.jsx';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';

function Chat() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const username = localStorage.getItem("username")
  const [file, setFile] = useState("")
  const { slug, passcode } = useParams();
  const socketRef = useContext(SocketContext);
  const [users, setusers] = useState([])
  const [closed, setClosed] = useState(true)
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("username")) setClosed(false);
    else {
      // socketRef.current = io('http://localhost:3000');
      socketRef.emit('join-user', { slug, passcode, username });
      socketRef.on('joined', ({ messages }) => {
        setChats(messages);
      })
      socketRef.on("unauthorised", () => {
        navigate('/error');
      })

      socketRef.on('reply', (payload) => {
        setSending(false);
        setChats(prev => [...prev, payload]);
      });
      socketRef.on("download-file", (payload) => {
        setChats(prev => [...prev, payload]);
      })
      socketRef.on('users', (users) => {
        setusers(users);
      })
      return () => {
        socketRef.disconnect();
      };
    }
  }, [slug, closed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      setSending(true)
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        fetch(`http://localhost:3000/api/v1/session/upload-file`, {
          method: "POST",
          body: formData   //to be looked into

        }).then(response => response.json())
          .then(response => {
            if (response.statusCode == 402) {
              socketRef.emit('message', { slug, username, message: response.message })
            }
            else {
              const fileLink = response.data;
              socketRef.emit("file", { slug, username, fileLink, message })
            }
            setSending(false);
          });
      }
      else {
        socketRef.emit('message', { slug, username, message });
      }
      setMessage('');
      setFile("");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center px-4">
      {!closed && <Prompt closeIt={() => setClosed(true)}></Prompt>}
      <div className="w-full max-w-6xl h-[90vh] flex border border-neutral-700 rounded-xl overflow-hidden">
        {/* Sidebar for Users */}
        <div className="w-64 bg-neutral-800 border-r border-neutral-700 p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="text-lg font-semibold mb-2">Joined</h2>
            {users.map((user, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-neutral-700 rounded-lg text-sm break-all mb-2"
              >
                {user}
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-center">
            <div className="flex flex-col items-center space-y-2">
              <label className="text-sm text-gray-400">Enter this URL or scan to join </label>
              <img
                src={`http://api.qrserver.com/v1/create-qr-code/?data=${document.URL}&size=150x150&margin=19`}
                alt="QR Code"
                className="rounded-lg"
              />
            </div>
          </div>

        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-800">
            {chats.map((chat, i) => {
              if (!chat.file) return (
                <div
                  key={i}
                  className={`max-w-xs px-4 py-2 rounded-lg break-words ${chat.sentBy === username
                    ? 'ml-auto bg-blue-600'
                    : 'mr-auto bg-neutral-700'
                    }`}
                >
                  <span className="text-xs opacity-70 block mb-1">{chat.sentBy}</span>
                  <span>{chat.text}</span>
                </div>
              )
              else return (
                <div
                  key={i}
                  className={`max-w-xs px-4 py-2 rounded-lg break-words ${chat.sentBy === username
                    ? 'ml-auto bg-blue-600'
                    : 'mr-auto bg-neutral-700'
                    }`}
                >
                  <span className="text-xs opacity-70 block mb-1">{chat.sentBy}</span>
                  <span>{chat.text}</span>
                  <a
                    href={chat.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 px-3 py-1 text-sm bg-neutral-900 rounded-md text-blue-300 hover:underline"
                  >
                    📎 Download Attachment
                  </a>

                </div>
              )
            })}
            {sending && (
              <div className="flex justify-end py-10 pr-2">
                <div className="relative w-[40px] h-[40px]">
                  <Loader />
                </div>
              </div>
            )}
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
              <label
                htmlFor="file-upload"
                className={`cursor-pointer rounded-lg px-4 py-2 transition-colors duration-200 ${file ? "bg-green-600 hover:bg-green-700" : "bg-blue-900 hover:bg-blue-800"
                  } text-white text-sm`}
              >
                {file ? "File Selected" : "Attach File"}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <Button disabled={sending} text="Send" handleClick={handleSubmit} />
          </form>

        </div>
      </div>
    </div>
  );

}

export default Chat;
