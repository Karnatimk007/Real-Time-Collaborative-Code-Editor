import { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(name)) {
      setError("Name should contain only letters");
      return;
    }

    setError("");

    const userData = {
      name,
      email,
      password
    };

    console.log(userData);
  };

  return (
    <div className="flex h-screen w-full">

      {/* LEFT SIDE (Design Panel) */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-black via-gray-900 to-purple-900 items-center justify-center p-6">

        <div className="text-white text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            CodeSync
          </h1>
          <p className="text-gray-400">
            Build, collaborate and code in real-time with your team.
          </p>
        </div>

      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-black">

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-4 w-80 bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20"
        >

          <h2 className="text-2xl font-bold text-center text-white">
            Register
          </h2>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <input
            type="text"
            placeholder="Name"
            className="p-2 border rounded bg-white/20 text-white placeholder-white outline-none"
            value={name}
            minLength={5}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded bg-white/20 text-white placeholder-white outline-none"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 border rounded bg-white/20 text-white placeholder-white outline-none"
            value={password}
            required
            minLength={3}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-blue-400 text-white p-2 rounded hover:bg-blue-500">
            Register
          </button>

        </form>

      </div>

    </div>
  );
}

export default Register