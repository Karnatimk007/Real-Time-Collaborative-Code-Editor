import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/authStore";

function Chat({ socket, roomId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(null);
  const { currentUser } = useAuth();
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    // Load message history from server on join
    socket.on("load-messages", (msgs) => {
      setMessages(msgs);
    });

    // Receive live messages
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Typing indicators
    socket.on("user-typing", ({ username }) => {
      setTyping(username);
    });
    socket.on("user-stop-typing", () => {
      setTyping(null);
    });

    return () => {
      socket.off("load-messages");
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [socket]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      username: currentUser?.username || "Guest",
      message: message.trim(),
    });

    socket.emit("stop-typing", { roomId, username: currentUser?.username });
    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", { roomId, username: currentUser?.username });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId, username: currentUser?.username });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 bg-black p-3 rounded overflow-y-auto mb-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">No messages yet</p>
        )}
        {messages.map((msg, index) => (
          <div key={index} className="text-sm">
            <span className="text-blue-400 font-semibold">{msg.sender}: </span>
            <span className="text-yellow-200">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typing && (
        <p className="text-xs text-gray-400 mb-1 px-1">{typing} is typing...</p>
      )}

      {/* Input */}
      <div className="flex gap-2 bg-black">
        <input
          type="text"
          placeholder="Type message..."
          className="flex-1 border border-gray-700 p-2 rounded bg-gray-900 text-white outline-none focus:ring-1 focus:ring-blue-500"
          value={message}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded transition"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default Chat;