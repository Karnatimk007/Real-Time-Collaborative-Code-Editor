import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, Search, MoreVertical } from "lucide-react";

function Chat({ socket, roomId, initialMessages = [] }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(null);
  const { currentUser } = useAuth();
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleLoadMessages = (msgs) => {
      setMessages(Array.isArray(msgs) ? msgs : []);
    };

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({ username }) => {
      setTyping(username);
    };

    const handleStopTyping = () => {
      setTyping(null);
    };

    socket.on("load-messages", handleLoadMessages);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("load-messages", handleLoadMessages);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket]);

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

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-cyber-900">
      {/* Header */}
      <div className="p-4 border-b border-cyber-700 flex justify-between items-center bg-cyber-800/50 backdrop-blur-sm z-10">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(198,120,221,0.8)] animate-pulse"></span>
          Room Chat
        </h3>
        <div className="flex gap-2 text-cyber-500">
          <button className="hover:text-white transition-colors p-1"><Search size={16} /></button>
          <button className="hover:text-white transition-colors p-1"><MoreVertical size={16} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-cyber-500 opacity-50">
            <span className="text-4xl mb-2">👋</span>
            <p className="text-sm">Say hello to the room!</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isSystem = msg.sender === "System" || msg.sender === "system";
            const isMe = msg.sender === currentUser?.username;

            if (isSystem) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={index}
                  className="flex justify-center w-full my-2"
                >
                  <div className="px-4 py-1.5 bg-cyber-800/40 border border-cyber-700/50 rounded-full text-xs text-cyber-400 font-mono tracking-wide shadow-inner flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-purple shadow-[0_0_6px_rgba(198,120,221,0.8)] animate-pulse"></span>
                    {msg.message}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={index} 
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[10px] text-cyber-500 ml-1 mb-1 font-semibold tracking-wide">
                    {msg.sender}
                  </span>
                )}
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm break-words shadow-md ${
                    isMe 
                      ? "bg-gradient-to-br from-neon-purple to-purple-600 text-white rounded-br-sm" 
                      : "bg-cyber-800 border border-cyber-700 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.message}
                </div>
                <span className={`text-[9px] text-cyber-600 mt-1 ${isMe ? "mr-1" : "ml-1"}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div className="h-6 px-4 flex items-center">
        {typing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-cyber-500 font-medium italic flex items-center gap-1.5"
          >
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce delay-75"></span>
              <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce delay-150"></span>
            </span>
            {typing} is typing
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-cyber-800/80 border-t border-cyber-700">
        <div className="flex items-center gap-2 bg-cyber-900 border border-cyber-600 rounded-full p-1 pl-3 shadow-inner focus-within:border-neon-purple/50 focus-within:ring-1 focus-within:ring-neon-purple/20 transition-all">
          <button className="text-cyber-500 hover:text-gray-300 transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-sm text-gray-200 outline-none placeholder-cyber-600 py-1.5"
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
          />
          <button className="text-cyber-500 hover:text-yellow-500 transition-colors px-1">
            <Smile size={18} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-neon-purple text-white p-2 rounded-full hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-neon-purple transition-colors shadow-md"
          >
            <Send size={16} className="ml-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Chat;