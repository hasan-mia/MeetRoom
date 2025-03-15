"use client"

import { useEffect, useRef, useState } from "react"
import { BsRecordCircle } from "react-icons/bs"
import { FaMicrophone, FaMicrophoneSlash, FaPhoneAlt, FaRocketchat, FaShareSquare, FaVideo, FaVideoSlash } from "react-icons/fa"

const SingleVideo = ({
  messages,
  containerVideo,
  socketRef,
  userVideo,
  partnerVideo,
  getUrl,
  copySuccess,
  toggleAudio,
  toggleVideo,
  hangUp,
  shareScreen,
  resPonsiveChat,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const mediaRecorderRef = useRef(null)

  // Format elapsed time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle start recording
  const handleStartRecording = () => {
    if (!userVideo.current) return

    try {
      const stream = userVideo.current.captureStream()
      const chunks = []

      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: "video/webm" })
        // Send the recordedBlob to the server
        socketRef?.current?.emit("recorded-video", recordedBlob)
        chunks.length = 0
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  // Handle stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setElapsedTime(0)
    }
  }

  // Handle audio toggle with state update
  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    toggleAudio()
  }

  // Handle video toggle with state update
  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    toggleVideo()
  }

  // Recording timer
  useEffect(() => {
    let timerId
    if (isRecording) {
      timerId = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1)
      }, 1000)
    } else {
      setElapsedTime(0)
    }
    return () => {
      clearInterval(timerId)
    }
  }, [isRecording])

  return (
    <div className="w-full mx-auto">
      {/* Header with recording controls and share link */}
      <div className="bg-gray-900 text-gray-200 flex justify-between items-center p-2 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-700"}`}>
            <BsRecordCircle size={14} />
          </div>
          <span className="text-sm lg:text-md font-medium">
            {isRecording ? `REC ${formatTime(elapsedTime)}` : "Ready to record"}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            className={`flex items-center gap-2 uppercase text-sm px-3 py-1 rounded-md transition-all duration-200 ${
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            <BsRecordCircle size={16} />
            <span className="hidden sm:inline">{isRecording ? "Stop" : "Start"} Rec</span>
          </button>

          <div className="relative group">
            <button
              type="button"
              className="text-gray-300 uppercase px-3 py-1 rounded-md hover:bg-gray-800 transition-colors duration-200"
              onClick={getUrl}
            >
              <span className="text-sm">Share</span>
            </button>
            <div className="absolute hidden group-hover:block top-full right-0 mt-1 bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap">
              {copySuccess ? copySuccess : "Copy meeting link"}
            </div>
          </div>
        </div>
      </div>

      {/* Video container */}
      <div
        className="bg-black rounded-b-lg border border-gray-800 relative"
        ref={containerVideo}
        style={{ minHeight: "400px" }}
      >
        {/* Main video (partner) */}
        <video id="peer" className="w-full min-h-[350px]" autoPlay playsInline ref={partnerVideo} />

        {/* Self video (picture-in-picture) */}
        <div className="absolute top-4 right-4 max-w-[180px] rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
          <video id="user" className="w-full h-auto" muted autoPlay playsInline ref={userVideo} />
        </div>

        {/* Video controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-3 md:space-x-4">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`rounded-full p-3 md:p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-110 ${
              isAudioEnabled ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isAudioEnabled ? (
              <FaMicrophone className="text-white text-lg" id="btn-a" />
            ) : (
              <FaMicrophoneSlash className="text-white text-lg" id="btn-a" />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleVideo}
            className={`rounded-full p-3 md:p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-110 ${
              isVideoEnabled ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isVideoEnabled ? (
              <FaVideo className="text-white text-lg" id="btn-v" />
            ) : (
              <FaVideoSlash className="text-white text-lg" id="btn-v" />
            )}
          </button>

          <button
            type="button"
            onClick={hangUp}
            className="bg-red-500 rounded-full p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-110"
          >
            <FaPhoneAlt className="text-white text-lg md:text-xl transform rotate-135" id="btn-phone" />
          </button>

          <button
            type="button"
            onClick={shareScreen}
            className="bg-green-500 rounded-full p-3 md:p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-110"
          >
            <FaShareSquare className="text-white text-lg" id="btn-share" />
          </button>

          <button
            type="button"
            onClick={resPonsiveChat}
            className="bg-green-500 rounded-full px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:scale-110 relative"
          >
            <FaRocketchat className="text-white text-lg" id="btn-chat" />
            {messages?.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {messages.length}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SingleVideo

