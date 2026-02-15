import React, { useState, useEffect } from 'react';
import { Camera, User, Save, Key, Lock, EyeOff, Trash2, Mail, Fingerprint, Loader2, AlertTriangle, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import BackButton from "../components/ui/BackButton";
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // 'profile' or 'password'

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "Learner",
    initials: ""
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const meta = user.user_metadata || {};
      setFormData({
        firstName: meta.first_name || "",
        lastName: meta.last_name || "",
        username: meta.username || "",
        email: user.email || "",
        role: meta.role || "Learner",
        initials: (meta.first_name?.[0] || "U") + (meta.last_name?.[0] || "")
      });
    }
    setLoading(false);
  }

  // --- STEP 1: OPEN MODAL ---
  const triggerVerify = (actionType) => {
    if (actionType === 'password' && newPassword.length < 8) {
      return alert("New password must be at least 8 characters.");
    }
    setPendingAction(actionType);
    setShowVerifyModal(true);
  };

  // --- STEP 2: VERIFY AND EXECUTE ---
  const handleFinalUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // 1. Re-authenticate user to verify they know current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: verifyPassword,
    });

    if (signInError) {
      alert("Verification Failed: Incorrect password.");
      setUpdating(false);
      return;
    }

    // 2. Perform the actual update based on which button was clicked
    let updatePayload = {};
    if (pendingAction === 'profile') {
      updatePayload = {
        data: { 
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username 
        }
      };
    } else if (pendingAction === 'password') {
      updatePayload = { password: newPassword };
    }

    const { error: updateError } = await supabase.auth.updateUser(updatePayload);

    if (updateError) {
      alert("Update Error: " + updateError.message);
    } else {
      triggerSuccess(pendingAction === 'profile' ? "Intel Synchronized" : "Security Key Rotated");
      resetVerification();
      if (pendingAction === 'password') setNewPassword("");
      fetchProfile(); // Refresh UI data
    }
    setUpdating(false);
  };

  const resetVerification = () => {
    setShowVerifyModal(false);
    setVerifyPassword("");
    setPendingAction(null);
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-[1500px] mx-auto py-2 px-4 relative">
      <BackButton />
      
      {/* SUCCESS TOAST */}
      {successMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={24} /> {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-10 mt-4">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* PROFILE INFO COLUMN */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
            <div className="bg-[#0f172a] p-12 text-center relative">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
              <div className="w-32 h-32 bg-orange-100 rounded-[2.5rem] border-4 border-[#0f172a] flex items-center justify-center text-4xl font-black text-orange-600 mx-auto shadow-2xl uppercase">
                {formData.initials}
              </div>
              <p className="text-white font-black mt-4 text-xl tracking-tight">{formData.firstName} {formData.lastName}</p>
            </div>

            <div className="p-10 lg:p-14 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold text-slate-700 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (ReadOnly)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="email" value={formData.email} readOnly className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold text-slate-700 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold text-slate-700 outline-none transition-all" />
                </div>
              </div>
              
              <button onClick={() => triggerVerify('profile')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-orange-500 transition-all active:scale-[0.98]">
                <Save size={20} /> SYNCHRONIZE PROFILE
              </button>
            </div>
          </div>
        </div>

        {/* PASSWORD COLUMN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
            <h1 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-3">
              <Key className="text-orange-500" size={20} /> Credentials
            </h1>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 chars" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPassword ? <ShieldCheck size={18} className="text-orange-500" /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[12px] text-orange-700 leading-relaxed font-bold italic">Verification required after clicking update.</p>
              </div>
              <button onClick={() => triggerVerify('password')} disabled={!newPassword} className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black hover:bg-orange-500 transition-all disabled:opacity-50">
                ROTATE PASSWORD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION POPUP MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={resetVerification} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">
              <X size={24} />
            </button>
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Security Verification</h2>
            <p className="text-slate-500 font-bold text-sm mb-8">
              Please enter your <span className="text-slate-800">Current Password</span> to authorize this action.
            </p>
            
            <form onSubmit={handleFinalUpdate} className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  autoFocus
                  type="password" 
                  placeholder="Current Password" 
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-orange-100 focus:border-orange-500 rounded-2xl font-bold outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={updating}
                className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : "VERIFY & SAVE CHANGES"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}