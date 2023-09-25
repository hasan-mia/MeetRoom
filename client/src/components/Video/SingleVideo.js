import React, { useEffect, useRef, useState } from "react";
import { BsRecordCircle } from "react-icons/bs";

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
	const [isRecording, setIsRecording] = useState(false);
	const [elapsedTime, setElapsedTime] = useState(0);
	const mediaRecorderRef = useRef(null);
	// hanle start recording
	const handleStartRecording = () => {
		const stream = userVideo.current.captureStream();
		const chunks = [];

		mediaRecorderRef.current = new MediaRecorder(stream);
		mediaRecorderRef.current.ondataavailable = (event) => {
			chunks.push(event.data);
		};

		mediaRecorderRef.current.onstop = () => {
			const recordedBlob = new Blob(chunks, { type: "video/webm" });
			// Send the recordedBlob to the server
			socketRef?.current?.emit("recorded-video", recordedBlob);
			chunks.length = 0;
		};

		mediaRecorderRef.current.start();
		setIsRecording(true);
	};
	// hanle stop recording
	const handleStopRecording = () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== "inactive"
		) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};
	useEffect(() => {
		let timerId;
		if (isRecording) {
			timerId = setInterval(() => {
				setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
			}, 1000);
		}
		return () => {
			clearInterval(timerId);
		};
	}, [isRecording]);
	return (
		<div className="w-full mx-auto">
			<div className="text-gray-200 flex justify-between">
				<div className="flex list-none items-center">
					<li className="bg-red-500 rounded-full">
						<BsRecordCircle />
					</li>
					<li className="text-sm lg:text-md px-1 lg:px-2">
						REQ : {elapsedTime} s
					</li>
				</div>
				<div className="flex items-center">
					{isRecording ? (
						<button
							type="button"
							className="flex items-center gap-2 uppercase text-sm"
							onClick={handleStopRecording}
						>
							<BsRecordCircle size={20} className="text-red-500" />
							Stop req
						</button>
					) : (
						<button
							type="button"
							className="flex items-center gap-2 uppercase text-sm"
							onClick={handleStartRecording}
						>
							<BsRecordCircle size={20} className="text-green-500" />
							Star req
						</button>
					)}
				</div>
				<div
					className="tooltip mr-1 py-1 px-2 rounded text-white hover:bg-slate-700"
					data-tip={copySuccess ? copySuccess : "COPY ID"}
				>
					<button
						type="button"
						className="text-gray-300 uppercase"
						onClick={() => {
							getUrl();
						}}
					>
						<small>Share Link</small>
					</button>
				</div>
			</div>

			<div
				className="rounded-xl border border-green-500 relative gap-2 mt-2 h-fit"
				ref={containerVideo}
			>
				{/* =======Video Player======= */}
				<div className="grid grid-cols-1 justify-center items-center rounded-xl relative">
					<video
						id="user"
						height="50px"
						width="100px"
						className="oneVideo absolute left-0 top-0"
						muted
						autoPlay
						playsInline
						ref={userVideo}
					/>
					<video
						id="peer"
						className="oneVideo relative"
						autoPlay
						playsInline
						ref={partnerVideo}
						style={{
							height: `${
								containerVideo?.current?.clientWidth -
								(containerVideo?.current?.clientWidth * 25) / 100
							}px`,
							width: "auto",
						}}
					/>
				</div>

				{/* =======Video Controller======= */}
				<div className="flex flex-row justify-center items-baseline relative">
					<div className="flex gap-2 md:gap-4 justify-center place-items-end text-gray-200 font-bold cursor-pointer list-none bottom-8 absolute">
						<button type="button" onClick={toggleAudio}>
							<li className="bg-green-400 rounded-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 font-bold">
								<i className="fas fa-microphone font-bold" id="btn-a"></i>
							</li>
						</button>
						<button type="button" onClick={toggleVideo}>
							<li className="bg-green-400 rounded-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 font-bold">
								<i className="fal fa-video font-bold" id="btn-v"></i>
							</li>
						</button>
						<button type="button" onClick={hangUp}>
							<li className="bg-red-500 rounded-md text-lg lg:text-2xl transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-2 lg:py-2">
								<i className="far fa-phone-alt font-bold" id="btn-phone"></i>
							</li>
						</button>
						<button type="button" onClick={shareScreen}>
							<li className="bg-green-400 rounded-md transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 ">
								<i className="fal fa-share-square font-bold" id="btn-share"></i>
							</li>
						</button>
						<button type="button" className="relative" onClick={resPonsiveChat}>
							<li className="bg-green-400 rounded-md transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 ">
								<i className="fab fa-rocketchat font-bold" id="btn-chat"></i>
							</li>
							<div className="badge badge-warning absolute -top-2 -right-5">
								{messages?.length > 0 ? messages?.length : 0}
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SingleVideo;
