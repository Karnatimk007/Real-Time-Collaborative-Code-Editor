import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { API } from "../services/apis";
import { motion } from "framer-motion";
import { Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function JoinRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(true);
  const [roomValidated, setRoomValidated] = useState(false);

  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!currentUser) {
      navigate(`/login?redirect=/join-room/${roomId}`);
    }
  }, [currentUser, navigate, roomId]);

  // Validate room and check if password protected
  useEffect(() => {
    if (!currentUser) return;

    const validateRoom = async () => {
      try {
        setValidating(true);
        setError(null);

        // Call validate endpoint to check room status
        const response = await API.post(`/room/validate/${roomId}`, {
          password: "",
        });

        // Room validated successfully
        setRoomValidated(true);
        setIsProtected(response.data.payload?.isProtected || false);

        // If not password protected, auto-join
        if (!response.data.payload?.isProtected) {
          toast.success("Success", {
            description: "Joining room...",
          });
          // Auto-join unprotected room
          navigate(`/codingroom/${roomId}`, {
            state: {
              password: "",
            },
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to validate room";
        
        // If password required, show form
        if (err.response?.status === 401 && err.response?.data?.isProtected) {
          setIsProtected(true);
          setRoomValidated(true);
        } else {
          setError(errorMessage);
          toast.error("Error", {
            description: errorMessage,
          });
        }
      } finally {
        setValidating(false);
      }
    };

    validateRoom();
  }, [currentUser, roomId, navigate]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate password if room is protected
      if (isProtected) {
        await API.post(`/room/validate/${roomId}`, {
          password,
        });
      }

      // Navigate to the coding room with password if needed
      navigate(`/codingroom/${roomId}`, {
        state: {
          password: isProtected ? password : "",
        },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to join room";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // If user is not authenticated, show loading
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-gray-300"
        >
          <Loader2 size={40} className="animate-spin text-neon-purple" />
          <p className="text-lg font-semibold">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  // Show loading while validating room
  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyber-900 via-purple-900/20 to-cyber-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-gray-300"
        >
          <Loader2 size={40} className="animate-spin text-neon-purple" />
          <p className="text-lg font-semibold">Validating room...</p>
        </motion.div>
      </div>
    );
  }

  // Show error if room validation failed
  if (error && !roomValidated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyber-900 via-purple-900/20 to-cyber-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-cyber-800 border border-cyber-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-b border-cyber-700">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle size={24} className="text-red-400" />
              <h1 className="text-2xl font-bold text-gray-100">Room Error</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyber-900 via-purple-900/20 to-cyber-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-cyber-800 border border-cyber-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-b border-cyber-700">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={24} className={isProtected ? "text-yellow-400" : "text-neon-green"} />
            <h1 className="text-2xl font-bold text-gray-100">Join Room</h1>
          </div>
          <p className="text-sm text-gray-400">
            You're invited to join room <span className="font-mono font-semibold text-neon-blue">#{roomId}</span>
          </p>
          {isProtected && (
            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
              <Lock size={14} />
              This room requires a password
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleJoin} className="space-y-5">
            {/* Current User Info */}
            <div className="p-4 bg-cyber-900 border border-cyber-600 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Joining as:</p>
              <p className="text-lg font-semibold text-neon-blue">
                {currentUser?.username || "Guest"}
              </p>
            </div>

            {/* Room ID Display */}
            <div className="p-4 bg-cyber-900 border border-cyber-600 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Room ID:</p>
              <p className="text-lg font-mono font-semibold text-gray-300">
                {roomId}
              </p>
            </div>

            {/* Password Input (shown if protected) */}
            {isProtected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock size={16} className="text-neon-purple" />
                  Room Password
                </label>
                <input
                  autoFocus
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cyber-900 border border-cyber-600 text-gray-200 rounded-lg outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 transition-all"
                  required={isProtected}
                />
              </motion.div>
            )}

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || (isProtected && !password)}
              className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Joining...
                </div>
              ) : (
                "Join Room"
              )}
            </motion.button>

            {/* Back to Dashboard */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full py-2 text-gray-400 hover:text-gray-200 font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-cyber-900 border-t border-cyber-700 text-center">
          <p className="text-xs text-gray-500">
            {isProtected
              ? "Please enter the password to join"
              : "Room is ready for joining"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
