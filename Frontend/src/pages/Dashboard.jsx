import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createRoom, validateRoom } from "../services/authServices";
import { toast } from "sonner";

const extractRoomId = (value) => {
  const input = value.trim();
  const codingRoomMatch = input.match(/\/codingroom\/(\d{6})(?:\b|[/?#])/i);
  if (codingRoomMatch) return codingRoomMatch[1];

  const standaloneMatch = input.match(/^\d{6}$/);
  if (standaloneMatch) return standaloneMatch[0];

  return "";
};

function Dashboard() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const createNewRoom = async () => {
    setError("");
    setCreating(true);
    try {
      const res = await createRoom({ language: "javascript", maxParticipants: 5, password: password || undefined });
      toast.success("Room created successfully", {
        description: `Room ID: ${res.data.roomId}`,
      });
      navigate(`/codingroom/${res.data.roomId}`, { state: { password } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create room";
      setError(errorMsg);
      toast.error("Failed to create room", {
        description: errorMsg,
      });
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    const parsedRoomId = extractRoomId(roomId);
    if (!parsedRoomId) {
      const errorMsg = "Enter a valid 6-digit room ID or invite link";
      setError(errorMsg);
      toast.error("Invalid room invite", {
        description: errorMsg,
      });
      return;
    }

    setError("");
    setJoining(true);
    try {
      await validateRoom(parsedRoomId, { password: password || undefined });
      toast.success("Joined room successfully", {
        description: "Connected to collaborative session.",
      });
      navigate(`/codingroom/${parsedRoomId}`, { state: { password } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to join room";
      setError(errorMsg);
      toast.error("Failed to join room", {
        description: errorMsg,
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 2rem", flex: 1 }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>Dashboard</h1>

      {error && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#fca5a5", borderRadius: "8px", marginBottom: "2rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        {/* Create Room */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Create New Room</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Start a new collaborative session</p>

          <input
            type="password"
            placeholder="Password (if protected)"
            className="input-field"
            style={{ marginBottom: "1rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={createNewRoom}
            disabled={creating}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {creating ? "Creating..." : "Create Room →"}
          </button>
        </div>

        {/* Join Room */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Join Existing Room</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Enter a room ID or paste an invite link</p>

          <input
            type="text"
            placeholder="Room ID or invite link"
            className="input-field"
            style={{ marginBottom: "1rem" }}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (if protected)"
            className="input-field"
            style={{ marginBottom: "1rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={joinRoom}
            disabled={joining}
            className="btn btn-outline"
            style={{ width: "100%" }}
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
