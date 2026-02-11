import { useState } from "react";
import { ArrowLeft, ChevronDown, User, Lock } from "lucide-react"; 

export default function Login() {
  const [role, setRole] = useState("student");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      
      {/* LEFT SIDE: Darkened Stealth Poly Pattern */}
      <div className="hidden md:flex md:w-1/2 bg-[#0a1120] relative overflow-hidden items-center justify-center p-12">
        
        {/* Base Midnight Layer */}
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        
        {/* Stealth Shard 1: Deep Navy Plate */}
        <div 
          className="absolute inset-0 bg-blue-900/10" 
          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        ></div>
        
        {/* Stealth Shard 2: Diamond Center (Shadow Definition) */}
        <div 
          className="absolute inset-0 bg-black/30" 
          style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
        ></div>

        {/* Stealth Shard 3: Bottom Right Deep Focus */}
        <div 
          className="absolute inset-0 bg-blue-500/5" 
          style={{ clipPath: 'polygon(100% 100%, 100% 40%, 40% 100%)' }}
        ></div>

        {/* Stealth Shard 4: Sharp Accent (Very Low Opacity) */}
        <div 
          className="absolute inset-0 bg-white/5" 
          style={{ clipPath: 'polygon(100% 0, 60% 0, 100% 20%)' }}
        ></div>

        {/* Branding Overlay */}
        <div className="relative z-10 text-center">
          <h1 className="text-7xl font-black tracking-tighter text-white mb-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
            LIG<span className="text-orange-500">+</span>AS
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-sm drop-shadow-md">
            Master the simulation. <br/> Prepare for the real world.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Clean White Form Area */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            className="mb-8 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Access your training modules.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href=`/${role}`; }} className="space-y-5">
            
            {/* Username Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Your username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm"
                  required
                />
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
                  <option value="admin">System Administrator</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-100 transition-all active:scale-[0.98] cursor-pointer">
              LOGIN
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500">
            Don't have an account?{" "}
            <span 
              onClick={() => window.location.href = "/signup"}
              className="text-orange-500 font-bold cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}