import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    navigate(`/codingroom/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/codingroom/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        {/* Create Room */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg mb-4 font-semibold">Create Room</h2>

          <button
            onClick={createRoom}
            className="w-full bg-purple-500 hover:bg-purple-600 p-3 rounded-lg"
          >
            Create New Room
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg mb-4 font-semibold">Join Room</h2>

          <input
            type="text"
            placeholder="Enter Room ID"
            className="w-full p-3 mb-4 rounded bg-gray-800 border border-gray-700"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button
            onClick={joinRoom}
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg"
          >
            Join Room
          </button>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;