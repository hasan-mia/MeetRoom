import React, { useCallback, useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import SingleVideo from '../../components/Video/SingleVideo';
import SignleChat from '../../components/Chat/SignleChat';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../firebase.init';
import userPic from "../../assets/user.jpg";

const SingleRoom = () => {
    const [user] = useAuthState(auth);
    const userImg = user?.photoURL ? user?.photoURL : `${window.location.hostname}/${userPic}`;
    const userName = user?.displayName;
    const { roomID } = useParams();
    // variables for different functionalities of video call
    const [height, setHeight] = useState(null)
       const userVideo = useRef();
       const partnerVideo = useRef();
       const containerVideo = useRef();
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
    
// user id of the person we are trying to call ( user b )
       // user b recieving the offer
       const createPeer = useCallback( (userID) =>{
           const peer = new RTCPeerConnection({
               // connecting the two servers
               iceServers: [
                   { urls: 'stun:stun.l.google.com:19302' },
                   { urls: 'stun:stun1.l.google.com:19302' },
                   { urls: 'stun:stun2.l.google.com:19302' },
                   { urls: 'stun:stun3.l.google.com:19302' },
                   { urls: 'stun:stun4.l.google.com:19302' },
                   { urls: "stun:openrelay.metered.ca:80" },
                   {
                       urls: 'turn:numb.viagenie.ca',socketRef,
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
   
           peer.onicecandidate = handleICECandidateEvent;
           peer.ontrack = handleTrackEvent;
           peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);
   
           return peer;
       },[])

              // calling user a ( who created the room )
       const callUser = useCallback( (userID) =>{
           // taking the peer ID
           peerRef.current = createPeer(userID);
           
           // streaming the user a stream
           // giving access to our peer of our individual stream
           // storing all the objects sent by the user into the senders array
           userStream?.current?.getTracks().forEach(track => senders?.current?.push(
                                                           peerRef?.current?.addTrack(track, userStream.current)));
   
           // creating a data channel for chatting
           sendChannel.current = peerRef?.current?.createDataChannel("sendChannel");
           sendChannel.current.onmessage = handleReceiveMessage;                                 
       },[createPeer])

       // recieving the call
       const handleRecieveCall = useCallback( (incoming)=> {
           peerRef.current = createPeer();
   
           // chatting
           peerRef.current.ondatachannel = (event) => {
               sendChannel.current = event?.channel;
               sendChannel.current.onmessage = handleReceiveMessage;
           };
           
           // remote description
           const desc = new RTCSessionDescription(incoming.sdp);
           
           // setting remote description and attaching the stream
           peerRef.current.setRemoteDescription(desc).then(() => {
               userStream.current.getTracks().forEach(track => peerRef?.current?.addTrack(track, userStream.current));
           }).then(() => {
           
               // creating the answer
               return peerRef?.current?.createAnswer();
           }).then(answer => {
           
               // setting local description
               return peerRef?.current?.setLocalDescription(answer);
           }).then(() => {
   
               // sending data back to the caller
               const payload = {
                   target: incoming.caller,
                   caller: socketRef.current.id,
                   sdp: peerRef.current.localDescription
               }
               socketRef.current.emit("answer", payload);
           })
       },[createPeer])
   

       useEffect(() => {
           // ==========Asking for audio and video access============
           if (roomID && user) {
               navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
                  setHeight( containerVideo.current.clientWidth -500)
                   // streaming the audio and video and storing the local stream
                   userVideo.current.srcObject = stream;
                   userStream.current = stream;
       
                   document.getElementById('btn-stop').classList = 'far fa-ban font-bold';
                   
                   // grabbing the room id from the url and then sending it to the socket io server
                   socketRef.current = io.connect("https://meetroom.onrender.com");
                   socketRef.current.emit("join room", {roomID, userName, userImg});
       
                   // user a is joining 
                   socketRef.current.on('old user', ({userId, userName, userImg}) => {
                       callUser(userId);
                       usersID.current = userId;
                       yourNameRef.current =userName;
                       yourImageRef.current =userImg;
                   });
       
                   // user b is joining
                   socketRef.current.on("new user", ({newUserId, userName, userImg}) => {
                       usersID.current = newUserId;
                       userNameRef.current =userName;
                       userImageRef.current =userImg;
                   });
       
                   // calling the function when made an offer
                   socketRef.current.on("offer", handleRecieveCall);
                   
                   // sending the answer back to socket
                   socketRef.current.on("answer", handleAnswer);
                   
                   // joining the user after receiving offer
                   socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
               });
            
           }
   
       }, [user, callUser, handleRecieveCall, userName, roomID, userImg]);
       

   
       // recieving the messages from the peer
       const handleReceiveMessage = (e) =>{
           setMessages(messages => [...messages, {yours: false, value: e.data }]);
       }
   
       
       // ================== CREATING THE PEER TO PEER CONNECTION ==========
   
       // making the call
       // when the actual offer is created, it is then sent to the other user
       const handleNegotiationNeededEvent = (userID) =>{
           peerRef.current.createOffer().then(offer => {
               
               // setting the local description from the users offer
               return peerRef.current.setLocalDescription(offer);
           }).then(() => {
               
               // the person we are trying to make the offer to
               const payload = {
                   target: userID,
                   caller: socketRef.current.id,
                   sdp: peerRef.current.localDescription
               };
               socketRef.current.emit("offer", payload);
           }).catch(e => console.log(e));
       }
   
       // function to handle the answer which the user a (who created the call) is receiving
       const handleAnswer =(message)=> {
           const desc = new RTCSessionDescription(message.sdp);
           peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
       }
   
       // ======== END OF THE PEER TO PEER CONNECTION ===============
   
       // handling the ice candidates
       const handleICECandidateEvent = (e) =>{
           if (e.candidate) {
               const payload = {
                   target: usersID.current,
                   candidate: e.candidate,
               }
               socketRef.current.emit("ice-candidate", payload);
           }
       }
   
       // swapping candidates until they reach on an agreement
       const handleNewICECandidateMsg = (incoming) =>{
           const candidate = new RTCIceCandidate(incoming);
           peerRef.current.addIceCandidate(candidate).catch(e => console.log(e));
       }
       
       // receiving the remote stream of peer and attaching the video of partner
       const handleTrackEvent =(e)=> {
           partnerVideo.current.srcObject = e.streams[0];
       };
   
       // Toggle Video
       let isVideo = true;
       let iconVideo = 'fal fa-video-slash font-bold';
       const toggleVideo =()=> {
           document.getElementById('btn-v').classList = iconVideo;
           if (isVideo) {
               iconVideo = 'fal fa-video font-bold';
           } else {
               iconVideo = 'fal fa-video-slash font-bold';
           }
           isVideo = !isVideo;
           userStream.current.getVideoTracks()[0].enabled = isVideo;
       }
   
       // Toggle Audio
       let isAudio = true;
       let iconAudio = 'fas fa-microphone-slash font-bold';
       const toggleAudio = ()=> {
           document.getElementById('btn-a').classList = iconAudio;
           if (isAudio) {
                iconAudio = 'fal fa-microphone font-bold';
           } else {
                iconAudio = 'fas fa-microphone-slash font-bold';
           }
           isAudio = !isAudio;
           userStream.current.getAudioTracks()[0].enabled = isAudio;
       }
   
       // Hanging up the call
       const hangUp = () =>{
           userStream.current.getVideoTracks()[0].enabled = false;
           window.location.replace("/conference");
       }
   
       // Sharing the Screen
       const shareScreen =()=> {
           // asking for the display media along with the cursor movement of the user sharing the screen
           navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
               const screenTrack = stream.getTracks()[0];
   
               // finding the track which has a type "video", and then replacing it with the current track which is playing
               document.getElementById('btn-share').classList = 'fal fa-share-square font-bold';
               senders.current.find(sender => sender.track.kind === 'video').replaceTrack(screenTrack);
               
               document.getElementById('btn-share').classList = 'fal fa-share-square font-bold';
               document.getElementById('btn-stop').classList = 'far fa-ban font-bold';
               document.getElementById('btn-stop').classList = 'far fa-ban font-bold';
   
               // when the screenshare is turned off, replace the displayed screen with the video of the user
               screenTrack.onended = function() {
                   senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
                   document.getElementById('btn-share').classList = 'fal fa-share-square font-bold';
               }
           });
       }
   
       // stopping screen share
       const stopShare =()=> {
           senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
           document.getElementById('btn-stop').classList = 'far fa-ban font-bold';
           document.getElementById('btn-share').classList = 'fal fa-share-square font-bold';
           document.getElementById('btn-share').classList = 'far fa-ban font-bold';
       }
   
       // Copy the Url
       const [copySuccess, setCopySuccess] = useState(''); 
       const getUrl =()=> {
           var inputc = document.body.appendChild(document.createElement("input"));
           inputc.value = window.location.href;
           inputc.focus();
           inputc.select();
           document.execCommand('copy');
           inputc.parentNode.removeChild(inputc);
           setCopySuccess('Copied!');
       }
   
       // handling text change when recieved
       const handleChange =(e)=> {
           setText(e.target.value);
       }
   
       // sending message to the peer
       const sendMessage =(e)=> {
           sendChannel.current.send(text);
           setMessages(messages => [...messages, { yours: true, value: text }]);
           setText("");
       }
   
       // differentiating messages from user a and user b
       const renderMessage =(message, index) => {
           if (message.yours) {
               return (
                <div className='flex justify-start items-center py-1 mb-1 flex-row-reverse text-right pr-1 gap-y-1'>
                    <div className="grid">
                        <div className="flex items-center">
                            <p className='text-sm text-white p-1 rounded font-semibold'>{yourNameRef?.current || "Unknown"}</p>
                            <img src={yourImageRef?.current} alt={yourNameRef?.current} className='w-8 h-8 p-1 border border-slate-600 ml-1 rounded-full' />
                        </div>
                        <div >
                            <p className='text-md bg-slate-200 p-1 rounded'>{message.value}</p>
                        </div>
                    </div>
                </div>
                   
               )
           }
   
           return (
            <div key={index} className='flex items-center py-1 mb-1 justify-start gap-y-1'>
                   <div className="grid">
                        <div className="flex items-center">
                            <img src={userNameRef?.current} alt={userNameRef?.current} className='w-8 h-8 p-1 border border-slate-600 ml-1 rounded-full' />
                            <p className='text-sm text-white p-1 rounded font-semibold'>{userNameRef?.current || "Unknown"}</p>
                        </div>
                        <div>
                            <p className='text-md bg-slate-200 p-1 rounded'>{message.value}</p>
                        </div>
                   </div>
            </div>
           )
       }
   
    return (
        <div className="flex justify-center gap-1 flex-col lg:flex-row">
            <div className="md:w-12/12 lg:w-7/12">
                <SingleVideo 
                    height={height}
                    containerVideo={containerVideo}
                    userVideo={userVideo}
                    partnerVideo={partnerVideo}
                    getUrl={getUrl}
                    copySuccess={copySuccess}
                    hangUp={hangUp}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    shareScreen={shareScreen}
                    stopShare={stopShare}
                />
            </div>

            {/* ========Right Sidebar ========*/}
            <div className="md:w-12/12 lg:w-4/12">
                {/* ========Single Chat Options ========*/}
                <div className='pl-0 lg:pl-2' style={{height: '90vh'}}>
                    <h2 className='text-md lg:text-xl text-center uppercase font-semibold p-2 border border-green-700 rounded-md text-gray-400'>Live Chat</h2>
                    <SignleChat
                        text={text}
                        handleChange={handleChange}
                        messages={messages}
                        renderMessage = {renderMessage}
                        sendMessage={sendMessage}
                    />
            </div>
                
        </div>
                    
        </div> 
    );
};

export default SingleRoom;