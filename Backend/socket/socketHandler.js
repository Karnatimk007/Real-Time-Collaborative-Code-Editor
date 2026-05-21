import Room from '../models/Room.js';

// ── In-Memory Store ───────────────────────────────────────────────
// roomUsers = { roomId: { socketId: username } }
const roomUsers = {};

// ── Code Persistence Debounce Map ─────────────────────────────────
// Avoids writing to DB on every keystroke — saves after 1s of inactivity
const codeDebounceTimers = {};

const debounceCodeSave = (roomId, code) => {
  if (codeDebounceTimers[roomId]) {
    clearTimeout(codeDebounceTimers[roomId]);
  }
  codeDebounceTimers[roomId] = setTimeout(async () => {
    try {
      await Room.updateOne({ roomId }, { $set: { code } });
      delete codeDebounceTimers[roomId];
    } catch (err) {
      console.error(`[DB] Code save error for room ${roomId}:`, err.message);
    }
  }, 1000); // 1 second debounce
};

// ── Socket Handler ────────────────────────────────────────────────
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ──────────────────────────────────────────────────────────────
    // EVENT: join-room
    // Payload: { roomId, username, password? }
    // ──────────────────────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, username, password }) => {
      try {
        // 1. Validate 6-digit format
        if (!/^\d{6}$/.test(roomId)) {
          return socket.emit('error', { message: 'Invalid Room ID format' });
        }
        if (!username || typeof username !== 'string' || username.trim() === '') {
          return socket.emit('error', { message: 'Username is required' });
        }

        // 2. Find room in DB
        const room = await Room.findOne({ roomId });
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        // 3. Check room active
        if (!room.isActive) {
          return socket.emit('error', { message: 'Room is no longer active' });
        }

        // 4. Check capacity
        if (room.activeParticipants >= room.maxParticipants) {
          return socket.emit('error', { message: 'Room is full' });
        }

        // 5. Check password
        if (room.isProtected) {
          if (!password) {
            return socket.emit('error', { message: 'Password required', isProtected: true });
          }
          const result = await room.comparePassword(password);
          if (!result.success) {
            return socket.emit('error', { message: 'Incorrect password', isProtected: true });
          }
        }

        // 6. Attach room context to socket
        socket.currentRoom = roomId;
        socket.username = username.trim();

        // 7. Join socket room
        await socket.join(roomId);

        // 8. Add to in-memory store
        if (!roomUsers[roomId]) roomUsers[roomId] = {};
        roomUsers[roomId][socket.id] = socket.username;

        // 9. DB Update: increment activeParticipants, push participant, clear expiry
        const updatedRoom = await Room.findOneAndUpdate(
          { roomId },
          {
            $inc: { activeParticipants: 1 },
            $push: { 
              participants: { username: socket.username, socketId: socket.id }
            },
            $set: { expiresAt: null, lastEmptiedAt: null },
          },
          { returnDocument: 'after' }
        );

        // 10. Send existing state to the joining user
        socket.emit('load-code', {
          code: updatedRoom.code,
          language: updatedRoom.language,
        });
        socket.emit('load-messages', updatedRoom.messages.slice(-100)); // last 100 messages
        socket.emit('room-info', {
          roomId: updatedRoom.roomId,
          createdBy: updatedRoom.createdBy,
          maxParticipants: updatedRoom.maxParticipants,
          activeParticipants: updatedRoom.activeParticipants,
          isProtected: updatedRoom.isProtected,
          language: updatedRoom.language,
        });

        // 11. Notify others: user joined
        socket.to(roomId).emit('user-joined', { username: socket.username });

        // 12. Broadcast updated user list to everyone in room
        const usersInRoom = Object.values(roomUsers[roomId]);
        io.to(roomId).emit('room-users', usersInRoom);

        console.log(`[Socket] ${socket.username} joined room ${roomId} (${updatedRoom.activeParticipants}/${updatedRoom.maxParticipants})`);
      } catch (err) {
        console.error('[Socket] join-room error:', err.message);
        socket.emit('error', { message: 'Internal Server Error' });
      }
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: code-change
    // Payload: { roomId, code }
    // Broadcasts to room and debounce-saves to DB
    // ──────────────────────────────────────────────────────────────
    socket.on('code-change', ({ roomId, code }) => {
      try {
        // Broadcast to others with username info
        socket.to(roomId).emit('code-update', { 
          code, 
          username: socket.username 
        });

        // Debounced DB save (1s after last keystroke)
        debounceCodeSave(roomId, code);
      } catch (err) {
        console.error('[Socket] code-change error:', err.message);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: sync-code
    // Payload: { roomId }
    // Allows a late-joiner to explicitly request the latest saved code
    // ──────────────────────────────────────────────────────────────
    socket.on('sync-code', async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId }).select('code language');
        if (room) {
          socket.emit('load-code', { code: room.code, language: room.language });
        }
      } catch (err) {
        console.error('[Socket] sync-code error:', err.message);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: language-change
    // Payload: { roomId, language }
    // ──────────────────────────────────────────────────────────────
    socket.on('language-change', async ({ roomId, language }) => {
      try {
        const VALID_LANGS = ['javascript', 'python', 'cpp', 'c', 'java', 'typescript', 'go', 'rust'];
        if (!VALID_LANGS.includes(language)) {
          return socket.emit('error', { message: 'Invalid language' });
        }

        // Broadcast to others
        socket.to(roomId).emit('language-update', language);

        // Save to DB (update language only)
        await Room.updateOne({ roomId }, { $set: { language } });
      } catch (err) {
        console.error('[Socket] language-change error:', err.message);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: cursor-move
    // Payload: { roomId, username, line, column }
    // Live cursor tracking — broadcast to others only
    // ──────────────────────────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, username, position }) => {
      socket.to(roomId).emit('cursor-update', { username, position });
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: typing
    // Payload: { roomId, username }
    // Typing indicator for chat
    // ──────────────────────────────────────────────────────────────
    socket.on('typing', ({ roomId, username }) => {
      socket.to(roomId).emit('user-typing', { username });
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: stop-typing
    // Payload: { roomId, username }
    // ──────────────────────────────────────────────────────────────
    socket.on('stop-typing', ({ roomId, username }) => {
      socket.to(roomId).emit('user-stop-typing', { username });
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: send-message
    // Payload: { roomId, username, message }
    // Broadcasts and persists chat message
    // ──────────────────────────────────────────────────────────────
    socket.on('send-message', async ({ roomId, username, message }) => {
      try {
        if (!message || !message.trim()) return;

        const msgObj = {
          sender: username,
          message: message.trim(),
          timestamp: new Date(),
        };

        // Broadcast to ALL in room (including sender for confirmation)
        io.to(roomId).emit('receive-message', msgObj);

        // Persist to DB
        await Room.updateOne({ roomId }, { $push: { messages: msgObj } });
      } catch (err) {
        console.error('[Socket] send-message error:', err.message);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: leave-room
    // Payload: { roomId, username }
    // Explicit leave (before disconnect)
    // ──────────────────────────────────────────────────────────────
    socket.on('leave-room', async ({ roomId, username }) => {
      await handleLeave(socket, io, roomId, username);
      await socket.leave(roomId);
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: disconnect
    // Automatic cleanup when socket closes
    // ──────────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      const roomId = socket.currentRoom;
      const username = socket.username;

      if (roomId) {
        await handleLeave(socket, io, roomId, username);
      }

      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

// ── Shared Leave Logic ────────────────────────────────────────────
async function handleLeave(socket, io, roomId, username) {
  try {
    // Remove from in-memory store
    if (roomUsers[roomId]) {
      delete roomUsers[roomId][socket.id];
    }

    // DB update: decrement activeParticipants, pull participant
    const room = await Room.findOneAndUpdate(
      { roomId },
      {
        $inc: { activeParticipants: -1 },
        $pull: { participants: { socketId: socket.id } }
      },
      { returnDocument: 'after' }
    );

    if (!room) return;

    // Notify others
    socket.to(roomId).emit('user-left', { username });

    // Broadcast updated user list
    const updatedUsers = Object.values(roomUsers[roomId] || {});
    io.to(roomId).emit('room-users', updatedUsers);

    // If room is now empty → set expiry based on roomDuration
    if (room.activeParticipants <= 0) {
      const gracePeriodMinutes = room.roomDuration || 30;
      await Room.updateOne(
        { roomId },
        {
          $set: {
            expiresAt: new Date(Date.now() + gracePeriodMinutes * 60 * 1000),
            lastEmptiedAt: new Date(),
            activeParticipants: 0,
          },
        }
      );
      // Clean up in-memory store for this room
      delete roomUsers[roomId];
      console.log(`[Socket] Room ${roomId} is empty — scheduled for deletion in ${gracePeriodMinutes} min`);
    }

    console.log(`[Socket] ${username} left room ${roomId}`);
  } catch (err) {
    console.error('[Socket] handleLeave error:', err.message);
  }
}

export default socketHandler;
