import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Paperclip,
  Search,
  MoreVertical,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function Chat({ socket, roomId, initialMessages = [] }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { currentUser } = useAuth();
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleLoadMessages = (msgs) => {
      setMessages(Array.isArray(msgs) ? msgs : []);
    };

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({ username }) => {
      // Don't show typing indicator for current user
      if (username !== currentUser?.username) {
        setTyping(username);
      }
    };

    const handleStopTyping = ({ username }) => {
      // Only clear if it matches the typing user
      if (username === typing) {
        setTyping(null);
      }
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
  }, [socket, currentUser?.username, typing]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      username: currentUser?.username || "Guest",
      message: message.trim(),
      type: "text",
    });

    socket.emit("stop-typing", {
      roomId,
      username: currentUser?.username,
    });

    setMessage("");
  };

  const handleTypingInput = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", {
      roomId,
      username: currentUser?.username,
    });

    clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      socket.emit("stop-typing", {
        roomId,
        username: currentUser?.username,
      });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Emoji Selection
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    socket.emit("send-message", {
      roomId,
      username: currentUser?.username || "Guest",
      message: fileURL,
      fileName: file.name,
      type: "file",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const date = new Date(timestamp);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-cyber-900">
      {/* Header */}
      <div className="p-4 border-b border-cyber-700 flex justify-between items-center bg-cyber-800/50 backdrop-blur-sm z-10">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></span>
          Room Chat
        </h3>

        <div className="flex gap-2 text-cyber-500">
          <button className="hover:text-white p-1">
            <Search size={16} />
          </button>

          <button className="hover:text-white p-1">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isMe =
              msg.sender === currentUser?.username;

            return (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={`flex flex-col ${
                  isMe
                    ? "items-end"
                    : "items-start"
                }`}
              >
                {!isMe && (
                  <span className="text-xs text-cyber-500 mb-1">
                    {msg.sender}
                  </span>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                    isMe
                      ? "bg-purple-600 text-white"
                      : "bg-cyber-800 text-gray-200"
                  }`}
                >
                  {msg.type === "file" ? (
                    <a
                      href={msg.message}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      📎 {msg.fileName}
                    </a>
                  ) : (
                    msg.message
                  )}
                </div>

                <span className="text-[10px] text-cyber-500 mt-1">
                  {formatTime(msg.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 24 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 text-xs text-neon-blue italic flex items-center gap-2"
          >
            <span>{typing} is typing</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="relative p-3 bg-cyber-800 border-t border-cyber-700">
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <div className="flex items-center gap-2 bg-cyber-900 border border-cyber-600 rounded-full p-2 pl-3">
          
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Upload Button */}
          <button
            onClick={() =>
              fileInputRef.current.click()
            }
            className="text-cyber-500 hover:text-white shrink-0 flex items-center justify-center"
          >
            <Paperclip size={18} />
          </button>
 
          {/* Message Input */}
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-gray-200 outline-none min-w-0"
            value={message}
            onChange={handleTypingInput}
            onKeyDown={handleKeyDown}
          />
 
          {/* Emoji Button */}
          <button
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
            className="text-cyber-500 hover:text-yellow-400 shrink-0 flex items-center justify-center"
          >
            <Smile size={18} />
          </button>
 
          {/* Send */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="bg-purple-600 text-white p-2 rounded-full shrink-0 flex items-center justify-center"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Chat;