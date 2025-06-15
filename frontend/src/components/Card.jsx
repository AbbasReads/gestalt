import React from 'react'

const Card = ({users}) => {
  return (
      <div className="flex w-64 bg-neutral-800 border-r border-neutral-700 p-4 flex-col justify-between overflow-y-auto">
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

  )
}

export default Card
