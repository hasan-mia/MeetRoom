import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import Schedule from "../../components/Schedule/Schedule";
import ParticipantSlide from "../../components/Slider/ParticipantSlide";
import GroupVideo from "../../components/Video/GroupVideo";
import auth from "../../firebase.init";
// import GroupChat from '../../components/Chat/GroupChat';

// Streaming Video of the user
const Video = (props) => {
	const ref = useRef();
	useEffect(() => {
		props.peer.on("stream", (stream) => {
			ref.current.srcObject = stream;
		});
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

	useEffect(() => {
		// grabbing the room id from the url and then sending it to the socket io server
		// socketRef.current = io.connect("https://meetroom.onrender.com");
		socketRef.current = io.connect("http://localhost:8000");

		// ==========Asking for audio and video access============
		navigator.mediaDevices
			.getUserMedia({ audio: true, video: videoConstraints })
			.then((stream) => {
				// streaming the audio and video
				userVideo.current.srcObject = stream;
				userStream.current = stream;

				socketRef.current.emit("join room group", {
					roomID,
					userName,
					userImg,
					isHost: true,
				});

				// getting all user for the new user joining in
				socketRef.current.on("all users", (usersInThisRoom) => {
					// console.log(usersInThisRoom);
					const peers = [];
					usersInThisRoom.forEach((user) => {
						const peer = createPeer({
							userToSignal: user.id,
							callerID: socketRef.current.id,
							stream,
						});

						peersRef.current.push({
							peerID: user.id,
							peer,
						});

						peers.push({
							peerID: user.id,
							peer,
						});
					});
					setPeers(peers);
				});

				// sending signal to existing users after new user joined
				socketRef.current.on("user joined", (payload) => {
					const peer = addPeer(payload.signal, payload.callerID, stream);
					peersRef.current.push({
						peerID: payload.callerID,
						peer,
					});

					const peerObj = {
						peer,
						peerID: payload.callerID,
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
				socketRef.current.on("user left group", (socketId) => {
					// finding the id of the peer who just left
					const peerObj = peersRef.current.find((p) => p.peerID === socketId);
					if (peerObj) {
						peerObj.peer.destroy();
					}

					// removing the peer from the arrays and storing remaining peers in new array
					const peers = peersRef.current.filter((p) => p.peerID !== socketId);
					peersRef.current = peers;
					setPeers(peers);
				});
			});
	}, [roomID, userImg, userName]);

	// creating a peer object for newly joined user
	function createPeer({ userToSignal, callerID, stream }) {
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
			});
		});

		return peer;
	}

	// adding the newly joined peer to the room
	function addPeer(incomingSignal, callerID, stream) {
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
			socketRef.current.emit("returning signal", { signal, callerID });
		});

		peer.signal(incomingSignal);
		return peer;
	}

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
		<div className="flex justify-center gap-1 flex-col lg:flex-row">
			<div className="md:w-12/12 lg:w-8/12">
				<GroupVideo
					userVideo={userVideo}
					//  peers={peers}
					//  Video={Video}
					getUrl={getUrl}
					copySuccess={copySuccess}
					hangUp={hangUp}
					toggleAudio={toggleAudio}
					toggleVideo={toggleVideo}
					shareScreen={shareScreen}
					stopShare={stopShare}
				/>

				{/* ======Participent Video===== */}
				{/* <div className="flex items-center justify-center px-4">
                    <div class="videos">
                        {peers.map((peer) => {
                            return (
                                <Video class="groupVideo" key={peer.peerID} peer={peer.peer} />
                            );
                        })}
                    </div>
                </div> */}
				<div className="py-2">
					<ParticipantSlide peers={peers} Video={Video} />
				</div>
			</div>

			{/* ========Right Sidebar ========*/}
			<div className="md:w-12/12 lg:w-4/12">
				{/* ========Group Chat Options ========*/}
				<div className="pl-0 lg:pl-2">
					{/* <h2 className='text-md lg:text-xl text-center uppercase font-semibold p-2 border border-green-700 rounded-md text-gray-400'>Live Chat</h2> */}
					{/*====== Next Schedule===== */}
					<div className="mt-2">
						<h2 className="text-gray-300 font-semibold py-1 pl-3">
							Next Schedule is:
						</h2>
						<div className="rounded-lg first-letter:mb-2 overflow-y-auto max-h-screen px-3 py-2">
							<Schedule></Schedule>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GroupRoom;
