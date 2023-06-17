import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ScrollToBottom from "react-scroll-to-bottom";
import userPic from "../../assets/images/user.png";
import auth from "../../firebase.init";

const Chat = ({ socket, username, room }) => {
	const [user] = useAuthState(auth);
	const userImg = user?.photoURL ? user?.photoURL : userPic;
	const [currentMessage, setCurrentMessage] = useState("");
	const [messageList, setMessageList] = useState([]);

	const sendMessage = async () => {
		if (currentMessage !== "") {
			const messageData = {
				room: room,
				author: username,
				message: currentMessage,
				time:
					new Date(Date.now()).getHours() +
					":" +
					new Date(Date.now()).getMinutes(),
			};

			await socket.emit("send_message", messageData);
			setMessageList((list) => [...list, messageData]);
			setCurrentMessage("");
		}
	};

	useEffect(() => {
		socket.on("receive_message", (data) => {
			setMessageList((list) => [...list, data]);
		});
	}, [socket]);

	return (
		<div className="w-6/12 my-4 border border-green-500">
			<h2 className="text-md lg:text-xl text-center uppercase font-semibold p-2 border text-green-900">
				Live Chat
			</h2>
			<div className="rounded-lg mb-2 tab-bar overflow-y-auto h-96 ">
				<ScrollToBottom className="message-container">
					{messageList.map((messageContent) => {
						return (
							<>
								<div
									className="flex items-center py-1 justify-start message"
									id={username === messageContent.author ? "you" : "other"}
								>
									<img
										src={userImg}
										alt="Main user"
										className="w-12 h-12 p-1 border border-slate-600 mr-1"
									/>
									<div>
										<h2 className="text-md font-medium message-meta">
											{messageContent.author}
										</h2>
										<p className="text-sm bg-slate-100 p-1 rounded message-content">
											{messageContent.message}
										</p>
										<p>
											<span className="message-meta">
												{messageContent.time}
											</span>
										</p>
									</div>
								</div>
							</>
						);
					})}
				</ScrollToBottom>
			</div>

			<div className="flex items-baseline gap-2 bg-green-600 rounded p-2 mt-4">
				<button>
					<i className="far fa-image text-3xl text-gray-200"></i>
				</button>
				<input
					className="p-2 rounded-md border border-slate-600-none w-full px-2"
					type="text"
					value={currentMessage}
					placeholder="Message ..."
					onChange={(event) => {
						setCurrentMessage(event.target.value);
					}}
					onKeyPress={(event) => {
						event.key === "Enter" && sendMessage();
					}}
				/>
				<button type="button" onClick={sendMessage}>
					{" "}
					<i className="far fa-paper-plane text-2xl text-gray-200 font-medium"></i>{" "}
				</button>
			</div>
		</div>
	);
};

export default Chat;
