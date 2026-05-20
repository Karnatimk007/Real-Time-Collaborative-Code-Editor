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
      <div className="split-left">
        <div className="code-mockup card">
          <div className="mockup-header">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="mockup-title">auth_service.ts</span>
          </div>
          <div className="mockup-body">
            <pre><code>
<span className="keyword">import</span> {"{"} authenticate {"}"} <span className="keyword">from</span> <span className="string">"./codesync-core"</span>;

<span className="keyword">async function</span> <span className="function">loginUser</span>(credentials) {"{"}
  <span className="keyword">const</span> {"{"} user {"}"} = <span className="keyword">await</span> <span className="function">authenticate</span>({"{"}
    email: credentials.email,
    token: <span className="string">"****"</span>
  {"}"});

  <span className="keyword">if</span> (user) <span className="keyword">return</span> <span className="function">redirect</span>(<span className="string">"/dashboard"</span>);
{"}"}
            </code></pre>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="split-right">
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