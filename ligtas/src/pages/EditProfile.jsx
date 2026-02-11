import React from 'react';
import { Camera, User, GraduationCap, Save, Key, Lock, EyeOff } from 'lucide-react';
import BackButton from "../components/ui/BackButton";

export default function EditProfile() {
  return (
    <div className="max-w-[1500px] mx-auto py-2 px-4">
      <BackButton />
      
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Account Settings</h1>
        <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-4 py-2 rounded-full tracking-widest uppercase">
          Profile Intel & Security
        </span>
      </div>

      {/* Changed to items-stretch to ensure children match height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Profile Info */}
        <div className="lg:col-span-2">
          <div className="h-full bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col">
            {/* Avatar Header */}
            <div className="bg-[#0f172a] p-12 text-center relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
              </div>
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-orange-100 rounded-[2.5rem] border-4 border-[#0f172a] flex items-center justify-center text-4xl font-black text-orange-600 shadow-2xl">
                  MJ
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-orange-500 text-white rounded-2xl border-4 border-[#0f172a] hover:scale-110 transition-transform shadow-lg">
                  <Camera size={18} />
                </button>
              </div>
              <p className="text-white font-black mt-4 text-xl tracking-tight">Jasver Dela Cruz</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Lvl 12 Learner</p>
            </div>

            {/* Form Fields - flex-grow ensures this area fills the card */}
            <div className="p-10 lg:p-14 space-y-8 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" defaultValue="Jasver Dela Cruz" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold text-slate-700 transition-all outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" defaultValue="2024-008821" readOnly className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed outline-none" />
                  </div>
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-orange-500 transition-all shadow-lg active:scale-[0.98]">
                <Save size={20} /> UPDATE PERSONAL INTEL
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Change Password */}
        <div className="lg:col-span-1">
          {/* h-full and flex flex-col makes the card match the left column height */}
          <div className="h-full bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                <Key size={24} />
              </div>
              <div>
                <h1 className="font-black text-slate-800 text-lg tracking-tight">Credentials</h1>
                <p className="text-[13px] text-slate-400 font-bold uppercase">Update your password</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="password" placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="password" placeholder="Min. 8 characters" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold outline-none transition-all" />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                    <EyeOff size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[12px] text-orange-700 leading-relaxed font-bold">
                  TIP: Use a combination of letters, numbers, and tactical symbols to strengthen your key.
                </p>
              </div>
            </div>

            {/* Submit button at the bottom of the card */}
            <button className="w-full mt-8 bg-[#0f172a] text-white py-5 rounded-2xl font-black hover:bg-orange-500 transition-all shadow-lg active:scale-[0.98]">
              CONFIRM CHANGE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}