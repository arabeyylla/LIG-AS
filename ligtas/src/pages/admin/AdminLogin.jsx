import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase is not configured. Add your VITE_SUPABASE_* keys to .env to enable login.');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login failed:", err.message);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      
      {/* LEFT SIDE */}
      <div className="hidden md:flex md:w-1/2 bg-[#0a1120] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-blue-900/10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <div className="absolute inset-0 bg-black/30" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
            LIG<span className="text-orange-500">+</span>AS
          </h1>
          <p className="text-gray-500 text-lg font-medium">Admin Control Panel</p>
          <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto">
            Authorized personnel only. Access the system dashboard to manage content and analytics.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center text-gray-400 hover:text-orange-500 transition-colors group">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Site
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Login</h2>
            <p className="text-gray-500 mt-2">Sign in to access the control panel.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ligtas.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

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
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-gray-400 text-center">
              Admin accounts are created in the Supabase dashboard. If you need access, contact the project administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
