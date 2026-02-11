import React from 'react';
import { ShieldCheck, Smartphone, History, AlertTriangle, ChevronRight } from 'lucide-react';
import BackButton from "../components/ui/BackButton";

export default function AccountSecurity() {
  return (
    <div className="max-w-6xl mx-auto py-2">
      <BackButton />
      <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-10">Security Protocols</h1>
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800">Security Strength: High</h3>
              <p className="text-sm text-slate-500 font-bold">Your account is fortified against unauthorized access.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
          {[
            { icon: <Smartphone />, title: "Two-Factor Authentication", desc: "Add phone verification.", status: "Active", color: "text-blue-500" },
            { icon: <History />, title: "Login History", desc: "Review recent access.", status: "View Logs", color: "text-slate-400" },
          ].map((item, idx) => (
            <button key={idx} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 text-left">
              <div className="flex items-center gap-5">
                <div className="text-slate-400">{item.icon}</div>
                <div>
                  <h4 className="font-black text-slate-800">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}