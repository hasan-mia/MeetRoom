import axios from 'axios';
import React, { useRef } from 'react';

// setting the constraints of video box
// const videoConstraints = {
//     height: window.innerHeight / 2,
//     width: window.innerWidth / 2
// };

const LiveBroadCast = () => {
    const userStream = useRef();
    let started = false;

    window.onload = () => {
        document.getElementById('start').onclick = () => {
            init();
        }
    }
    async function init() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById("video").srcObject = stream;
        userStream.current = stream;
        started = true;
        const peer = createPeer();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
    }
    function createPeer() {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: "stun:openrelay.metered.ca:80" },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                 url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                 credential: 'webrtc',
                 username: 'webrtc'
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
            ]
        });
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
        return peer;
    }
    async function handleNegotiationNeededEvent(peer) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const payload = {
            sdp: peer.localDescription
        };

        const { data } = await axios.post('/broadcast', payload);
        const desc = new RTCSessionDescription(data.sdp);
        peer.setRemoteDescription(desc).catch(e => console.log(e));
    }

    const hangUp = () => {
        if (started) {
            userStream.current.getVideoTracks()[0].enabled = false;
        }
        window.location.replace("/conference");
    }

    let isVideo = true;
    let iconVideo = 'fal fa-video-slash font-bold';
    const toggleVideo = () => {
        document.getElementById('avv').classList = iconVideo;
        if (isVideo) {
            iconVideo = 'fal fa-video font-bold';
        } else {
            iconVideo = 'fal fa-video-slash font-bold';
        }
        isVideo = !isVideo;
        userStream.current.getVideoTracks()[0].enabled = isVideo;
    }

    let isAudio = true;
    let iconAudio = 'fas fa-microphone-slash font-bold';
    const toggleAudio = () => {
        document.getElementById('btn-a').classList = iconAudio;
        if (isAudio) {
            iconAudio = 'fal fa-microphone font-bold';
        } else {
            iconAudio = 'fas fa-microphone-slash font-bold';
        }
        isAudio = !isAudio;
        userStream.current.getAudioTracks()[0].enabled = isAudio;
    }
    return (
<div className='w-full mx-auto'>
            {/* <h2 className='text-center text-sm lg:text-2xl text-gray-200 font-semibold'>Stream Your Video</h2> */}
                <div className='rounded-xl relative'>

                {/* =======Video Player======= */}
                <div className="flex justify-center rounded-xl">
                    <video id="video" className="streamvideo" muted autoPlay />
                </div>

                {/* =======Video Controller======= */}
                <div className='grid grid-rows justify-center items-baseline absolute bottom-8 left-40'>
                    <div className='flex gap-2 md:gap-4 justify-center place-items-end text-gray-200 font-bold cursor-pointer list-none'>
                        <button onClick={toggleAudio}>
                            <li className='bg-green-400 rounded-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 font-bold'>
                                <i className="fas fa-microphone font-bold" id="btn-a"></i>
                            </li>
                        </button>
                        <button id='start' onClick={init}>
                            <li className='bg-green-400 rounded-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 font-bold'>
                            <i className="far fa-signal-stream font-bold-"></i>
                            </li>
                        </button>
                        <button onClick={toggleVideo}>
                            <li className='bg-green-400 rounded-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 font-bold'>
                                <i className="fal fa-video font-bold" id="avv"></i>
                            </li>
                        </button>
                        <button onClick={hangUp}>
                            <li className='bg-red-500 rounded-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 px-2 lg:px-4 py-1 lg:py-2 font-bold'>
                                <i className="fad fa-stop font-bold" id="btn-phone"></i>
                            </li>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveBroadCast;