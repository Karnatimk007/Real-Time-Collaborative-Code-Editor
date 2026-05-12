import express from 'express';
import Room from '../models/Room.js';
import { verifyToken } from '../middleware/verifyToken.js';
import generateRoomId from '../utils/generateRoomId.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// ── POST /api/room/create ─────────────────────────────────────────
// Create a new room
router.post('/create', verifyToken, async (req, res) => {
  const {
    language = 'javascript',
    maxParticipants = 5,
    password = null,
    expiresInHours = 24,   // optional- room lifetime in hours (default 24h)
  } = req.body;

  try {
    if (maxParticipants < 2 || maxParticipants > 20) {
      return res.status(400).json({ message: 'maxParticipants must be between 2 and 20' });
    }

    const roomId = await generateRoomId();
    const isProtected = !!password;

    // Set room expiry = now + expiresInHours (will be cleared when someone joins)
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const newRoom = new Room({
      roomId,
      language,
      maxParticipants,
      password: password || undefined,
      isProtected,
      createdBy: req.user.username,
      expiresAt,
    });

    await newRoom.save();

    res.status(201).json({
      message: 'Room created successfully',
      roomId,
      language,
      maxParticipants,
      isProtected,
      expiresAt,
    });
  } catch (err) {
    console.error('Create Room Error:', err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// ── POST /api/room/validate/:roomId ───────────────────────────────
// Validate room (check existence, password, capacity) before joining
// NOTE: must be before /:roomId to avoid route conflict
router.post('/validate/:roomId', verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const { password } = req.body;

  try {
    if (!/^\d{6}$/.test(roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID format' });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isActive) {
      return res.status(403).json({ message: 'Room is no longer active' });
    }

    if (room.activeParticipants >= room.maxParticipants) {
      return res.status(403).json({ message: 'Room is full' });
    }

    if (room.isProtected) {
      if (!password) {
        return res.status(401).json({ message: 'Password required', isProtected: true });
      }
      const result = await room.comparePassword(password);
      if (!result.success) {
        return res.status(401).json({ message: 'Incorrect password', isProtected: true });
      }
    }

    res.json({
      message: 'Room validated successfully',
      payload: {
        roomId: room.roomId,
        language: room.language,
        isProtected: room.isProtected,
        createdBy: room.createdBy,
        maxParticipants: room.maxParticipants,
        activeParticipants: room.activeParticipants,
      },
    });
  } catch (err) {
    console.error('Validate Room Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── GET /api/room/:roomId ─────────────────────────────────────────
// Get room data (protected — must be a participant or creator)
router.get('/:roomId', verifyToken, async (req, res) => {
  const { roomId } = req.params;

  try {
    if (!/^\d{6}$/.test(roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID' });
    }

    const room = await Room.findOne({ roomId }).select('-password');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room found', payload: room });
  } catch (err) {
    console.error('Get Room Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── GET /api/room/:roomId/participants ────────────────────────────
router.get('/:roomId/participants', verifyToken, async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId }).select('participants activeParticipants maxParticipants');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      message: 'Participants found',
      payload: {
        participants: room.participants,
        activeParticipants: room.activeParticipants,
        maxParticipants: room.maxParticipants,
      },
    });
  } catch (err) {
    console.error('Get Participants Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── POST /api/room/:roomId/leave ──────────────────────────────────
// HTTP leave (fallback — socket disconnect is the primary path)
router.post('/:roomId/leave', verifyToken, async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const initialCount = room.participants.length;
    room.participants = room.participants.filter(
      (p) => p.username !== req.user.username
    );

    if (initialCount === room.participants.length) {
      return res.status(400).json({ message: 'User not in room' });
    }

    room.activeParticipants = room.participants.length;

    // If room is now empty, schedule deletion
    if (room.activeParticipants <= 0) {
      room.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min grace
      room.lastEmptiedAt = new Date();
      room.activeParticipants = 0;
    }

    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (err) {
    console.error('Leave Room Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── PUT /api/room/:roomId/language ────────────────────────────────
// Change room language (creator only)
router.put('/:roomId/language', verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const { language } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy !== req.user.username) {
      return res.status(403).json({ message: 'Only the room creator can change the language' });
    }

    room.language = language;
    await room.save();

    res.json({ message: 'Language updated', payload: { roomId, language } });
  } catch (err) {
    console.error('Change Language Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── DELETE /api/room/:roomId ──────────────────────────────────────
// Delete room (creator only)
router.delete('/:roomId', verifyToken, async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy !== req.user.username) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }

    await Room.deleteOne({ roomId });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('Delete Room Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
