import { useState } from "react";

function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = (e)=>{
    e.preventDefault();

    const loginData = {
      email,
      password
    };

    console.log(loginData);
  };

  return (
    <div className="flex justify-center mt-10">

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-80 bg-gray-100 p-6 rounded"
      >

        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="bg-red-400 text-white p-2 rounded">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;