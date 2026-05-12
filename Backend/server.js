import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import socketHandler from './socket/socketHandler.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';
import executeRoutes from './routes/execute.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = isDev
  ? [/^http:\/\/localhost:(5173|5174|5175|5176|5177)$/]  // allow any Vite dev port
  : [process.env.FRONTEND_URL];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    const allowed = allowedOrigins.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );
    if (allowed) return callback(null, true);
    return callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Global Middleware ─────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Rate Limiting ─────────────────────────────
// General API limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Auth limiter: stricter — 10 login/register attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// Execute limiter: 20 executions per minute per IP
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Execution rate limit exceeded. Please wait before running more code.' },
});

app.use('/api/', apiLimiter);

// ── Routes ────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/execute', executeLimiter, executeRoutes);

// ── Health Check ──────────────────────────────
app.get('/', (req, res) => {
  res.send('Collaborative Code Editor API is running...');
});

// ── HTTP Server ───────────────────────────────
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
      );
      if (allowed) return callback(null, true);
      return callback(new Error(`Socket CORS: ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHandler(io);

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS mode: ${isDev ? 'development (localhost:5173-5177)' : process.env.FRONTEND_URL}`);
});

// ── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  let message = err.message || 'Unexpected error';
  let details;

  if (err.name === 'ValidationError') {
    message = 'Validation error';
    details = Object.values(err.errors || {}).map((e) => e.message);
  }

  if (err.name === 'CastError') {
    message = 'Invalid value for field';
    details = [`${err.path} is invalid`];
  }

  if (err.code === 11000) {
    message = 'Duplicate value';
    const fields = Object.keys(err.keyValue || {});
    details = fields.length ? fields.map((f) => `${f} already exists`) : undefined;
  }

  if (err.name === 'StrictModeError') {
    message = 'Invalid fields provided';
    details = err.path ? [`${err.path} is not allowed`] : undefined;
  }

  const finalStatus = status === 500 && (err.name || err.code) ? 400 : status;

  const response = { message, status: finalStatus };
  if (details) response.details = details;
  if (!isProduction) response.stack = err.stack;

  console.error('Error:', err);
  res.status(finalStatus).json(response);
});