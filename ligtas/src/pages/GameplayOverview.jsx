import React from 'react';
import Navbar from "../components/layout/Navbar";
import { 
  Gamepad2, ShieldCheck, MapPin, 
  Wind, Zap, Flame, Move, ChevronRight 
} from "lucide-react";

export default function GameplayOverview() {
  const mechanics = [
    { 
      icon: <Wind className="text-blue-500" />, 
      title: "Stage-Based Adventure", 
      desc: "Progress through increasingly difficult levels, each representing a unique disaster zone—from navigating a shaking classroom to escaping a flooded street." 
    },
    { 
      icon: <Flame className="text-orange-500" />, 
      title: "Objective-Driven Action", 
      desc: "Complete specific survival tasks to unlock the next level. Every stage challenges you to find exit points, rescue trapped items, and reach the finish line safely." 
    },
    { 
      icon: <Move className="text-green-500" />, 
      title: "Precision Navigation", 
      desc: "Learn to identify 'safe-zones' and 'hazard corridors' in high-stress urban layouts." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a1120] text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            TRAIN FOR THE <span className="text-orange-500">UNEXPECTED.</span>
          </h1>
          <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">
            LIG+AS turns survival and emergency training into a game. Master the skills that save lives in a safe, simulated environment.
          </p>
        </div>
      </section>

      {/* --- MECHANICS GRID --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {mechanics.map((item, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-all group">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- GAMEPLAY LOOP SECTION --- */}
      <section className="py-24 bg-white text-slate-900 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                The Survival <br />
                <span className="text-orange-500 text-6xl italic">Progression.</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { step: "01", label: "MISSION BRIEF", sub: "View your objectives before the timer starts." },
                  { step: "02", label: "NAVIGATE & EXPLORE", sub: "Traverse the level, avoiding environmental hazards and solving movement-based puzzles to find the safe path." },
                  { step: "03", label: "CLEAR STAGE", sub: "Complete the objectives and advance to the next level." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-orange-500 font-black text-2xl">{s.step}</span>
                    <div>
                      <h4 className="font-black text-xl">{s.label}</h4>
                      <p className="text-gray-500">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-slate-100 rounded-[3rem] p-10 aspect-square flex items-center justify-center border-4 border-slate-200 shadow-inner">
              <div className="text-center">
                <Gamepad2 size={120} className="text-slate-300 mb-6 mx-auto animate-bounce" />
                <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Interactive Simulation Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <footer className="py-20 text-center">
        <h3 className="text-3xl font-black mb-8">READY TO BECOME A COMMANDER?</h3>
        <button 
          onClick={() => window.location.href = "/signup"}
          className="bg-orange-500 px-12 py-5 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all hover:scale-105"
        >
          CREATE ACCOUNT
        </button>
      </footer>
    </div>
  );
}