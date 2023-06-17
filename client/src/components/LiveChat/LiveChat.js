import React, { useState } from "react";
import { io } from "socket.io-client";
import Chat from "./Chat";
import "./LiveChat.css";

const socket = io.connect("https://meetroom.onrender.com");

const LiveChat = () => {
	const [username, setUsername] = useState("");
	const [room, setRoom] = useState("");
	const [showChat, setShowChat] = useState(false);

	const joinRoom = () => {
		if (username !== "" && room !== "") {
			socket.emit("join-room", room);
			setShowChat(true);
		}
	};

	return (
		<div className="LiveChat">
			{!showChat ? (
				<div className="flex flex-col justify-center">
					<h2 className="text-center font-bold text-4xl py-6">Joining Now</h2>
					<form className="flex gap-1">
						<input
							type="text"
							placeholder="Enter Your Name"
							className="input input-bordered w-full max-w-xs"
							onChange={(event) => {
								setUsername(event.target.value);
							}}
						/>
						<input
							type="text"
							placeholder="MeetRoom Id or Link"
							className="input input-bordered w-full max-w-xs"
							onChange={(event) => {
								setRoom(event.target.value);
							}}
						/>
						<input
							onClick={joinRoom}
							type="submit"
							value="Start Now"
							className="py-2 px-4 bg-green-700 text-gray-200 rounded"
						/>
					</form>
				</div>
			) : (
				<Chat socket={socket} username={username} room={room} />
			)}
		</div>
	);
};

export default LiveChat;
