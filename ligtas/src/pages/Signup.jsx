export default function Signup() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        <input type="text" placeholder="Full Name" className="w-full mb-4 p-2 border rounded" />
        <input type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded" />
        <input type="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" />

        <button className="w-full bg-orange-500 text-white py-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
}
