import Room from '../models/Room.js';
import { ROOM_LANGUAGES } from '../config/languages.js';

const roomUsers = {};
const codeDebounceTimers = {};

const MAX_ATTACHMENT_SIZE = 1.5 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_ATTACHMENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
];

const debounceCodeSave = (roomId, code) => {
  if (codeDebounceTimers[roomId]) clearTimeout(codeDebounceTimers[roomId]);

  codeDebounceTimers[roomId] = setTimeout(async () => {
    try {
      await Room.updateOne({ roomId }, { $set: { code } });
      delete codeDebounceTimers[roomId];
    } catch (err) {
      console.error(`[DB] Code save error for room ${roomId}:`, err.message);
    }
  }, 1000);
};

const isValidRoomId = (roomId) => typeof roomId === 'string' && /^\d{6}$/.test(roomId);

const normalizeUsers = (roomId) => Object.values(roomUsers[roomId] || {});

const buildSystemMessage = (message) => ({
  sender: 'System',
  message,
  type: 'system',
  timestamp: new Date(),
});

const isValidCursorPosition = (position) => (
  position &&
  Number.isInteger(position.lineNumber) &&
  Number.isInteger(position.column) &&
  position.lineNumber > 0 &&
  position.column > 0
);

const normalizeAttachment = (attachment) => {
  if (!attachment) return null;

  const name = String(attachment.name || 'attachment').slice(0, 180);
  const mimeType = String(attachment.mimeType || '');
  const size = Number(attachment.size || 0);
  const dataUrl = String(attachment.dataUrl || '');

  if (!name || !mimeType || !dataUrl || !Number.isFinite(size)) {
    throw new Error('Invalid attachment');
  }

  if (size <= 0 || size > MAX_ATTACHMENT_SIZE) {
    throw new Error('Attachment must be 1.5 MB or smaller');
  }

  if (!ALLOWED_ATTACHMENT_TYPES.includes(mimeType) && !mimeType.startsWith('image/')) {
    throw new Error('Unsupported attachment type');
  }

  if (!dataUrl.startsWith(`data:${mimeType};base64,`)) {
    throw new Error('Invalid attachment data');
  }

  return { name, mimeType, size, dataUrl };
};

const normalizeMessage = ({ username, message, type = 'text', attachment }) => {
  const cleanMessage = String(message || '').trim().slice(0, MAX_MESSAGE_LENGTH);
  const cleanAttachment = normalizeAttachment(attachment);
  const finalType = cleanAttachment
    ? (cleanAttachment.mimeType.startsWith('image/') ? 'image' : 'file')
    : 'text';

  if (!cleanMessage && !cleanAttachment) {
    throw new Error('Message cannot be empty');
  }

  if (type !== 'text' && type !== 'image' && type !== 'file') {
    throw new Error('Invalid message type');
  }

  return {
    sender: username,
    message: cleanMessage,
    type: finalType,
    attachment: cleanAttachment || undefined,
    timestamp: new Date(),
  };
};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, username, password }) => {
      try {
        if (!isValidRoomId(roomId)) {
          return socket.emit('error', { message: 'Invalid Room ID format' });
        }

        const cleanUsername = String(username || '').trim();
        if (!cleanUsername) {
          return socket.emit('error', { message: 'Username is required' });
        }

        const room = await Room.findOne({ roomId });
        if (!room) return socket.emit('error', { message: 'Room not found' });
        if (!room.isActive) return socket.emit('error', { message: 'Room is no longer active' });

        const existingParticipants = room.participants.filter((participant) => participant.socketId !== socket.id);
        if (existingParticipants.length >= room.maxParticipants) {
          return socket.emit('error', { message: 'Room is full' });
        }

        if (room.isProtected) {
          if (!password) {
            return socket.emit('error', { message: 'Password required', isProtected: true });
          }
          const result = await room.comparePassword(password);
          if (!result.success) {
            return socket.emit('error', { message: 'Incorrect password', isProtected: true });
          }
        }

        socket.currentRoom = roomId;
        socket.username = cleanUsername;
        socket.hasLeftRoom = false;
        socket.join(roomId);

        if (!roomUsers[roomId]) roomUsers[roomId] = {};
        roomUsers[roomId][socket.id] = cleanUsername;

        const joinMsg = buildSystemMessage(`${cleanUsername} joined the room`);
        room.participants = [...existingParticipants, { username: cleanUsername, socketId: socket.id }];
        room.activeParticipants = room.participants.length;
        room.expiresAt = null;
        room.lastEmptiedAt = null;
        room.messages.push(joinMsg);
        await room.save();

        socket.emit('load-code', { code: room.code, language: room.language });
        socket.emit('load-messages', room.messages.slice(-100));
        socket.emit('room-info', {
          roomId: room.roomId,
          createdBy: room.createdBy,
          maxParticipants: room.maxParticipants,
          activeParticipants: room.activeParticipants,
          isProtected: room.isProtected,
          language: room.language,
        });

        socket.to(roomId).emit('user-joined', { username: cleanUsername });
        socket.to(roomId).emit('receive-message', joinMsg);
        io.to(roomId).emit('room-users', normalizeUsers(roomId));

        console.log(`[Socket] ${cleanUsername} joined room ${roomId} (${room.activeParticipants}/${room.maxParticipants})`);
      } catch (err) {
        console.error('[Socket] join-room error:', err.message);
        socket.emit('error', { message: 'Internal Server Error' });
      }
    });

    socket.on('code-change', ({ roomId, code }) => {
      if (roomId !== socket.currentRoom || typeof code !== 'string') return;
      socket.to(roomId).emit('code-update', code);
      debounceCodeSave(roomId, code);
    });

    socket.on('sync-code', async ({ roomId }) => {
      try {
        if (roomId !== socket.currentRoom) return;
        const room = await Room.findOne({ roomId }).select('code language');
        if (room) socket.emit('load-code', { code: room.code, language: room.language });
      } catch (err) {
        console.error('[Socket] sync-code error:', err.message);
      }
    });

    socket.on('language-change', async ({ roomId, language }) => {
      try {
        if (roomId !== socket.currentRoom) return;
        if (!ROOM_LANGUAGES.includes(language)) {
          return socket.emit('error', { message: 'Invalid language' });
        }

        socket.to(roomId).emit('language-update', language);
        await Room.updateOne({ roomId }, { $set: { language } });
      } catch (err) {
        console.error('[Socket] language-change error:', err.message);
      }
    });

    socket.on('cursor-move', ({ roomId, position }) => {
      if (roomId !== socket.currentRoom || !isValidCursorPosition(position)) return;
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        username: socket.username || 'Guest',
        position,
      });
    });

    socket.on('typing', ({ roomId }) => {
      if (roomId !== socket.currentRoom) return;
      socket.to(roomId).emit('user-typing', { username: socket.username || 'Guest' });
    });

    socket.on('stop-typing', ({ roomId }) => {
      if (roomId !== socket.currentRoom) return;
      socket.to(roomId).emit('user-stop-typing', { username: socket.username || 'Guest' });
    });

    socket.on('send-message', async ({ roomId, message, type, attachment }) => {
      try {
        if (roomId !== socket.currentRoom) return;

        const msgObj = normalizeMessage({
          username: socket.username || 'Guest',
          message,
          type,
          attachment,
        });

        io.to(roomId).emit('receive-message', msgObj);
        await Room.updateOne({ roomId }, { $push: { messages: msgObj } });
      } catch (err) {
        console.error('[Socket] send-message error:', err.message);
        socket.emit('message-error', { message: err.message || 'Message failed' });
      }
    });

    socket.on('leave-room', async ({ roomId }) => {
      await handleLeave(socket, io, roomId || socket.currentRoom, socket.username);
      if (roomId) socket.leave(roomId);
    });

    socket.on('disconnect', async () => {
      if (socket.currentRoom) {
        await handleLeave(socket, io, socket.currentRoom, socket.username);
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

async function handleLeave(socket, io, roomId, username) {
  try {
    if (!roomId || socket.hasLeftRoom) return;
    socket.hasLeftRoom = true;

    if (roomUsers[roomId]) {
      delete roomUsers[roomId][socket.id];
    }

    const room = await Room.findOne({ roomId });
    if (!room) return;

    const beforeCount = room.participants.length;
    room.participants = room.participants.filter((participant) => participant.socketId !== socket.id);
    if (room.participants.length === beforeCount) return;

    const leaveMsg = buildSystemMessage(`${username || 'A participant'} left the room`);
    room.messages.push(leaveMsg);
    room.activeParticipants = room.participants.length;

    if (room.activeParticipants <= 0) {
      room.activeParticipants = 0;
      room.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      room.lastEmptiedAt = new Date();
      delete roomUsers[roomId];
    }

    await room.save();

    socket.to(roomId).emit('receive-message', leaveMsg);
    socket.to(roomId).emit('user-left', { username, socketId: socket.id });
    io.to(roomId).emit('room-users', normalizeUsers(roomId));

    socket.currentRoom = null;
    console.log(`[Socket] ${username} left room ${roomId}`);
  } catch (err) {
    console.error('[Socket] handleLeave error:', err.message);
  }
}

export default socketHandler;
