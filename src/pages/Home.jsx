import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

function Home() {

  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = uuid();
    navigate(`/codingroom/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/codingroom/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 mt-20">

      <h1 className="text-4xl font-bold">
        Welcome to CodeEditor
      </h1>

      {/* Create Room */}
      <button
        onClick={createRoom}
        className="bg-green-500 text-white px-6 py-3 rounded text-lg"
      >
        Create Room
      </button>

      {/* Join Room */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Room ID"
          className="border p-2 rounded"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button
          onClick={joinRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Join Room
        </button>
      </div>

    </div>
  );
}

export default Home;