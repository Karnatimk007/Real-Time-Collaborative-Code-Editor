import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
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
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">

     

      {/* 🚀 HERO SECTION */}
      <div className="flex flex-col items-center justify-center text-center flex-1 px-4">

        <span className="text-sm bg-blue-900 text-blue-300 px-3 py-1 rounded-full mb-4">
          Now with AI Integration 🚀
        </span>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Code Together,{" "}
          <span className="text-blue-500">Build Faster</span>
        </h1>

        <p className="text-gray-400 max-w-xl mb-8">
          Real-time collaborative code editor for developers. Sync, share,
          and ship your projects from anywhere in the world.
        </p>

        {/* 🔥 ACTION BUTTONS */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={createRoom}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-lg shadow-lg"
          >
            Create Room →
          </button>

          <button
            onClick={joinRoom}
            className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg text-lg border border-gray-700"
          >
            Join Room
          </button>
        </div>

        {/* 🔽 ROOM INPUT */}
        <input
          type="text"
          placeholder="Enter Room ID..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full max-w-md p-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-12"
        />

        {/* 💻 CODE PREVIEW MOCK */}
        <div className="w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">

          {/* Fake editor header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-3 text-sm text-gray-400">main.js</span>
          </div>

          {/* Fake code */}
          <div className="p-4 text-left text-sm font-mono text-gray-300 space-y-2">
            <p><span className="text-purple-400">const</span> room = <span className="text-green-400">"CodeSync"</span>;</p>
            <p><span className="text-blue-400">function</span> startSession() {"{"}</p>
            <p className="ml-4">console.log(<span className="text-green-400">"Collaboration started 🚀"</span>);</p>
            <p>{"}"}</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;