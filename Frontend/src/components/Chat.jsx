import { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Image, Paperclip, Send, Smile, X } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTACHMENT_SIZE = 1.5 * 1024 * 1024;
const EMOJIS = ["😀", "😂", "😊", "😍", "🔥", "🎉", "👍", "🙏", "💡", "✅", "👀", "🚀"];

const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

function Chat({ socket, roomId, initialMessages = [] }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useAuth();
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleLoadMessages = (msgs) => setMessages(Array.isArray(msgs) ? msgs : []);
    const handleReceiveMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleTyping = ({ username }) => {
      if (username && username !== currentUser?.username) setTyping(username);
    };
    const handleStopTyping = () => setTyping(null);
    const handleMessageError = ({ message: errorMessage }) => toast.error(errorMessage || "Message failed");

    socket.on("load-messages", handleLoadMessages);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);
    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("load-messages", handleLoadMessages);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
      socket.off("message-error", handleMessageError);
    };
  }, [socket, currentUser?.username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingAttachment]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed && !pendingAttachment) return;

    socket.emit("send-message", {
      roomId,
      message: trimmed,
      type: pendingAttachment?.mimeType?.startsWith("image/") ? "image" : pendingAttachment ? "file" : "text",
      attachment: pendingAttachment,
    });
    socket.emit("stop-typing", { roomId });
    setMessage("");
    setPendingAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { roomId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("stop-typing", { roomId }), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error("File is too large", { description: "Please upload a file up to 1.5 MB." });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result,
      });
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error("Could not read file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => `${prev}${emoji}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderAttachment = (attachment, type) => {
    if (!attachment) return null;

    if (type === "image" || attachment.mimeType?.startsWith("image/")) {
      return (
        <a href={attachment.dataUrl} download={attachment.name} className="block mt-2">
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="max-h-44 max-w-full rounded-lg border border-cyber-600 object-contain bg-cyber-900"
          />
        </a>
      );
    }

    return (
      <a
        href={attachment.dataUrl}
        download={attachment.name}
        className="mt-2 flex items-center gap-2 rounded-lg border border-cyber-600 bg-cyber-900/70 px-3 py-2 text-gray-200 hover:border-neon-purple"
      >
        <FileText size={18} className="shrink-0 text-neon-blue" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold">{attachment.name}</span>
          <span className="block text-[10px] text-cyber-500">{formatBytes(attachment.size)}</span>
        </span>
        <Download size={15} className="shrink-0 text-cyber-400" />
      </a>
    );
  };

  return (
    <div className="flex flex-col h-full bg-cyber-900">
      <div className="p-4 border-b border-cyber-700 flex justify-between items-center bg-cyber-800/50 backdrop-blur-sm z-10">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(198,120,221,0.8)] animate-pulse" />
          Room Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-cyber-500 opacity-70">
            <span className="text-4xl mb-2">👋</span>
            <p className="text-sm">Say hello to the room!</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => {
            const isSystem = msg.sender === "System" || msg.sender === "system" || msg.type === "system";
            const isMe = msg.sender === currentUser?.username;

            if (isSystem) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={`${msg.timestamp || "system"}-${index}`}
                  className="flex justify-center w-full my-2"
                >
                  <div className="px-4 py-1.5 bg-cyber-800/40 border border-cyber-700/50 rounded-full text-xs text-cyber-400 font-mono tracking-wide shadow-inner">
                    {msg.message}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={`${msg.timestamp || "message"}-${index}`}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className={`text-[10px] text-cyber-500 mb-1 font-semibold tracking-wide ${isMe ? "mr-1" : "ml-1"}`}>
                  {isMe ? `${msg.sender} (You)` : msg.sender}
                </span>
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[88%] text-sm break-words shadow-md ${
                    isMe
                      ? "bg-gradient-to-br from-neon-purple to-purple-600 text-white rounded-br-sm"
                      : "bg-cyber-800 border border-cyber-700 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                  {renderAttachment(msg.attachment, msg.type)}
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

      <div className="h-6 px-4 flex items-center">
        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-cyber-500 font-medium italic flex items-center gap-1.5"
          >
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce delay-75" />
              <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce delay-150" />
            </span>
            {typing} is typing
          </motion.div>
        )}
      </div>

      <div className="p-3 bg-cyber-800/80 border-t border-cyber-700">
        {pendingAttachment && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-cyber-600 bg-cyber-900 px-3 py-2 text-xs text-gray-300">
            {pendingAttachment.mimeType.startsWith("image/") ? <Image size={16} /> : <FileText size={16} />}
            <span className="min-w-0 flex-1 truncate">
              {pendingAttachment.name} · {formatBytes(pendingAttachment.size)}
            </span>
            <button onClick={() => setPendingAttachment(null)} className="text-cyber-500 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
        )}

        {showEmojiPicker && (
          <div className="mb-2 grid grid-cols-6 gap-1 rounded-lg border border-cyber-600 bg-cyber-900 p-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="rounded-md p-1.5 text-lg hover:bg-cyber-700"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 bg-cyber-900 border border-cyber-600 rounded-full p-1 pl-3 shadow-inner focus-within:border-neon-purple/50 focus-within:ring-1 focus-within:ring-neon-purple/20 transition-all">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.txt,.csv,.json,.zip"
          />
          <button
            className="text-cyber-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            type="button"
            title="Attach image or file"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder={uploading ? "Reading file..." : "Type a message..."}
            className="flex-1 bg-transparent border-none text-sm text-gray-200 outline-none placeholder-cyber-600 py-1.5 min-w-0"
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
          />
          <button
            className="text-cyber-500 hover:text-yellow-500 transition-colors px-1"
            onClick={() => setShowEmojiPicker((value) => !value)}
            type="button"
            title="Add emoji"
          >
            <Smile size={18} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={(!message.trim() && !pendingAttachment) || uploading}
            className="bg-neon-purple text-white p-2 rounded-full hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-neon-purple transition-colors shadow-md"
            type="button"
            title="Send"
          >
            <Send size={16} className="ml-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
