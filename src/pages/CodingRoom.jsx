import CodeEditor from "../components/CodeEditor";
import Chat from "../components/Chat";
import Users from "../components/Users";
import { useParams } from "react-router-dom";

function CodingRoom() {

  const { roomId } = useParams();

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/codingroom/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  return (
    <div className="flex h-screen">

      {/* Users Panel */}
      <div className="w-1/5 bg-gray-900 text-white p-4">
        <Users />
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col bg-gray-800 text-white">

        {/* Top Toolbar */}
        <div className="flex justify-between items-center bg-gray-700 p-3">
          <span>Room ID: {roomId}</span>

          <button
            onClick={copyInviteLink}
            className="bg-blue-500 px-3 py-1 rounded"
          >
            Copy Invite Link
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          <CodeEditor />
        </div>

      </div>

      {/* Chat Panel */}
      <div className="w-1/5 bg-gray-200 p-4">
        <Chat />
      </div>

    </div>
  );
}

export default CodingRoom;