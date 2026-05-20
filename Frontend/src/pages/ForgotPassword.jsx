import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authServices";
import { Loader2 } from "lucide-react";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await forgotPassword({ email });
      setSuccess("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
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
            <span className="mockup-title">recover_password.ts</span>
          </div>
          <div className="mockup-body">
            <pre><code>
<span className="keyword">import</span> {"{"} sendOTP, resetAuth {"}"} <span className="keyword">from</span> <span className="string">"./codesync-core"</span>;

<span className="keyword">async function</span> <span className="function">recoverAccount</span>(email) {"{"}
  <span className="keyword">await</span> <span className="function">sendOTP</span>(email);
  <span className="keyword">const</span> success = <span className="keyword">await</span> <span className="function">resetAuth</span>(email, otp, newPass);
  
  <span className="keyword">if</span> (success) <span className="keyword">return</span> <span className="function">redirect</span>(<span className="string">"/login"</span>);
{"}"}
            </code></pre>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="split-right">
        <div className="form-container">
          <div>
            <h2 className="form-title">Password Recovery</h2>
            <p className="form-subtitle">
              {step === 1 
                ? "Enter your email to receive a recovery code" 
                : "Enter the code sent to your email and your new password"}
            </p>
          </div>

          {error && (
            <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#fca5a5", borderRadius: "8px", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: "0.75rem", backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", color: "#86efac", borderRadius: "8px", fontSize: "0.875rem" }}>
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  className="input-field"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4 flex justify-center items-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label className="form-label">6-Digit OTP</label>
                <input
                  type="text"
                  placeholder="123456"
                  className="input-field"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4 flex justify-center items-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Remember your password? <Link to="/login" style={{ color: "var(--accent-primary)" }}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
