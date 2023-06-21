import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";
import SignleChat from "../../components/Chat/SignleChat";
import SingleVideo from "../../components/Video/SingleVideo";
import auth from "../../firebase.init";

const SingleRoom = () => {
	const [user] = useAuthState(auth);
	const userImg =
		user && user.photoURL
			? user.photoURL
			: `https://img.icons8.com/?size=512&id=108296&format=png`;
	const userName = user?.displayName;
	const { roomID } = useParams();
	// variables for different functionalities of video call
	const containerVideo = useRef()
	const userVideo = useRef();
	const partnerVideo = useRef();
	const peerRef = useRef();
	const socketRef = useRef();
	const usersID = useRef();
	const yourNameRef = useRef();
	const yourImageRef = useRef();
	const userNameRef = useRef();
	const userImageRef = useRef();
	const userStream = useRef();
	const senders = useRef([]);
	const sendChannel = useRef();
	const [text, setText] = useState("");
	const [messages, setMessages] = useState([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showChat, setShowChat] = useState(false);

	// user id of the person we are trying to call ( user b )
	// user b recieving the offer
	const createPeer = useCallback((userID) => {
		const peer = new RTCPeerConnection({
			// connecting the two servers
			iceServers: [
				{ urls: "stun:stun.relay.metered.ca:80"},
				{ urls: "stun:stun.l.google.com:19302" },
				{ urls: "stun:stun1.l.google.com:19302" },
				{ urls: "stun:stun2.l.google.com:19302" },
				{ urls: "stun:stun3.l.google.com:19302" },
				{ urls: "stun:stun4.l.google.com:19302" },
				{ urls: "stun:openrelay.metered.ca:80" },
				{
					urls: "turn:a.relay.metered.ca:80",
					username: "bab9ca25580d0235617aea7e",
					credential: "NVk1oJx3ogplGTuj",
				},
				{
					urls: "turn:a.relay.metered.ca:80?transport=tcp",
					username: "bab9ca25580d0235617aea7e",
					credential: "NVk1oJx3ogplGTuj",
				},
				{
					urls: "turn:a.relay.metered.ca:443",
					username: "bab9ca25580d0235617aea7e",
					credential: "NVk1oJx3ogplGTuj",
				},
				{
					urls: "turn:a.relay.metered.ca:443?transport=tcp",
					username: "bab9ca25580d0235617aea7e",
					credential: "NVk1oJx3ogplGTuj",
				},
				{
					urls: "turn:openrelay.metered.ca:80",
					username: "openrelayproject",
					credential: "openrelayproject",
				},
				{
					urls: "turn:openrelay.metered.ca:443",
					username: "openrelayproject",
					credential: "openrelayproject",
				},
				{
					urls: "turn:openrelay.metered.ca:443?transport=tcp",
					username: "openrelayproject",
					credential: "openrelayproject",
				},
			],
		});

		peer.onicecandidate = handleICECandidateEvent;
		peer.ontrack = handleTrackEvent;
		peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

		return peer;
	}, []);

	// calling user a ( who created the room )
	const callUser = useCallback(
		(userID) => {
			// taking the peer ID
			peerRef.current = createPeer(userID);

			// streaming the user a stream
			// giving access to our peer of our individual stream
			// storing all the objects sent by the user into the senders array
			userStream.current
				.getTracks()
				.forEach((track) =>
					senders.current.push(
						peerRef.current.addTrack(track, userStream.current),
					),
				);

			// creating a data channel for chatting
			sendChannel.current = peerRef.current.createDataChannel("sendChannel");
			sendChannel.current.onmessage = handleReceiveMessage;
		},
		[createPeer],
	);

	// ================== CREATING THE PEER TO PEER CONNECTION ==========

	// making the call
	// when the actual offer is created, it is then sent to the other user
	const handleNegotiationNeededEvent = (userID) => {
		peerRef.current
			.createOffer()
			.then((offer) => {
				// setting the local description from the users offer
				return peerRef.current.setLocalDescription(offer);
			})
			.then(() => {
				// the person we are trying to make the offer to
				const payload = {
					target: userID,
					caller: socketRef.current.id,
					sdp: peerRef.current.localDescription,
				};
				socketRef.current.emit("offer", payload);
			})
			.catch((e) => console.log(e));
	};

	// recieving the call
	const handleRecieveCall = useCallback(
		(incoming) => {
			peerRef.current = createPeer();

			// chatting
			peerRef.current.ondatachannel = (event) => {
				sendChannel.current = event.channel;
				sendChannel.current.onmessage = handleReceiveMessage;
			};

			// remote description
			const desc = new RTCSessionDescription(incoming.sdp);

			// setting remote description and attaching the stream
			peerRef.current
				.setRemoteDescription(desc)
				.then(() => {
					userStream.current
						.getTracks()
						.forEach((track) =>
							peerRef.current.addTrack(track, userStream.current),
						);
				})
				.then(() => {
					// creating the answer
					return peerRef.current.createAnswer();
				})
				.then((answer) => {
					// setting local description
					return peerRef.current.setLocalDescription(answer);
				})
				.then(() => {
					// sending data back to the caller
					const payload = {
						target: incoming.caller,
						caller: socketRef.current.id,
						sdp: peerRef.current.localDescription,
					};
					socketRef.current.emit("answer", payload);
				});
		},
		[createPeer],
	);

	// function to handle the answer which the user a (who created the call) is receiving
	const handleAnswer = (message) => {
		const desc = new RTCSessionDescription(message.sdp);
		peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
	};

	// ======== END OF THE PEER TO PEER CONNECTION ===============

	// handling the ice candidates
	const handleICECandidateEvent = (e) => {
		if (e.candidate) {
			const payload = {
				target: usersID.current,
				candidate: e.candidate,
			};
			socketRef.current.emit("ice-candidate", payload);
		}
	};

	// swapping candidates until they reach on an agreement
	const handleNewICECandidateMsg = (incoming) => {
		const candidate = new RTCIceCandidate(incoming);
		peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
	};

	// receiving the remote stream of peer and attaching the video of partner
	const handleTrackEvent = (e) => {
		partnerVideo.current.srcObject = e.streams[0];
	};

	useEffect(() => {
		// grabbing the room id from the url and then sending it to the socket io server
		socketRef.current = io.connect("https://meetroom.onrender.com");
		// ==========Asking for audio and video access============
		navigator.mediaDevices
			.getUserMedia({ audio: true, video: true })
			.then((stream) => {
				// streaming the audio and video and storing the local stream
				userVideo.current.srcObject = stream;
				userStream.current = stream;

				document.getElementById("btn-chat").classList =
					"fab fa-rocketchat font-bold";

				socketRef.current.emit("join room", {
					roomID,
					userName,
					userImg,
				});
				// user a is joining
				socketRef.current.on("old user", ({ userId, userName, userImg }) => {
					callUser(userId);
					usersID.current = userId;
					yourNameRef.current = userName;
					yourImageRef.current = userImg;
				});

				// user b is joining
				socketRef.current.on("new user", ({ newUserId, userName, userImg }) => {
					usersID.current = newUserId;
					userNameRef.current = userName;
					userImageRef.current = userImg;
				});

				// calling the function when made an offer
				socketRef.current.on("offer", handleRecieveCall);

				// sending the answer back to socket
				socketRef.current.on("answer", handleAnswer);

				// joining the user after receiving offer
				socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
			});
		// setHeight(containerVideo.current.clientWidth - 500);
	}, [user, callUser, handleRecieveCall, userName, roomID, userImg]);

	// Toggle Video
	let isVideo = true;
	let iconVideo = "fal fa-video-slash font-bold";
	const toggleVideo = () => {
		document.getElementById("btn-v").classList = iconVideo;
		if (isVideo) {
			iconVideo = "fal fa-video font-bold";
		} else {
			iconVideo = "fal fa-video-slash font-bold";
		}
		isVideo = !isVideo;
		userStream.current.getVideoTracks()[0].enabled = isVideo;
	};

	// Toggle Audio
	let isAudio = true;
	let iconAudio = "fas fa-microphone-slash font-bold";
	const toggleAudio = () => {
		document.getElementById("btn-a").classList = iconAudio;
		if (isAudio) {
			iconAudio = "fal fa-microphone font-bold";
		} else {
			iconAudio = "fas fa-microphone-slash font-bold";
		}
		isAudio = !isAudio;
		userStream.current.getAudioTracks()[0].enabled = isAudio;
	};

	// Hanging up the call
	const hangUp = () => {
		userStream.current.getVideoTracks()[0].enabled = false;
		window.location.replace("/conference");
	};

	// Sharing the Screen
	const shareScreen = async () => {
		try {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				cursor: true,
			});
			const screenTrack = stream.getTracks()[0];
			// Replace video track with screen track
			const sender = senders.current.find(
				(sender) => sender.track.kind === "video",
			);
			if (sender) {
				await sender.replaceTrack(screenTrack);
			}
			document.getElementById("btn-share").classList = "far fa-ban font-bold";
			// When screenshare is turned off, replace displayed screen with user's video track
			screenTrack.onended = async () => {
				const userVideoTrack = userStream.current.getVideoTracks()[0];
				if (sender) {
					await sender.replaceTrack(userVideoTrack);
				}
				document.getElementById("btn-share").classList =
					"fal fa-share-square font-bold";
			};
		} catch (error) {
			if (error.name === "PermissionDeniedError") {
				toast.error("User denied screen sharing permission");
			} else {
				toast.error(error);
			}
		}
	};

	// const stopShare = async () => {
	//      try {
	//         senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
	//      	document.getElementById('btn-stop').classList = 'far fa-ban font-bold';
	//        	document.getElementById('btn-share').classList = 'fal fa-share-square font-bold';
	//        	document.getElementById('btn-share').classList = 'far fa-ban font-bold';
	//     } catch (error) {
	//         console.log('Error stopping screen sharing:', error);
	//     }
	// };

	// responsive chat option
	const resPonsiveChat = async () => {
		setShowChat(!showChat);
		try {
			await senders?.current
				?.find((sender) => sender.track.kind === "video")
				.replaceTrack(userStream?.current?.getTracks()[1]);
			document.getElementById("btn-chat").classList =
				"fab fa-rocketchat font-bold";
			document.getElementById("btn-share").classList =
				"fal fa-share-square font-bold";
			document.getElementById("btn-share").classList =
				"fal fa-share-square font-bold";
		} catch (error) {
			console.log("Error stopping screen sharing:", error);
		}
	};

	// Copy the Url
	const [copySuccess, setCopySuccess] = useState("");
	const getUrl = () => {
		var inputc = document.body.appendChild(document.createElement("input"));
		inputc.value = window.location.href;
		inputc.focus();
		inputc.select();
		document.execCommand("copy");
		inputc.parentNode.removeChild(inputc);
		setCopySuccess("Copied!");
	};

	// Chat controling peer to peer
	// handling text change when recieved
	const toggleEmojiPicker = () => {
		setShowEmojiPicker(!showEmojiPicker);
	};
	const handleChange = (e) => {
		setText(e.target.value);
	};
	const handleEmojiSelect = (emoji) => {
		setText(text + emoji.native);
		setShowEmojiPicker(false);
	};

	// sending message to the peer
	const sendMessage = (e) => {
		e.preventDefault();
		if (!text) {
			return;
		}
		const messageData = {
			name: userName,
			image: userImg,
			message: text,
		};
		if (sendChannel?.current && sendChannel?.current?.send) {
			sendChannel.current.send(JSON.stringify(messageData));
		} else {
			toast.info("Please wait for your partner");
			return;
		}
		// sendChannel.current.send(JSON.stringify(messageData));
		setMessages((messages) => [
			...messages,
			{
				yours: true,
				data: {
					name: messageData.name,
					image: messageData.image,
					message: messageData.message,
				},
			},
		]);
		setText("");
	};

	// Handle received message
	const handleReceiveMessage = (event) => {
		const data = JSON.parse(event.data);

		const receivedMessage = {
			yours: false,
			data: {
				name: data.name,
				image: data.image,
				message: data.message,
			},
		};

		setMessages((messages) => [...messages, receivedMessage]);
	};

	// differentiating messages from user a and user b
	const renderMessage = (message, index) => {
		if (message.yours) {
			return (
				<div
					className="flex justify-start items-center py-1 mb-1 flex-row-reverse text-right pr-1 gap-y-1"
					key={index}
				>
					<div className="grid">
						<div className="flex justify-end items-center mb-1">
							<p className="text-sm text-white p-1 rounded font-semibold">
								{message?.data?.name || "You"}
							</p>
							<img
								src={message?.data?.image}
								alt={message?.data?.name}
								className="w-8 h-8 p-1 border border-slate-600 ml-1 rounded-full"
							/>
						</div>
						<div>
							<p className="text-md bg-slate-200 p-1 rounded">
								{message?.data?.message}
							</p>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div
				key={index}
				className="flex items-center py-1 mb-1 justify-start gap-y-1"
			>
				<div className="grid">
					<div className="flex items-center mb-1">
						<img
							src={message?.data?.image}
							alt={message?.data?.name}
							className="w-8 h-8 p-1 border border-slate-600 ml-1 rounded-full"
						/>
						<p className="text-sm text-white p-1 rounded font-semibold">
							{message?.data?.name || "Ghost"}
						</p>
					</div>
					<div>
						<p className="text-md bg-slate-200 p-1 rounded">
							{message?.data?.message}
						</p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="flex justify-center gap-1 flex-col lg:flex-row mt-2">
			<div
				className={
					showChat
						? `md:w-12/12  lg:w-7/12 relative`
						: `md:w-12/12 lg:w-7/12 relative`
				}
			>
				<SingleVideo
					messages={messages}
					containerVideo={containerVideo}
					socketRef={socketRef}
					userVideo={userVideo}
					partnerVideo={partnerVideo}
					getUrl={getUrl}
					copySuccess={copySuccess}
					hangUp={hangUp}
					toggleAudio={toggleAudio}
					toggleVideo={toggleVideo}
					shareScreen={shareScreen}
					// stopShare={stopShare}
					resPonsiveChat={resPonsiveChat}
				/>
			</div>
			{/* ========Right Sidebar ========*/}
			{showChat && (
				<div className="md:w-12/12 lg:w-4/12">
					{/* ========Single Chat Options ========*/}

					<div className="pl-0 lg:pl-2">
						<h2 className="text-md lg:text-xl text-center uppercase font-semibold p-2 border border-green-700 rounded-md text-gray-400">
							Live Chat
						</h2>
						<SignleChat
							text={text}
							handleChange={handleChange}
							messages={messages}
							renderMessage={renderMessage}
							sendMessage={sendMessage}
							showEmojiPicker={showEmojiPicker}
							toggleEmojiPicker={toggleEmojiPicker}
							handleEmojiSelect={handleEmojiSelect}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default SingleRoom;
