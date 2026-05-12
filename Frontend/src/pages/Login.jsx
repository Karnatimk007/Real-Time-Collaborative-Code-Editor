import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

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

    await login({ email, password }); // no need for success check
  };

  return (
    <div className="flex min-h-full w-full">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-black via-gray-900 to-purple-900 items-center justify-center p-6">
        <div className="bg-black/40 text-green-400 p-4 rounded-lg w-full max-w-md font-mono text-sm shadow-lg">
{`import { authenticate } from "./codesync-core";

async function loginUser(credentials) {
  const { user } = await authenticate({
    email: credentials.email,
    token: "****"
  });

  if (user) return redirect("/dashboard");
}`}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 w-80 bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20"
        >

          <h2 className="text-2xl font-bold text-center text-white">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-white/20 text-white placeholder-white outline-none"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-white/20 text-white placeholder-white outline-none"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition">
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;