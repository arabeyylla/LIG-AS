import React from 'react';
import { Key, Lock, Eye } from 'lucide-react';

export default function ChangePassword() {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6">
          <Key size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Update Credentials</h1>
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="password" placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="password" placeholder="Min. 8 characters" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none" />
          </div>
        </div>
        <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-orange-500 transition-all shadow-lg mt-4">
          CONFIRM KEY CHANGE
        </button>
      </div>
    </div>
  );
}