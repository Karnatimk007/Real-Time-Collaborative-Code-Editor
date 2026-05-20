import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { socket } from "../services/socket";
import { API } from "../services/apis";
import CodeEditor from "../components/CodeEditor";
import Chat from "../components/Chat";
import Users from "../components/Users";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LogOut,
  Play,
  Copy,
  Check,
  Terminal,
  Users as UsersIcon,
  MessageSquare,
  Code2,
  Loader2,
  X,
  ChevronUp,
  Wifi,
  WifiOff,
  Share2,
  Link2,
} from "lucide-react";

// ── Language default snippets ──────────────────────────────────────
const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello, World!");`,
  python: `# Python\nprint("Hello, World!")`,
  java: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  c: `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp: `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  python3: `# Python\nprint("Hello, World!")`,
  go: `// Go\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  typescript: `// TypeScript\nconsole.log("Hello, World!");`,
};

// ── Tab types ─────────────────────────────────────────────────────
const TABS = { CHAT: "chat", USERS: "users" };

export default function CodingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const password = location.state?.password || "";

  // ── State ────────────────────────────────────────────────────────
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(true);
  const [joinError, setJoinError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CHAT);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [initialMessages, setInitialMessages] = useState([]);
  const [loadedCode, setLoadedCode] = useState("// Write your code here");
  const [loadedLanguage, setLoadedLanguage] = useState("javascript");
  const [roomUsers, setRoomUsers] = useState([]);

  // Current code & language tracked here so Run can read it
  const codeRef = useRef("// Write your code here");
  const langRef = useRef("javascript");

  // ── Socket lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Connect socket
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", {
        roomId,
        username: currentUser.username,
        password,
      });
    });

    socket.on("connect_error", () => {
      setConnected(false);
      setJoining(false);
      setJoinError("Cannot connect to server. Please try again.");
    });

    socket.on("disconnect", () => setConnected(false));

    // Room joined successfully — server sends load-code & room-info
    socket.on("load-code", ({ code, language }) => {
      const finalCode = code || DEFAULT_CODE[language] || "// Write your code here";
      const finalLang = language || "javascript";
      codeRef.current = finalCode;
      langRef.current = finalLang;
      setLoadedCode(finalCode);
      setLoadedLanguage(finalLang);
      setJoining(false);
    });

    socket.on("load-messages", (msgs) => {
      setInitialMessages(msgs || []);
    });

    socket.on("room-users", (usersList) => {
      setRoomUsers(usersList || []);
    });

    socket.on("room-info", (info) => {
      setRoomInfo(info);
      setJoining(false);
    });

    // Join errors
    socket.on("error", ({ message }) => {
      setJoinError(message);
      setJoining(false);
      toast.error("Failed to join room", {
        description: message,
      });
    });

    // Collaborator events
    socket.on("user-joined", ({ username }) => {
      toast.success(`${username} joined the room`, {
        icon: "🟢",
        duration: 3000,
      });
    });

    socket.on("user-left", ({ username }) => {
      toast.error(`${username} left the room`, {
        icon: "🔴",
        duration: 3000,
      });
    });

    return () => {
      socket.emit("leave-room", { roomId, username: currentUser.username });
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("load-code");
      socket.off("load-messages");
      socket.off("room-info");
      socket.off("error");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("room-users");
      socket.disconnect();
    };
  }, [roomId, currentUser, navigate]);

  // ── Track current code/language via callbacks from CodeEditor ──────
  const handleCodeChange = useCallback((newCode) => {
    codeRef.current = newCode;
  }, []);

  const handleLangChange = useCallback((lang) => {
    langRef.current = lang;
  }, []);

  // ── Copy room ID ──────────────────────────────────────────────────
  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  // ── Generate invite link ──────────────────────────────────────
  const getInviteLink = useCallback(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-room/${roomId}`;
  }, [roomId]);

  const copyInviteLink = useCallback(() => {
    const link = getInviteLink();
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!", {
      description: "Share this link with others to join the room.",
    });
  }, [getInviteLink]);

  // ── Leave room ────────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    toast.success("You left the room", {
      description: "Session ended successfully.",
      icon: "👋",
    });
    navigate("/dashboard");
  }, [navigate]);

  // ── Run code ──────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    setRunning(true);
    setShowOutput(true);
    setOutput(null);
    try {
      const res = await API.post("/execute", {
        language: langRef.current,
        code: codeRef.current,
      });
      setOutput(res.data);
      if (res.data.success) {
        toast.success("Execution completed successfully!", {
          description: `Time: ${res.data.time || "0"}s`,
        });
      } else {
        toast.error("Execution completed with errors", {
          description: res.data.status || "Execution failed",
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Execution failed";
      setOutput({
        success: false,
        status: "Error",
        output: errorMsg,
      });
      toast.error("Execution failed", {
        description: errorMsg,
      });
    } finally {
      setRunning(false);
    }
  }, []);

  // ── Error / Loading states ────────────────────────────────────────
  if (joining) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-gray-300"
        >
          <Loader2 size={40} className="animate-spin text-neon-purple" />
          <p className="text-lg font-semibold">Joining room <span className="text-neon-blue font-mono">#{roomId}</span>...</p>
        </motion.div>
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 bg-cyber-800 border border-red-500/30 rounded-2xl p-10 max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <X size={32} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Cannot Join Room</h2>
            <p className="text-gray-400 text-sm">{joinError}</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary px-6 py-2 rounded-lg text-sm"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen w-screen bg-cyber-900 overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 bg-cyber-800 border-b border-cyber-700 shrink-0 z-20">
        {/* Left: logo + room info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 size={20} className="text-neon-purple" />
            <span className="font-bold text-gray-100 text-sm tracking-wide">CodeSync</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-cyber-900 border border-cyber-600 rounded-lg">
            <span className="text-xs text-gray-400 font-mono">Room</span>
            <span className="text-sm font-mono font-semibold text-neon-blue">#{roomId}</span>
            <button
              onClick={copyRoomId}
              className="text-cyber-600 hover:text-gray-300 transition-colors ml-1"
              title="Copy room ID"
            >
              {copied ? <Check size={14} className="text-neon-green" /> : <Copy size={14} />}
            </button>
          </div>

          {roomInfo && (
            <span className="hidden md:block text-xs text-gray-500">
              {roomInfo.activeParticipants}/{roomInfo.maxParticipants} participants
            </span>
          )}
        </div>

        {/* Center: connection status */}
        <div className="flex items-center gap-1.5">
          {connected ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <Wifi size={13} />
              <span className="hidden sm:block">Connected</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <WifiOff size={13} />
              <span className="hidden sm:block">Disconnected</span>
            </span>
          )}
        </div>

        {/* Right: Invite + Run + Leave */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyInviteLink}
            title="Copy invite link"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-700 hover:bg-neon-blue/20 border border-cyber-600 hover:border-neon-blue/50 text-gray-300 hover:text-neon-blue text-sm rounded-lg transition-all"
          >
            <Share2 size={14} />
            <span className="hidden sm:block">Invite</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-neon-green text-cyber-900 font-bold text-sm rounded-lg disabled:opacity-60 transition-all hover:brightness-110"
          >
            {running ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {running ? "Running..." : "Run"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-700 hover:bg-red-500/20 border border-cyber-600 hover:border-red-500/50 text-gray-300 hover:text-red-400 text-sm rounded-lg transition-all"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Leave</span>
          </motion.button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Editor Column ─────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Editor */}
          <div
            className="flex-1 overflow-hidden"
            style={{ height: showOutput ? "60%" : "100%" }}
          >
            <CodeEditor
              socket={socket}
              roomId={roomId}
              onCodeChange={handleCodeChange}
              onLangChange={handleLangChange}
              defaultCodes={DEFAULT_CODE}
              initialCode={loadedCode}
              initialLanguage={loadedLanguage}
            />
          </div>

          {/* ── Output Panel ────────────────────────────────────── */}
          <AnimatePresence>
            {showOutput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "40%", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col bg-cyber-900 border-t border-cyber-700 overflow-hidden"
              >
                {/* Output header */}
                <div className="flex items-center justify-between px-4 py-2 bg-cyber-800 border-b border-cyber-700 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Terminal size={15} className="text-neon-green" />
                    Output
                    {output && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          output.success
                            ? "bg-green-500/10 text-neon-green border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {output.status}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-cyber-500 hover:text-gray-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Output content */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                  {running ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 size={16} className="animate-spin text-neon-green" />
                      Executing code...
                    </div>
                  ) : output ? (
                    <>
                      <pre
                        className={`whitespace-pre-wrap break-words ${
                          output.success ? "text-green-300" : "text-red-400"
                        }`}
                      >
                        {output.output || "(no output)"}
                      </pre>
                      {(output.time || output.memory) && (
                        <div className="mt-3 pt-3 border-t border-cyber-700 flex gap-4 text-xs text-cyber-500">
                          {output.time && <span>⏱ {output.time}s</span>}
                          {output.memory && <span>💾 {output.memory} KB</span>}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-cyber-500">No output yet. Run your code!</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle output button (when hidden) */}
          {!showOutput && output && (
            <button
              onClick={() => setShowOutput(true)}
              className="shrink-0 flex items-center justify-center gap-1.5 py-1.5 bg-cyber-800 border-t border-cyber-700 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Terminal size={12} />
              Show Output
              <ChevronUp size={12} />
            </button>
          )}
        </div>

        {/* ── Right Sidebar ─────────────────────────────────────── */}
        <div className="flex flex-col w-72 shrink-0 border-l border-cyber-700 bg-cyber-900 overflow-hidden">

          {/* Tabs */}
          <div className="flex shrink-0 bg-cyber-800 border-b border-cyber-700">
            <button
              onClick={() => setActiveTab(TABS.CHAT)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${
                activeTab === TABS.CHAT
                  ? "text-neon-purple border-b-2 border-neon-purple bg-cyber-900/50"
                  : "text-cyber-500 hover:text-gray-300"
              }`}
            >
              <MessageSquare size={14} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab(TABS.USERS)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${
                activeTab === TABS.USERS
                  ? "text-neon-purple border-b-2 border-neon-purple bg-cyber-900/50"
                  : "text-cyber-500 hover:text-gray-300"
              }`}
            >
              <UsersIcon size={14} />
              Users
            </button>
          </div>

          {/* Tab content - Keeping both mounted so they don't miss socket events */}
          <div className="flex-1 overflow-hidden relative">
            <div className={`absolute inset-0 ${activeTab === TABS.CHAT ? 'block' : 'hidden'}`}>
              <Chat socket={socket} roomId={roomId} initialMessages={initialMessages} />
            </div>
            <div className={`absolute inset-0 ${activeTab === TABS.USERS ? 'block' : 'hidden'}`}>
              <Users users={roomUsers} roomId={roomId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
