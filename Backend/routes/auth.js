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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email (dynamically importing to avoid circular deps if any, or just import at top)
    const { sendEmail } = await import('../utils/email.js');
    const sent = await sendEmail(
      user.email,
      'CodeSync - Password Reset OTP',
      `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>It will expire in 15 minutes.</p>`
    );

    if (!sent) {
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent to email successfully' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
