import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      toast.success("Welcome back!", {
        description: "Logged in successfully.",
      });
    } else {
      toast.error("Login failed", {
        description: "Invalid email or password.",
      });
    }
  };

  return (
    <div className="split-layout">
      {/* LEFT SIDE */}
  

      {/* RIGHT SIDE */}
      <div className="align-center m-auto">
        <form onSubmit={handleLogin} className="form-container">
          <div>
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Enter your credentials to access your workspace</p>
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="alex@company.com"
              className="input-field"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ color: "var(--accent-primary)", fontSize: "0.875rem" }}>Forgot password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Login →
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--accent-primary)" }}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;