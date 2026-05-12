# Real-Time Collaborative Code Editor Backend

This is a production-ready Node.js backend for a real-time collaborative code editor application.

## Features
- User Authentication (JWT + bcryptjs)
- Real-time room joining and synchronization
- Shared code editing with language support
- Real-time chat inside rooms
- Live cursor tracking
- Remote code execution via Judge0 API
- Auto-expiring rooms (30-minute grace period after all users leave)

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.io
- **Auth:** JWT (Access Tokens)
- **Code Execution:** Judge0 API (RapidAPI)

## Getting Started

1. **Clone the repository** (or copy the files).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file based on `.env.example`.
4. **Run the server:**
   - Development: `npm run dev`
   - Production: `npm start`

## API Routes

### Auth Routes (`/api/auth`)
- `POST /register`: Create a new account.
- `POST /login`: Log in and receive a JWT.

### Room Routes (`/api/room`) - Protected
- `POST /create`: Create a new room with a unique 6-digit ID.
- `GET /:roomId`: Get details of a specific room.
- `POST /execute`: Execute code using Judge0.
- `DELETE /:roomId`: Delete a room (Creator only).

## Socket.io Events

### Client to Server
- `join-room`: `{ roomId, username }`
- `code-change`: `{ roomId, code }`
- `language-change`: `{ roomId, language }`
- `cursor-move`: `{ roomId, cursor, username }`
- `send-message`: `{ roomId, username, message }`

### Server to Client
- `load-code`: `{ code, language }`
- `load-messages`: `Array of messages`
- `room-info`: `{ maxParticipants, activeParticipants }`
- `user-joined`: `{ username }`
- `user-left`: `{ username }`
- `room-users`: `List of usernames`
- `code-update`: `New code string`
- `language-update`: `New language string`
- `cursor-update`: `{ cursor, username }`
- `receive-message`: `Message object`
- `error`: `{ message }`
