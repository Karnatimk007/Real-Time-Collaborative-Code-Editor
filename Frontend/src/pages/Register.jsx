import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { registerUser } from "../services/authServices";
import { toast } from "sonner";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

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
      navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login");
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
 <div className="split-left">
        <div className="code-mockup">
          <div className="mockup-header">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="mockup-title">create_account.js</span>
          </div>
          <div className="mockup-body">
            <pre><code>
<span className="keyword">import</span> {"{"} CodeSync {"}"} <span className="keyword">from</span> <span className="string">'@codesync/core'</span>;

<span className="keyword">const</span> session <span className="operator">=</span> <span className="keyword">await</span> CodeSync.<span className="function">createSession</span>({"{"}
  projectId: <span className="string">'global-collab'</span>,
  features: [<span className="string">'pair-programming'</span>, <span className="string">'live-chat'</span>]
{"}"});

session.<span className="function">on</span>(<span className="string">'userJoin'</span>, (user) <span className="operator">=&gt;</span> {"{"}
  <span className="object">console</span>.<span className="function">log</span>(<span className="string">`User `</span> + user.name + <span className="string">` joined`</span>);
{"}"});
            </code></pre>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="split-right">
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
            Already have an account? <Link to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"} style={{ color: "var(--accent-primary)" }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;