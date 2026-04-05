import { useState } from "react";
import { ArrowLeft, User, Lock, Loader2, Eye, EyeOff, ChevronDown } from "lucide-react"; 
import { supabase } from "../lib/supabaseClient";
import { createLog } from "../lib/logger";
import { useNavigate } from "react-router-dom";

function ProviderIcon({ label, color, bg = "#ffffff" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" rx="6" fill={bg} stroke={color} strokeWidth="2" />
      <text
        x="10"
        y="14"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={color}
        fontFamily="Arial, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Learner");

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
    console.error("[Login Error]: Authentication failed", authError);
    setError("Invalid credentials.");
    setLoading(false);
    return;
  }

  // 3. Fetch profile role from database (source of truth)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    console.warn("[Login]: Profile fetch failed, using metadata fallback", profileError);
  }

  const userRole = profile?.role || data.user?.user_metadata?.role || "Learner";
  console.log("[Login Success]: User verified. Role from profile:", userRole);

  createLog("User logged in", data.user?.email ?? null);

  // 4. Enforce role selection to avoid cross-role access
  if (userRole !== selectedRole) {
    await supabase.auth.signOut();
    setError(
      `Account type mismatch. This profile is "${userRole}". Please select "${userRole}" and try again.`
    );
    setLoading(false);
    return;
  }

  // 5. Role-based redirect (paths match App.jsx routes)
  const rolePath =
    selectedRole === "Admin"
      ? "/admin"
      : selectedRole === "Educator"
      ? "/educator"
      : "/learner";
  setLoading(false);
  navigate(rolePath);
};

  const handleOAuth = async (provider) => {
    try {
      setError(null);
      setLoading(true);

      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Use /learner as a safe landing page; ProtectedRoute will route to the right dashboard.
          redirectTo: `${window.location.origin}/learner`,
        },
      });
    } catch (err) {
      console.error("OAuth sign-in failed:", err?.message || err);
      setError(`OAuth with ${provider} failed. If this provider isn't configured in Supabase, enable it in the dashboard.`);
      setLoading(false);
    }
  };

  const handleForgetPassword = async () => {
    setResetSent(false);
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }

    try {
      setResetting(true);
      const redirectTo = `${window.location.origin}/login`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (resetError) throw resetError;

      setResetSent(true);
    } catch (err) {
      console.error("Reset password failed:", err?.message || err);
      setError("Failed to send reset link. Please try again.");
    } finally {
      setResetting(false);
    }
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
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Account Type</label>
              <div className="relative group">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-4 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-gray-50 cursor-pointer appearance-none transition-all shadow-sm"
                >
                  <option value="Learner">Student User</option>
                  <option value="Educator">Educator / Faculty</option>
                  <option value="Admin">System Admin</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <User size={18} />
              </span>
              <input
                type="text" // Changed from email to text
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleForgetPassword}
                  disabled={resetting || loading}
                  className="text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  {resetting ? "Sending..." : "forgot password?"}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "LOGIN"}
            </button>

            {/* OAuth provider circles below login */}
            <div className="pt-2">
              <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                or sign in using
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={loading}
                  className="w-10 h-10 rounded-full border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center transition-all active:scale-[0.98]"
                  aria-label="Continue with Google"
                  title="Google"
                >
                  <img
                    alt="Google"
                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Google_Logo.svg"
                    className="w-5 h-5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth("yahoo")}
                  disabled={loading}
                  className="w-10 h-10 rounded-full border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center transition-all active:scale-[0.98]"
                  aria-label="Continue with Yahoo"
                  title="Yahoo"
                >
                  <img
                    alt="Yahoo"
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Yahoo!_(2019).svg"
                    className="w-5 h-5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth("azure")}
                  disabled={loading}
                  className="w-10 h-10 rounded-full border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center transition-all active:scale-[0.98]"
                  aria-label="Continue with Microsoft"
                  title="Microsoft"
                >
                  <img
                    alt="Microsoft"
                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                    className="w-5 h-5"
                  />
                </button>
              </div>

              {resetSent && (
                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-teal-600">
                    Reset link sent. Check your email.
                  </span>
                </div>
              )}
            </div>
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