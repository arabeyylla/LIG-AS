import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-8xl mx-auto px-15 py-4 flex justify-between items-center">
        
        <h1 className="text-2xl font-black tracking-tighter text-[#1e293b]">
          LIG<span className="text-orange-500">+</span>AS
        </h1>

        <div className="flex gap-6 items-center">
          <Link to="/login" className="text-gray-700 hover:text-orange-500">
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
}
