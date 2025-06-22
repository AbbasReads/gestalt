import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketProvider.jsx'
import { useParams } from 'react-router-dom';
import Prompt from '../components/Prompt.jsx';
import Loader from '../components/Loader.jsx';
import Card from '../components/Card.jsx';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { AnimatePresence } from 'motion/react';
import { BACKEND_URL } from '../../info.js';
import { enqueueSnackbar, closeSnackbar } from 'notistack';

function Chat() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const username = localStorage.getItem("username")
  const [file, setFile] = useState("")
  const { slug, passcode } = useParams();
  const { socket, connected } = useContext(SocketContext);
  const [users, setusers] = useState([])
  const [closed, setClosed] = useState(true)
  const [sending, setSending] = useState(false);
  const [showInfo, setshowInfo] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("username")) setClosed(false);
    else {
      socket.emit('join-user', { slug, passcode, username });
      socket.on('joined', ({ messages }) => {
        setChats(messages);
      })
      socket.on('left',username=>{
                enqueueSnackbar(`${username} left...`, { variant: 'error'})
      })
      socket.on('new-entry', (username) => {
        enqueueSnackbar(`${username} joined...`, { variant: 'success'})
      })

      socket.on("unauthorised", () => {
        navigate('/error');
      })

      socket.on('reply', (payload) => {
        setSending(false);
        setChats(prev => [...prev, payload]);
      });
      socket.on("download-file", (payload) => {
        setChats(prev => [...prev, payload]);
      })
      socket.on('users', (users) => {
        setusers(users);
      })
      return () => {
        socket.disconnect();
      };
    }
  }, [slug, closed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true)
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", slug);
      fetch(`${BACKEND_URL}/api/v1/session/upload-file`, {
        method: "POST",
        body: formData   //to be looked into

      }).then(response => response.json())
        .then(response => {
          if (response.statusCode == 402) {
            enqueueSnackbar(response.message, { variant: 'warning', style: 'background color:red' })
          }
          else {
            const fileLink = response.data;
            socket.emit("file", { slug, username, fileLink, message })
          }
          setSending(false);
          setFile("");
          setMessage('');
        });
    }
    else {
      if (message.trim()) {
        socket.emit('message', { slug, username, message });
        setMessage('');
        setFile("");
      }
    }
  };

  const onshowInfo = () => {
    setshowInfo(true);
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center px-2 py-2">
      {!closed && <Prompt closeIt={() => setClosed(true)}></Prompt>}
      <AnimatePresence>
        {showInfo && <Card setshowInfo={setshowInfo} users={users} />}
      </AnimatePresence>
      <div className='flex h-6 w-full px-8 justify-end'>
        {showInfo || <button className='md:hidden' onClick={onshowInfo}><img src="/assets/info.png" className='h-full' alt="Info" /></button>}
      </div>
      <div className='flex w-full p-2 justify-center '>
        <div className="w-full max-w-7xl h-[90vh] flex border border-neutral-700 rounded-xl overflow-hidden">
          {/* Sidebar for Users */}
          <div className="hidden md:flex w-64 bg-neutral-800 border-r border-neutral-700 p-4 flex-col justify-between overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold mb-2">Joined</h2>
              {users.map((user, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-neutral-700 rounded-lg text-3xl font-patrick break-all mb-2"
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
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-neutral-800">
              {chats.map((chat, i) => {
                if (!chat.file) return (
                  <div
                    key={i}
                    className={`md:max-w-xs w-5/6 px-4 py-2 rounded-lg break-words ${chat.sentBy === username
                      ? 'ml-auto bg-blue-600'
                      : 'mr-auto bg-neutral-700'
                      }`}
                  >
                    <span className="text-sm opacity-70 block mb-1">{chat.sentBy}</span>
                    <span className='text-2xl font-patrick'>{chat.text}</span>
                  </div>
                )
                else return (
                  <div
                    key={i}
                    className={`md:max-w-xs w-5/6 px-4 py-2 rounded-lg break-words ${chat.sentBy === username
                      ? 'ml-auto bg-blue-600'
                      : 'mr-auto bg-neutral-700'
                      }`}
                  >
                    <span className="text-sm opacity-70 block mb-1">{chat.sentBy}</span>
                    <span className='text-2xl font-patrick'>{chat.text}</span>
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
              className="flex flex-col md:flex-row items-center gap-2 p-4 border-t border-neutral-700 bg-neutral-900"
            >
              <div className="flex flex-col md:flex-row items-end md:items-center w-full gap-2">
                {/* Text Input */}
                <input
                  type="text"
                  value={message}
                  placeholder="Type a message..."
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full md:flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Buttons */}
                <div className="flex justify-end gap-2 items-center md:gap-3">
                  {/* Attach File */}
                  <div className="relative">
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer rounded-lg px-4 py-3 transition-colors duration-200 
          ${file ? "bg-green-600 hover:bg-green-700" : "bg-blue-900 hover:bg-blue-800"} 
          text-white text-sm ${sending ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {file ? "File Selected" : "Attach File"}
                    </label>
                    <input
                      disabled={sending}
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    disabled={sending}
                    text="Send"
                    handleClick={handleSubmit}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Chat;
