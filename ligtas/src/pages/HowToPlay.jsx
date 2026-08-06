import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Move, Target, ChevronRight, Gamepad2, 
  Eye, Clock, Shield, Lightbulb, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Smartphone, Hand, RotateCcw
} from "lucide-react";
import { trackPageVisit } from '../lib/analytics';

export default function HowToPlay() {
  useEffect(() => { trackPageVisit('how-to-play'); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-orange-500/5" style={{ clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[10%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Player Guide
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
            How to <span className="text-orange-500">Play</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need to know to get started with LIG+AS — from basic controls to advanced survival strategies.
          </p>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Controls & Movement</h2>
            <p className="text-gray-500 mt-3 text-lg">LIG+AS uses intuitive mobile controls designed for quick reaction.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Control Diagram */}
            <div className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Smartphone className="text-orange-500" size={24} />
                <h3 className="font-black text-slate-800 text-lg">Mobile Controls</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Hand size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Virtual Joystick</h4>
                    <p className="text-gray-500 text-sm">Left side of screen — drag to move your character in any direction.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Camera Control</h4>
                    <p className="text-gray-500 text-sm">Right side of screen — swipe to look around and survey your environment.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Interact Button</h4>
                    <p className="text-gray-500 text-sm">Tap the action button when near objects, doors, or safe zones to interact.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Move size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Sprint</h4>
                    <p className="text-gray-500 text-sm">Double-tap the joystick direction to sprint — use wisely as hazards require careful navigation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips for Controls */}
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900">Quick Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">1</div>
                  <p className="text-gray-600">Keep your thumb on the joystick at all times — stopping in a disaster zone can be fatal.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">2</div>
                  <p className="text-gray-600">Use the camera to scout ahead before committing to a path. Look for hazard indicators.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">3</div>
                  <p className="text-gray-600">The interact button glows when you're near an interactive object — don't miss it.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">4</div>
                  <p className="text-gray-600">Sprint only in clear areas. Running through smoke or near collapsing structures increases danger.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GAMEPLAY LOOP / STAGE PROGRESSION */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-100">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Stage Progression</h2>
            <p className="text-gray-500 mt-3 text-lg">Each level follows a structured survival loop.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm relative">
              <div className="absolute -top-4 left-10 bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-full">
                PHASE 1
              </div>
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6 mt-2">
                <Eye size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Mission Brief</h3>
              <p className="text-gray-600 leading-relaxed">
                Before the timer starts, you receive a mission briefing. This tells you what disaster you're facing, your objectives, and hints about the environment layout.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Read the disaster type</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Note your objectives</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Check the time limit</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm relative">
              <div className="absolute -top-4 left-10 bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-full">
                PHASE 2
              </div>
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6 mt-2">
                <Move size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Navigate & Survive</h3>
              <p className="text-gray-600 leading-relaxed">
                The main gameplay phase. Move through the environment, avoid hazards, interact with objects, and complete your survival objectives before time runs out.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Identify safe paths</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Avoid environmental hazards</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Complete objectives</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm relative">
              <div className="absolute -top-4 left-10 bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-full">
                PHASE 3
              </div>
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6 mt-2">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Clear & Advance</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete all objectives and reach the designated safe zone. Your performance is evaluated, and you unlock the next stage with a harder scenario.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Reach the safe zone</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> View performance summary</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-orange-500" /> Unlock next stage</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIVES SYSTEM */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                Objectives System
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Each stage has specific objectives that correspond to real emergency protocols. Completing objectives isn't just about winning — it's about learning the correct response.
              </p>
              
              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="text-orange-500" size={18} />
                    <h4 className="font-black text-slate-800 text-sm">Primary Objectives</h4>
                  </div>
                  <p className="text-gray-500 text-sm pl-8">Must be completed to clear the stage. Examples: reach the exit, activate the fire alarm, evacuate to high ground.</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-blue-500" size={18} />
                    <h4 className="font-black text-slate-800 text-sm">Time Pressure</h4>
                  </div>
                  <p className="text-gray-500 text-sm pl-8">Disasters don't wait. A countdown adds urgency and trains you to make quick decisions under stress.</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <RotateCcw className="text-green-500" size={18} />
                    <h4 className="font-black text-slate-800 text-sm">Retry & Improve</h4>
                  </div>
                  <p className="text-gray-500 text-sm pl-8">Failed? Retry the stage. Each attempt builds familiarity and improves your response time.</p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="bg-[#0a1120] rounded-[2.5rem] p-12 text-white">
              <h3 className="font-black text-lg mb-6 text-orange-400">Sample Objectives</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center text-xs font-black">1</div>
                  <span className="text-gray-300 text-sm">Find the nearest emergency exit</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center text-xs font-black">2</div>
                  <span className="text-gray-300 text-sm">Avoid smoke-filled corridors</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center text-xs font-black">3</div>
                  <span className="text-gray-300 text-sm">Crawl under smoke to reach the door</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center text-xs font-black">4</div>
                  <span className="text-gray-300 text-sm">Reach the assembly point outside</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
                <Clock size={14} /> Time Limit: 02:30
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SURVIVAL TIPS */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-100">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Pro Tips
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Survival Tips</h2>
            <p className="text-gray-500 mt-3 text-lg">Strategies to improve your performance and clear stages faster.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Eye size={20} />, title: "Scout First", tip: "Use the camera to look around before moving. Identify hazards and plan your route." },
              { icon: <Move size={20} />, title: "Keep Moving", tip: "Standing still in a disaster zone is dangerous. Keep your character moving toward objectives." },
              { icon: <Lightbulb size={20} />, title: "Read the Signs", tip: "Environmental cues like smoke direction, water flow, and cracks indicate danger zones." },
              { icon: <Clock size={20} />, title: "Manage Time", tip: "Don't rush blindly. Plan your path but don't waste time — the clock is always ticking." },
              { icon: <RotateCcw size={20} />, title: "Learn from Failure", tip: "Every failed attempt teaches you the layout. Use that knowledge on your next try." },
              { icon: <Shield size={20} />, title: "Prioritize Safety", tip: "Sometimes the shortest path is the most dangerous. A longer safe route is better than a risky shortcut." },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="font-black text-slate-800 mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="px-4 sm:px-8 lg:px-[15%] text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to Start?</h2>
          <p className="text-gray-500 text-lg mb-8">
            Download LIG+AS and put these skills to the test.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/download" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all hover:-translate-y-1">
              Download LIG+AS
            </Link>
            <Link to="/about" className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-10 py-4 rounded-2xl font-bold text-lg transition-all">
              About the Game
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
