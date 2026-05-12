import { useState } from "react";

function Chat() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    setMessages([...messages, message]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">

      <h2 className="text-lg font-bold mb-3">Chat</h2>

      {/* Messages */}
      <div className="flex-1 bg-black p-3 rounded overflow-y-auto mb-2">
        {messages.map((msg, index) => (
          <p key={index} className="mb-1 text-sm text-yellow-200">
            {msg}
          </p>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 bg-black">
        <input
          type="text"
          placeholder="Type message..."
          className="flex-1 border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 rounded"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default Chat;  