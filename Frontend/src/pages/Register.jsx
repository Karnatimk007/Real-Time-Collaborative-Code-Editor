import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authServices";
import { toast } from "sonner";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(username)) {
      setError("Name should contain only letters");
      toast.error("Invalid username", {
        description: "Name should contain only letters.",
      });
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser({ username, email, password });
      toast.success("Account created successfully!", {
        description: "Please login with your credentials.",
      });
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      toast.error("Registration failed", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout">
      {/* LEFT SIDE */}


      {/* RIGHT SIDE */}
      <div className="split-center m-auto p-10">
        <form onSubmit={handleRegister} className="form-container">
          <div>
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Start your journey with the world's best coding community.</p>
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              {error}
            </div>
          )}

          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              placeholder="johndoe"
              className="input-field"
              value={username}
              minLength={3}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="input-field"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              required
              minLength={3}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button disabled={loading} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            {loading ? "Registering..." : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--accent-primary)" }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;