/* ------ IMPORTING FILES ------- */
require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const path = require("path");

const bodyParser = require('body-parser');

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); 
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, application/x-www-form-urlencoded"');
//   next();
// });
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* =========== CREATING AND JOINING ROOMS FOR CONNECTION BETWEEN USERS =========*/
// room object to store the created room IDs
const rooms = {};
const users = {};
const socketToRoom = {};

io.on("connection", socket => {

    const socketId = socket.id;
    // ===========Handling one on one video call=============

    socket.on("join room", ({roomID, userName, userImg}) => {

        // else create a new room
        if(rooms[roomID] === undefined){
            rooms[roomID] = [{ id: socketId, userName, userImg }];
        }
       if(rooms[roomID] !== undefined) {
            const existingUser = rooms[roomID]?.find(user => user.id === socketId) 
            if (!existingUser) {
                rooms[roomID].push({ id: socketId, userName, userImg });
            }
        }
        
        // finding the user - see if id is of the user in room exist
        const user = rooms[roomID].find(user => user.id !== socketId);
        if (user) {
            socket.emit("old user", {userId: user.id, userName, userImg});
            // if someone new user has joined then we get the id of the other user
            socket.to(user.id).emit("new user", {newUserId: socketId, userName, userImg});
        }

    });

    // creating an offer and send the event to other user
    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    // answering the call and sending it back to the original user
    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    // finding the path with ice-candidate 
    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });

    // ============Handling Group Video Call===============
    socket.on("join room group", roomID => {
        // getting the room with the room ID and adding the user to the room
        if (users[roomID]) {
            const length = users[roomID].length;

            // if 500 people have joined already, alert that room is full
            if (length === 500) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        // returning new room with all the attendees after new attendee joined
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    // sending signal to existing members when user join
    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    // signal recieved by the user who joined
    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    // handling user disconnect in group call
    socket.on('disconnect', () => {
        // remove user form room if disconnect
        for (const roomID in rooms) {
            const room = rooms[roomID];
            const index = room.findIndex(user => user.id === socketId);
            if (index !== -1) {
                room.splice(index, 1);
                const otherUser = room[0];
                if (otherUser) {
                    socket.to(otherUser.id).emit("user left");
                }
                break; // Assuming a user can only be in one room, exit the loop after finding the room.
            }
        }
       
        // getting the group room array with all the participants
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];

        if (room) {
            // finding the person who left the room
            // creating a new array with the remaining people
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }

        // emiting a signal and sending it to everyone that a user left
        socket.broadcast.emit('user left', socket.id);
    });
});


// // accepting the broadcast offer and sending it back to the node server
// app.post("/consumer", async ({ body }, res) => {
//     const peer = new webrtc.RTCPeerConnection({
//         iceServers: [
//             { urls: 'stun:stun.l.google.com:19302' },
//                    { urls: 'stun:stun1.l.google.com:19302' },
//                    { urls: 'stun:stun2.l.google.com:19302' },
//                    { urls: 'stun:stun3.l.google.com:19302' },
//                    { urls: 'stun:stun4.l.google.com:19302' },
//                    { urls: "stun:openrelay.metered.ca:80" },
//                    {
//                        urls: 'turn:numb.viagenie.ca',
//                        credential: 'muazkh',
//                        username: 'webrtc@live.com'
//                    },
//                    {
//                     url: 'turn:turn.anyfirewall.com:443?transport=tcp',
//                     credential: 'webrtc',
//                     username: 'webrtc'
//                     },
//                     {
//                     urls: "turn:openrelay.metered.ca:80",
//                     username: "openrelayproject",
//                     credential: "openrelayproject",
//                     },
//                     {
//                     urls: "turn:openrelay.metered.ca:443",
//                     username: "openrelayproject",
//                     credential: "openrelayproject",
//                     },
//                     {
//                     urls: "turn:openrelay.metered.ca:443?transport=tcp",
//                     username: "openrelayproject",
//                     credential: "openrelayproject",
//                   },
//         ]
//     });
//     const desc = new webrtc.RTCSessionDescription(body.sdp);
//     await peer.setRemoteDescription(desc);
//     senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     const payload = {
//         sdp: peer.localDescription
//     }

//     res.json(payload);
// });

// ========Live Broadcast=========
app.post('/broadcast', async ({ body }, res) => {

    // creating a peer connection only once
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

    // recieving the offer and sending our own description
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new RTCSessionDescription({
        type: 'offer', // or 'answer' depending on the SDP type
        sdp: sdp
        });
    // const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.RTCSessionDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
}

// if (process.env.NODE_ENV == 'production') {
//     app.use(express.static('client/build'));
//     const path = require("path");
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
// }



const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`the web server is running on port ${port}`));