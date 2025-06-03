// // sockets/socketHandler.js

// const socketHandler = (io) => {
//   const socketToRoomMap = {};
//   // Map socket IDs to their PeerJS IDs for easy lookup
//   const socketToPeerMap = {};

//   io.on('connection', (socket) => {
//     console.log(`Socket connected: ${socket.id}`);

//     // Listen for a user joining a room
//     socket.on('join-room', ({ meetingId, userId, peerId }) => { // Added peerId
//       console.log(`Socket ${socket.id} (User ${userId}, Peer ${peerId}) attempting to join room ${meetingId}`);

//       // Join the specific room
//       socket.join(meetingId);
//       socketToRoomMap[socket.id] = meetingId;
//       socketToPeerMap[socket.id] = peerId; // Store the peerId

//       // Notify *everyone else* in the room that a new user has joined
//       // Send the new user's socket ID AND peer ID
//       socket.to(meetingId).emit('user-joined', {
//           socketId: socket.id,
//           userId,
//           peerId // Send the new peerId
//       });

//       console.log(`Socket ${socket.id} joined room ${meetingId}`);

//       // Optional: Send existing participants' peer IDs to the new user
//       const clientsInRoom = io.sockets.adapter.rooms.get(meetingId);
//       const participants = [];
//       if (clientsInRoom) {
//           clientsInRoom.forEach(id => {
//               if (id !== socket.id && socketToPeerMap[id]) {
//                   participants.push({ socketId: id, peerId: socketToPeerMap[id] });
//               }
//           });
//       }
//        socket.emit('existing-participants', { participants });
//        console.log(`Sent existing participants to ${socket.id}:`, participants);
//     });


//     // Handle disconnection
//     socket.on('disconnect', () => {
//       console.log(`Socket disconnected: ${socket.id}`);
//       const meetingId = socketToRoomMap[socket.id];
//       const peerId = socketToPeerMap[socket.id];

//       if (meetingId) {
//         // Notify others in the room that this user has left
//         socket.to(meetingId).emit('user-left', { socketId: socket.id, peerId }); // Send peerId too
//         delete socketToRoomMap[socket.id];
//         delete socketToPeerMap[socket.id]; // Clean up peer map
//         console.log(`Socket ${socket.id} (Peer ${peerId}) left room ${meetingId}`);
//       }
//     });
//   });
// };

// export default socketHandler;

// sockets/socketHandler.js
import { v4 as uuidv4 } from 'uuid'; // We might need this later if we add message IDs

const socketHandler = (io) => {
  const socketToRoomMap = {};
  const socketToPeerMap = {};
  // Store user info (like name or ID) associated with a socket
  const socketToUserMap = {}; 
  const socketToStatusMap = {}; 

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Listen for a user joining a room
    socket.on('join-room', ({ meetingId, userName, peerId, initialAudio, initialVideo }) => {
      console.log(`Socket ${socket.id} (User ${userName}, Peer ${peerId}) attempting to join room ${meetingId}`);
      socket.join(meetingId);
      socketToRoomMap[socket.id] = meetingId;
      socketToPeerMap[socket.id] = peerId;
      socketToUserMap[socket.id] = userName; // Store the user ID/
      socketToStatusMap[socket.id] = { audio: initialAudio, video: initialVideo };

      socket.to(meetingId).emit('user-joined', {
        socketId: socket.id,
        userName,
        peerId,
        status: socketToStatusMap[socket.id] // <-- Send status
      });
      console.log(`Socket ${socket.id} joined room ${meetingId}`);

      const clientsInRoom = io.sockets.adapter.rooms.get(meetingId);
      const participants = [];
      if (clientsInRoom) {
        clientsInRoom.forEach(id => {
          if (id !== socket.id && socketToPeerMap[id]) {
            participants.push({ socketId: id, peerId: socketToPeerMap[id], userName: socketToUserMap[id], status: socketToStatusMap[id] || { audio: true, video: true } });
          }
        });
      }
      socket.emit('existing-participants', { participants });
    });

       // --- NEW: Listen for Status Changes ---
    socket.on('send-status-change', ({ type, status }) => {
        const meetingId = socketToRoomMap[socket.id];
        const peerId = socketToPeerMap[socket.id];
        const userName = socketToUserMap[socket.id]; // Get userName

        if (meetingId && peerId && socketToStatusMap[socket.id]) {
            console.log(`Status change from ${peerId}: ${type} is now ${status}`);
            // Update status on server
            socketToStatusMap[socket.id][type] = status;
            // Broadcast change to others
            socket.to(meetingId).emit('receive-status-change', {
                peerId,
                userName,
                type, // 'audio' or 'video'
                status // true (on) or false (off)
            });
        }
    });
    // --- END NEW ---

    // --- CHAT LOGIC START ---

    // Listen for a chat message being sent
    socket.on('send-chat-message', ({ meetingId, message }) => {
        const senderName = socketToUserMap[socket.id] || socket.id; // Get sender's ID/name
        const senderPeerId = socketToPeerMap[socket.id];

        console.log(`Room ${meetingId} received message from ${senderId}: ${message}`);

        // Broadcast the message to everyone in the room (including sender)
        io.to(meetingId).emit('receive-chat-message', {
            message,
            senderName,
            senderPeerId, // Send PeerId too, might be useful
            timestamp: new Date().toISOString(),
        });
    });

    // --- CHAT LOGIC END ---

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const meetingId = socketToRoomMap[socket.id];
      const peerId = socketToPeerMap[socket.id];
      const userName = socketToUserMap[socket.id];

      if (meetingId) {
        socket.to(meetingId).emit('user-left', { socketId: socket.id, peerId, userName });
        delete socketToRoomMap[socket.id];
        delete socketToPeerMap[socket.id];
        delete socketToUserMap[socket.id]; // Clean up user map
         delete socketToStatusMap[socket.id]; // <-- Clean up status map
        console.log(`Socket ${socket.id} (Peer ${peerId}, User ${userName}) left room ${meetingId}`);
      }
    });
  });
};

export default socketHandler;