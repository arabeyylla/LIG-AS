import { useState } from "react";
import { ArrowLeft, ChevronDown, User, Mail, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // Ensure this path is correct
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

export default function SignUp() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Unified State for Form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "Learner" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOAuth = async (provider) => {
    try {
      setLoading(true);
      setError(null);

      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/learner`,
        },
      });
    } catch (err) {
      console.error("OAuth sign-up failed:", err?.message || err);
      setError(`OAuth with ${provider} failed. If this provider isn't configured in Supabase, enable it in the dashboard.`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSignUp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  // 1. Check for password mismatch before calling the API
  if (formData.password !== formData.confirmPassword) {
    const mismatchMsg = "Passwords do not match.";
    console.error("[SignUp Error]: Verification failed", mismatchMsg);
    setError(mismatchMsg);
    setLoading(false);
    return;
  }

  // 2. Pre-flight log (Optional: remove in production)
  console.log("[SignUp Attempt]: Initializing registration for", formData.email);

  const { data, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        role: formData.role,
      },
    },
  });

  if (authError) {
    // 3. Log the specific Supabase error
    console.error("[SignUp Error]: Supabase Auth failed", {
      message: authError.message,
      status: authError.status,
      code: authError.code
    });
    
    setError(authError.message);
    setLoading(false);
  } else {
    // 4. Log Success
    console.log("[SignUp Success]: User created successfully", data.user?.id);
    setLoading(false);
    setShowSuccessModal(true);
  }
};

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

      {/* RIGHT SIDE: Form Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="mb-8 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer group">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-gray-500 mt-2">Enter your profile details.</p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">First Name</label>
                <input name="firstName" type="text" onChange={handleChange} placeholder="Juan" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Last Name</label>
                <input name="lastName" type="text" onChange={handleChange} placeholder="Dela Cruz" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm" required />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 text-left">Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <User size={18} />
                </span>
                <input 
                  name="username" // This must match your formData key exactly
                  type="text" 
                  value={formData.username}
                  onChange={handleChange} 
                  placeholder="Tactical handle (e.g. LigasHero)" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-sm" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors"><Mail size={18} /></span>
                <input name="email" type="email" onChange={handleChange} placeholder="email@example.com" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
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
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm</label>
                <div className="relative group">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Account Type</label>
              <div className="relative group">
                <select 
                  name="role"
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-gray-50 cursor-pointer appearance-none transition-all shadow-sm" 
                >
                  <option value="Learner">Student User</option>
                  <option value="Educator">Educator / Faculty</option>
                  <option value="Admin">System Admin</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] mt-2 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "SIGN UP"}
            </button>

            {/* OAuth provider circles BELOW signup */}
            <div className="pt-3">
              <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                or sign up with
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={loading}
                  className="w-10 h-10 rounded-full border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center transition-all active:scale-[0.98]"
                  aria-label="Sign up with Google"
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
                  aria-label="Sign up with Yahoo"
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
                  aria-label="Sign up with Microsoft"
                  title="Microsoft"
                >
                  <img
                    alt="Microsoft"
                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
          </form>

          <p className="mt-10 text-center text-gray-500">
            Already have an account?{" "} 
            <span onClick={() => navigate("/login")} className="text-orange-500 font-bold cursor-pointer hover:underline">
              Log In
            </span>
          </p>
          
        </div>
      </div>
      {/* SUCCESS MODAL OVERLAY */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1120]/90 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-300">
            
            {/* Decorative Shard in Modal */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[5rem] -z-10"></div>
            
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              REGISTRATION <span className="text-orange-500">COMPLETE</span>
            </h3>
            
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Your tactical profile has been created. Please check <span className="text-slate-900 font-bold">{formData.email}</span> to verify your account.
            </p>

            <button 
              onClick={() => navigate("/login")}
              className="w-full bg-[#0a1120] hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95"
            >
              GO TO LOGIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}