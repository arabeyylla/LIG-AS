import { useState } from "react";

export default function Login() {
  const [role, setRole] = useState("student");

  const handleLogin = (e) => {
    e.preventDefault();
    window.location.href = `/${role}`;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
        />

        <select
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="educator">Educator</option>
          <option value="admin">Admin</option>
        </select>

        <button className="w-full bg-orange-500 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

