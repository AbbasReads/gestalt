import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const Prompt = ({ closeIt }) => {
  const [username, setUsername] = useState("")

  const handleClick = () => {
    localStorage.setItem("username", username)
    closeIt()
  }

  return createPortal(
    <>
      {/* Background Overlay with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={closeIt}
      />

      {/* Centered Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl z-50 w-80">
        <h2 className="text-lg font-semibold mb-4">Enter Username</h2>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Type here..."
        />
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </>,
    document.body
  )
}

export default Prompt
