import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/verifyToken.js';
dotenv.config();

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check duplicate email OR username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({ message: `${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: `User ${req.user.username} logged out successfully` });
  } catch (err) {
    console.error('Logout Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
