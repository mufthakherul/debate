const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store active debate rooms
const debateRooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a debate room
  socket.on('join-room', (data) => {
    const { roomId, userName, role } = data;
    socket.join(roomId);
    
    if (!debateRooms.has(roomId)) {
      debateRooms.set(roomId, {
        id: roomId,
        participants: [],
        motion: '',
        timer: null,
        speakerQueue: [],
        scores: {}
      });
    }

    const room = debateRooms.get(roomId);
    room.participants.push({
      id: socket.id,
      name: userName,
      role: role
    });

    socket.emit('room-joined', { roomId, room });
    io.to(roomId).emit('participant-joined', {
      name: userName,
      role: role,
      participants: room.participants
    });
  });

  // Set debate motion
  socket.on('set-motion', (data) => {
    const { roomId, motion } = data;
    if (debateRooms.has(roomId)) {
      debateRooms.get(roomId).motion = motion;
      io.to(roomId).emit('motion-updated', { motion });
    }
  });

  // Timer controls
  socket.on('start-timer', (data) => {
    const { roomId, duration, speakerName } = data;
    io.to(roomId).emit('timer-started', { duration, speakerName });
  });

  socket.on('pause-timer', (data) => {
    const { roomId } = data;
    io.to(roomId).emit('timer-paused');
  });

  socket.on('reset-timer', (data) => {
    const { roomId } = data;
    io.to(roomId).emit('timer-reset');
  });

  // Speaker queue management
  socket.on('add-speaker', (data) => {
    const { roomId, speakerName, speakerType } = data;
    if (debateRooms.has(roomId)) {
      const room = debateRooms.get(roomId);
      room.speakerQueue.push({ name: speakerName, type: speakerType });
      io.to(roomId).emit('queue-updated', { queue: room.speakerQueue });
    }
  });

  socket.on('remove-speaker', (data) => {
    const { roomId, index } = data;
    if (debateRooms.has(roomId)) {
      const room = debateRooms.get(roomId);
      room.speakerQueue.splice(index, 1);
      io.to(roomId).emit('queue-updated', { queue: room.speakerQueue });
    }
  });

  // Scoring
  socket.on('submit-score', (data) => {
    const { roomId, judgeName, scores } = data;
    if (debateRooms.has(roomId)) {
      const room = debateRooms.get(roomId);
      room.scores[judgeName] = scores;
      io.to(roomId).emit('scores-updated', { scores: room.scores });
    }
  });

  // Chat messages
  socket.on('send-message', (data) => {
    const { roomId, userName, message } = data;
    io.to(roomId).emit('new-message', { userName, message, timestamp: new Date() });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove participant from all rooms
    debateRooms.forEach((room, roomId) => {
      const index = room.participants.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const participant = room.participants[index];
        room.participants.splice(index, 1);
        io.to(roomId).emit('participant-left', {
          name: participant.name,
          participants: room.participants
        });
      }
    });
  });
});

// API Routes
app.get('/api/rooms', (req, res) => {
  const rooms = Array.from(debateRooms.values()).map(room => ({
    id: room.id,
    participantCount: room.participants.length,
    motion: room.motion
  }));
  res.json(rooms);
});

server.listen(PORT, () => {
  console.log(`Debate server running on port ${PORT}`);
});
