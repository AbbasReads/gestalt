import React from 'react'

const Unauthorised = () => {
  return (
    <>
      <div className="min-h-screen bg-neutral-900 flex  items-center justify-center px-4 space-y-8">

        <img
          src="/assets/errorImage.png"
          width="500"
          alt="Error Illustration"
          className="object-contain"
        />
        <img
          src="/assets/speech.gif"
          autoPlay
          loop
          muted
          className="absolute top-1/4 md:top-1/6 md:left-2/5 w-2xs md:w-[40%] object-contain"
        />
      </div>

    </>
  )
}

export default Unauthorised
