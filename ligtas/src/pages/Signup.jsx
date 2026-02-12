import { useState } from "react";
import { ArrowLeft, ChevronDown, User, Mail, Lock, ShieldCheck } from "lucide-react"; 

export default function SignUp() {
  const [role, setRole] = useState("student");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      
      {/* LEFT SIDE: Inverted Stealth Poly Pattern (Matches Login Geometry) */}
      <div className="hidden md:flex md:w-1/2 bg-[#0a1120] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-black/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <div className="absolute inset-0 bg-white/[0.03]" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}></div>
        <div className="absolute inset-0 bg-blue-900/10" style={{ clipPath: 'polygon(100% 100%, 100% 40%, 40% 100%)' }}></div>
        <div className="absolute inset-0 bg-black/40" style={{ clipPath: 'polygon(100% 0, 60% 0, 100% 20%)' }}></div>

        <div className="relative z-10 text-center">
          <h1 className="text-7xl font-black tracking-tighter text-white mb-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
            LIG<span className="text-orange-500">+</span>AS
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-sm drop-shadow-md">
            Join the simulation. <br/> Start your survival journey.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Equal Split Form Area */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-8 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">Create Account</h2>
            <p className="text-gray-500 mt-2">Enter your tactical details.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Names Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">First Name</label>
                <input type="text" placeholder="Juan" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Last Name</label>
                <input type="text" placeholder="Dela Cruz" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" required />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input type="email" placeholder="email@example.com" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" required />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <User size={18} />
                </span>
                <input type="text" placeholder="Choose username" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" required />
              </div>
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" required />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Access Level</label>
              <div className="relative group">
                <select 
                  className="w-full p-4 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-gray-50 focus:bg-white cursor-pointer appearance-none transition-all shadow-sm" 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student User</option>
                  <option value="educator">Educator / Faculty</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-orange-500" size={20} />
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-100 transition-all active:scale-[0.98] cursor-pointer mt-2">
              SIGN UP
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500">
            Already have an account?{" "} 
            <span onClick={() => window.location.href = "/login"} className="text-orange-500 font-bold cursor-pointer hover:underline">
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}