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
const { MongoClient, ServerApiVersion } = require('mongodb');

const bodyParser = require('body-parser');
// let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* =========== CREATING AND JOINING ROOMS FOR CONNECTION BETWEEN USERS =========*/
// room object to store the created room IDs
const rooms = {};
const users = {};
const socketToRoom = {};

// when the user is forming a connection with socket.io
io.on("connection", socket => {

    // ===========Handling one on one video call=============
    socket.on("join room", roomID => {

        // if the room is already created, that means a person has already joined the room
        // then take the new user and push them into the same room
        // else create a new room
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }

        // finding otherUSer - see if id is of the other user
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        // if someone has joined then we get the id of the other user
        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
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

        // getting the room array with all the participants
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

// // ========Live Broadcast=========
// app.post('/broadcast', async ({ body }, res) => {

//     // creating a peer connection only once
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

//     // recieving the offer and sending our own description
//     peer.ontrack = (e) => handleTrackEvent(e, peer);
//     const desc = new webrtc.RTCSessionDescription(body.sdp);
//     await peer.setRemoteDescription(desc);
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     const payload = {
//         sdp: peer.localDescription
//     }

//     res.json(payload);
// });

// function handleTrackEvent(e, peer) {
//     senderStream = e.streams[0];
// }

// if (process.env.NODE_ENV == 'production') {
//     app.use(express.static('client/build'));
//     const path = require("path");
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
// }

// =============================
//          MongoDB           //
//==============================

const uri = "mongodb+srv://meetroom:meetroom12345@cluster0.cgs9b.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// ======Main Function ========
async function run() {
  try {
    client.connect();
    console.log('Connected Successfuly');
    const scheduleCollection = client.db('MeetRoom').collection('meeting-slots');
    const userCollection = client.db('MeetRoom').collection('users');
    const memberCollection = client.db('MeetRoom').collection('members');
    const reviewCollection = client.db('MeetRoom').collection('reviews');
    // schedule Section
    app.post('/schedule', async (req, res) => {
      const newProduct = req.body;
      const result = await scheduleCollection.insertOne(newProduct);
      res.send(result);
    });
    app.get('/schedule', async (req, res) => {
      const query = {};
      const cursor = scheduleCollection.find(query);
      const products = await cursor.toArray();
      res.send(products)
    });
    app.post('/member', async (req, res) => {
      const members = req.body;
      const result = await memberCollection.insertOne(members);
      res.send(result);
    });

    // review start
    app.get('/review', async (req, res) => {


      const query = {}
      const purchases = await reviewCollection.find(query).toArray();
      return res.send(purchases);



    })
    app.post('/review', async (req, res) => {
      const purchase = req.body

      const result = await reviewCollection.insertOne(purchase);
      return res.send(result);
    })
    // ====Get Categories======
    app.get('/member', async (req, res) => {
      const query = {};
      const cursor = memberCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete('/member/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }
      const result = await memberCollection.deleteOne(filter);
      res.send(result);
    })
    // users Section
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user?.role === 'admin';
      res.send({ admin: isAdmin });
    })
    app.put('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })
    app.delete('/user/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    })


  }
  finally { }
}
run().catch(console.dir);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`the web server is running on port ${port}`));