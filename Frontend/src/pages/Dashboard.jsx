import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createRoom, validateRoom } from "../services/authServices";

function Dashboard() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // ── Create a real room via backend ────────────────────────────────
  const createNewRoom = async () => {
    setError("");
    setCreating(true);
    try {
      const res = await createRoom({ language: "javascript", maxParticipants: 5 });
      navigate(`/codingroom/${res.data.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  // ── Validate then join room ───────────────────────────────────────
  const joinRoom = async () => {
    if (!roomId.trim()) return;
    setError("");
    setJoining(true);
    try {
      await validateRoom(roomId.trim(), { password: password || undefined });
      navigate(`/codingroom/${roomId.trim()}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        {/* Create Room */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg mb-2 font-semibold">Create Room</h2>
          <p className="text-gray-400 text-sm mb-4">Start a new collaborative session</p>

          <button
            onClick={createNewRoom}
            disabled={creating}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 p-3 rounded-lg transition"
          >
            {creating ? "Creating..." : "Create New Room"}
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg mb-2 font-semibold">Join Room</h2>
          <p className="text-gray-400 text-sm mb-4">Enter a 6-digit room ID to join</p>

          <input
            type="text"
            placeholder="Room ID (6 digits)"
            className="w-full p-3 mb-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roomId}
            maxLength={6}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (if protected)"
            className="w-full p-3 mb-4 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={joinRoom}
            disabled={joining}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 p-3 rounded-lg transition"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;