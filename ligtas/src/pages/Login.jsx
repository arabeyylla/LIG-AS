import { useState } from "react";
import { ArrowLeft, ChevronDown, User, Lock, Loader2 } from "lucide-react"; 
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  let loginEmail = email; 

  // 1. Log the start of the process
  console.log("[Login Attempt]: Initiating for identity:", email);

  // Check if input is a username or email
  if (!email.includes("@")) {
    console.log("[Login Debug]: Input detected as username. Fetching associated email...");
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email') 
      .eq('username', email)
      .single();

    if (profileError || !profile) {
      console.error("[Login Error]: Username resolution failed", profileError);
      setError("Username not found.");
      setLoading(false);
      return;
    }

    loginEmail = profile.email;
    console.log("[Login Debug]: Username resolved to:", loginEmail);
  }

  // 2. Attempt Supabase Login
  console.log("[Login Attempt]: Authenticating with Supabase...");
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  if (authError) {
    console.error("[Login Error]: Authentication failed", {
      message: authError.message,
      status: authError.status
    });
    setError("Invalid credentials.");
    setLoading(false);
    return;
  }

  // 3. Log Success and Role Redirection
  const userRole = data.user?.user_metadata?.role || "Learner";
  console.log("[Login Success]: User verified. Role:", userRole);
  
  setLoading(false);
  navigate(`/${userRole.toLowerCase()}`);
};

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      
      {/* LEFT SIDE:*/}
      <div className="hidden md:flex md:w-1/2 bg-[#0a1120] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-blue-900/10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <div className="absolute inset-0 bg-black/30" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}></div>
        <div className="relative z-10 text-center">
          <h1 className="text-7xl font-black tracking-tighter text-white mb-4">
            LIG<span className="text-orange-500">+</span>AS
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-sm">Master the simulation.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/")}
            className="mb-8 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Access your training modules.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Updated Input Label & Placeholder */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username or Email</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <User size={18} />
              </span>
              <input
                type="text" // Changed from email to text
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "LOGIN"}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500">
            Don't have an account?{" "}
            <span 
              onClick={() => navigate("/signup")}
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