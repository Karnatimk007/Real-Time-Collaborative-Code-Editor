import  CodeEditor from "../components/CodeEditor";
import Chat from "../components/Chat";
import Users from "../components/Users";

function CodingRoom() {
  return (
    <div className="flex h-screen">

      {/* Users Panel */}
      <div className="w-1/5 bg-gray-900 text-white p-4">
        <Users />
      </div>

      {/* Editor Panel */}
      <div className="flex-1 bg-gray-800 text-white p-4">
        <CodeEditor />
      </div>

      {/* Chat Panel */}
      <div className="w-1/5 bg-gray-200 p-4">
        <Chat />
      </div>

    </div>
  );
}

export default CodingRoom;