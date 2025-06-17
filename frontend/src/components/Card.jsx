import { motion } from 'motion/react'

const Card = ({ users, setshowInfo }) => {
  return (
    <motion.div exit={{ opacity: 0 }} className="origin-top-right z-50">
      <div className="flex w-64 absolute top-2 right-3 rounded-xl bg-neutral-800 border border-blue-800 p-4 flex-col justify-between overflow-y-auto">

        <div className='justify-end w-full flex'>
          <button onClick={() => setshowInfo(false)} className='font-patrick relative right-5'>X</button>
        </div>
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
    </motion.div>

  )
}

export default Card
