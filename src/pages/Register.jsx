
import { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    // Name validation (letters and spaces only)
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
    <div className="flex justify-center mt-10">

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-80 bg-gray-100 p-6 rounded"
      >

        <h2 className="text-2xl font-bold text-center">
          Register
        </h2>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <input
          type="text"
          placeholder="Name"
          className="p-2 border rounded"
          value={name}
          minLength={5}
          required
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        
        />

        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          required
          minLength={3}
          onChange={(e) => setPassword(e.target.value)}
        />
<button className="bg-red-400 text-white p-2 rounded hover:bg-red-500">
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;
