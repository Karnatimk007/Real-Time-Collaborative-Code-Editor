import { useState } from "react";

function Register() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = (e)=>{
    e.preventDefault();

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

        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="p-2 border rounded"
          onChange={(e)=>setName(e.target.value)}
        />

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
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;