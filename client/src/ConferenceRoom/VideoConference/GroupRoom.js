import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Peer from "simple-peer";
import io from "socket.io-client";
import ParticipantSlide from "../../components/Slider/ParticipantSlide";
import GroupVideo from "../../components/Video/GroupVideo";
import auth from "../../firebase.init";
import useRoom from "../../hooks/useRoom";
// import GroupChat from '../../components/Chat/GroupChat';

// Streaming Video of the user
const Video = (props) => {
	const ref = useRef();
	useEffect(() => {
		if (ref?.current) {
			props.peer.on("stream", (stream) => {
				ref.current.srcObject = stream;
			});
		}
	}, [props.peer]);

	return <video className="groupVideo" playsInline autoPlay ref={ref} />;
};

// setting the constraints of video box
const videoConstraints = {
	video: true,
	height: window.innerHeight / 2,
	width: window.innerWidth / 2,
};

const GroupRoom = () => {
	const [user] = useAuthState(auth);
	const { isHost } = useRoom();
	const userImg =
		user && user.photoURL
			? user.photoURL
			: `https://img.icons8.com/?size=512&id=108296&format=png`;
	const userName = user?.displayName;
	const { roomGroupID } = useParams();
	// variables for different functionalities of video call
	const [peers, setPeers] = useState([]);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const senders = useRef([]);
	const userStream = useRef();
	const roomID = roomGroupID;

	// get all user if not hosted
	const peerUsers = peers.filter((user) => user.isHost === false);
	const uniqPeerUsers = Array.from(new Set(peerUsers));
	// find hosted user
	const hostUser = peers.find((user) => user.isHost === true);
	// creating a peer object for newly joined user
	const createPeer = useCallback(
		(userToSignal, callerID, stream) => {
			const peer = new Peer({
				initiator: true,
				trickle: false,
				config: {
					iceServers: [
						{ urls: "stun:stun.relay.metered.ca:80" },
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
				},
				stream,
			});

			peer.on("signal", (signal) => {
				socketRef.current.emit("sending signal", {
					userToSignal,
					callerID,
					signal,
					isHost,
				});
			});

			return peer;
		},
		[isHost],
	);

	// adding the newly joined peer to the room
	const addPeer = useCallback((incomingSignal, callerID, stream, isHost) => {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			config: {
				iceServers: [
					{ urls: "stun:stun.relay.metered.ca:80" },
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
			},
			stream,
		});

		peer.on("signal", (signal) => {
			socketRef.current.emit("returning signal", {
				signal,
				callerID,
				isHost,
			});
		});

		peer.signal(incomingSignal);
		return peer;
	}, []);

	// ==========Asking for audio and video access============
	const startCamera = useCallback(async () => {
		try {
			await navigator.mediaDevices
				.getUserMedia({ audio: true, video: videoConstraints })
				.then((stream) => {
					// streaming the audio and video
					userVideo.current.srcObject = stream;
					userStream.current = stream;

					socketRef.current.emit("join room group", {
						roomID,
						userName,
						userImg,
						isHost: isHost,
					});

					// getting all user for the new user joining in
					socketRef.current.on("all users", (users) => {
						const peers = [];

						// adding the new user to the group
						users.forEach((user) => {
							const peer = createPeer(
								user.socketId,
								socketRef.current.id,
								stream,
							);
							peersRef.current.push({
								peerID: user.socketId,
								peer,
								isHost,
							});
							peers.push({
								peerID: user.socketId,
								peer,
								isHost,
							});
						});
						setPeers(peers);
					});

					// sending signal to existing users after new user joined
					socketRef.current.on("user joined", (payload) => {
						const peer = addPeer(
							payload.signal,
							payload.callerID,
							stream,
							payload.isHost,
						);
						peersRef.current.push({
							peerID: payload.callerID,
							peer,
							isHost: payload.isHost,
						});

						const peerObj = {
							peer,
							peerID: payload.callerID,
							isHost: payload.isHost,
						};
						setPeers((users) => [...users, peerObj]);
					});

					// exisisting users recieving the signal
					socketRef.current.on("receiving returned signal", (payload) => {
						const item = peersRef.current.find(
							(p) => p.peerID === payload.socketId,
						);
						item.peer.signal(payload.signal);
					});

					// handling user disconnecting
					socketRef.current.on("user left group", (id) => {
						// finding the id of the peer who just left
						const peerObj = peersRef.current.find((p) => p.peerID === id);
						if (peerObj) {
							peerObj.peer.destroy();
						}

						// removing the peer from the arrays and storing remaining peers in new array
						const peers = peersRef.current.filter((p) => p.peerID !== id);
						peersRef.current = peers;
						setPeers(peers);
					});
				});
		} catch (error) {
			toast.error("MediaDevices is not supported.");
			console.log(error);
		}
	}, [roomID, userImg, userName, isHost, addPeer, createPeer]);

	// grabbing the room id from the url and then sending it to the socket io server
	useEffect(() => {
		if (user) {
			socketRef.current = io.connect("https://meetroom.onrender.com");
			// socketRef.current = io.connect("http://localhost:8000");
			startCamera();
		}
	}, [user, startCamera]);

	// Toggle Video
	let isVideo = true;
	let iconVideo = "fal fa-video-slash font-bold";
	function toggleVideo() {
		document.getElementById("btn-v").classList = iconVideo;
		if (isVideo) {
			iconVideo = "fal fa-video font-bold";
		} else {
			iconVideo = "fal fa-video-slash font-bold";
		}
		isVideo = !isVideo;
		userStream.current.getVideoTracks()[0].enabled = isVideo;
	}

	// Toggle Audio
	let isAudio = true;
	let iconAudio = "fas fa-microphone-slash font-bold";
	function toggleAudio() {
		document.getElementById("btn-a").classList = iconAudio;
		if (isAudio) {
			iconAudio = "fal fa-microphone font-bold";
		} else {
			iconAudio = "fas fa-microphone-slash font-bold";
		}
		isAudio = !isAudio;
		userStream.current.getAudioTracks()[0].enabled = isAudio;
	}

	// Hanging up the call
	function hangUp() {
		userStream.current.getVideoTracks()[0].enabled = false;
		window.location.replace("/conference");
	}
	// Sharing the Screen
	const shareScreen = () => {
		// asking for the display media along with the cursor movement of the user sharing the screen
		navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
			const screenTrack = stream.getTracks()[0];

			// finding the track which has a type "video", and then replacing it with the current track which is playing
			document.getElementById("btn-share").classList =
				"fal fa-share-square font-bold";
			senders.current
				.find((sender) => sender.track.kind === "video")
				.replaceTrack(screenTrack);

			document.getElementById("btn-share").classList =
				"fal fa-share-square font-bold";
			document.getElementById("btn-stop").classList =
				"fal fa-share-square font-bold";
			document.getElementById("btn-stop").classList = "far fa-ban font-bold";

			// when the screenshare is turned off, replace the displayed screen with the video of the user
			screenTrack.onended = function () {
				senders.current
					.find((sender) => sender.track.kind === "video")
					.replaceTrack(userStream.current.getTracks()[1]);
				document.getElementById("btn-share").classList =
					"fal fa-share-square font-bold";
			};
		});
	};

	// stopping screen share
	const stopShare = () => {
		senders.current
			.find((sender) => sender.track.kind === "video")
			.replaceTrack(userStream.current.getTracks()[1]);
		document.getElementById("btn-stop").style.display = "none";
		document.getElementById("btn-share").style.display = "inline";
		document.getElementById("btn-share").style.backgroundColor =
			"far fa-ban font-bold";
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

	return (
		<div className="flex justify-center gap-1 flex-col lg:flex-row mt-2">
			<div className="md:w-12/12 lg:w-8/12">
				<GroupVideo
					userVideo={userVideo}
					hostUser={hostUser}
					socketRef={socketRef}
					peers={peers}
					Video={Video}
					getUrl={getUrl}
					copySuccess={copySuccess}
					hangUp={hangUp}
					toggleAudio={toggleAudio}
					toggleVideo={toggleVideo}
					shareScreen={shareScreen}
					stopShare={stopShare}
				/>

				<div className="py-2">
					<ParticipantSlide peers={uniqPeerUsers} Video={Video} />
				</div>
			</div>

			{/* ========Right Sidebar ========*/}
			<div className="md:w-12/12 lg:w-4/12">
				{/* ========Group Chat Options ========*/}
				<div className="pl-0 lg:pl-2">
					<h2 className="text-md lg:text-xl text-center uppercase font-semibold p-2 border border-green-700 rounded-md text-gray-400">
						Live Chat
					</h2>
				</div>
			</div>
		</div>
	);
};

export default GroupRoom;
