import CodeEditor from "../components/CodeEditor";
import Chat from "../components/Chat";
import Users from "../components/Users";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "../services/socket";
import { useAuth } from "../store/authStore";

function CodingRoom() {
  const { roomId } = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("Connected:", socket.id);
      socket.emit("join-room", {
        roomId,
        username: currentUser?.username || "Guest",
      });
    };

    socket.on("connect", handleConnect);

    // If already connected (reconnect case), emit immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.emit("leave-room", { roomId });
      socket.disconnect();
    };
  }, [roomId, currentUser]);

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/codingroom/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white">

      {/* 🔝 TOP BAR */}
      <div className="flex justify-between items-center bg-gray-900 border-b border-gray-700 px-4 py-2">

        {/* Left */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Room</span>
          <span className="font-semibold">{roomId}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="bg-green-500 hover:bg-green-600 transition px-3 py-1 rounded text-sm">
            ▶ Run
          </button>

          <button
            onClick={copyInviteLink}
            className="bg-blue-500 hover:bg-blue-600 transition px-3 py-1 rounded text-sm"
          >
            Invite
          </button>
        </div>
      </div>

      {/* 🧱 MAIN LAYOUT */}
      <div className="flex flex-1 min-h-0">

        {/* 👥 USERS PANEL */}
        <div className="hidden lg:flex lg:w-1/5 bg-gray-900 border-r border-gray-700 flex-col">

          <div className="p-4 border-b border-gray-700 font-semibold">
            Participants
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Users socket={socket} roomId={roomId} />
          </div>
        </div>

        {/* 💻 EDITOR PANEL */}
        <div className="flex-1 flex flex-col min-h-0">

          <div className="flex-1 bg-[#1e1e1e] p-3 md:p-5 min-h-0">
            <div className="h-full rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <CodeEditor socket={socket} roomId={roomId} />
            </div>
          </div>

        </div>

        {/* 💬 CHAT PANEL */}
        <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-gray-900 border-l border-gray-700 flex-col">

          <div className="p-4 border-b border-gray-700 font-semibold">
            Chat
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Chat socket={socket} roomId={roomId} />
          </div>
        </div>

      </div>

      {/* 🔻 STATUS BAR */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-1 text-xs text-gray-400 flex justify-between">
        <span>🟢 Connected</span>
        <span>Room: {roomId}</span>
      </div>

    </div>
  );
}

export default CodingRoom;