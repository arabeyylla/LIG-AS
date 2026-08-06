import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Flame, Droplets, AlertTriangle, MapPin, 
  Gamepad2, Shield, Target, Zap, 
  ChevronRight, Globe, BookOpen, Heart 
} from "lucide-react";
import Landingpage from "../assets/LIGTAS Landing.png";
import game from "../assets/game.png";
import failed from "../assets/failed.png";
import { trackPageVisit } from '../lib/analytics';

export default function About() {
  useEffect(() => { trackPageVisit('about'); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-blue-900/10" style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 70%)' }}></div>
        <div className="absolute inset-0 bg-white/5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 70% 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[15%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs lg:text-sm font-black uppercase tracking-widest mb-6">About the Game</div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
            A Game Built to <span className="text-orange-500">Save Lives.</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto font-medium leading-relaxed">
            LIG+AS is a localized low-poly disaster simulation game designed to train players in survival decision-making during emergencies common in the Philippines.
          </p>
        </div>
      </section>

      {/* GAME OVERVIEW */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-6">
                What is LIG<span className="text-orange-500">+</span>AS?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg">
                <p>LIG+AS (Laro Interaktibo para sa Gabay at Ahensya ng Seguridad) is an interactive mobile game that simulates real-world disaster scenarios found in the Philippine context. It uses a low-poly 3D art style to create immersive environments where players must make quick survival decisions.</p>
                <p>The game takes players through progressively challenging stages, each representing a different disaster scenario. Players navigate through environments, identify hazards, locate safe zones, and practice proper emergency responses.</p>
                <p>Unlike traditional classroom-based disaster education, LIG+AS creates muscle memory through repeated simulated experiences — helping players react instinctively when real emergencies occur.</p>
              </div>
              <Link to="/how-to-play" className="inline-flex items-center gap-3 mt-8 font-black text-orange-500 hover:text-orange-600 transition-colors group text-sm sm:text-base lg:text-lg">
                LEARN HOW TO PLAY <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-100">
                <img src={Landingpage} alt="LIG+AS gameplay" className="w-full h-[250px] sm:h-[350px] lg:h-[450px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-orange-500 text-white p-4 lg:p-6 rounded-2xl shadow-xl">
                <Gamepad2 size={28} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISASTER TYPES */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-100">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Disaster Scenarios</h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-lg lg:text-xl max-w-3xl mx-auto">
              Each disaster type is modeled after real conditions in the Philippines, with accurate hazard behavior and proper survival protocols.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <Flame size={28} />, title: "Fire", sub: "Structure & Urban Fire", desc: "Navigate through burning residential and commercial structures. Fire spreads dynamically based on materials and ventilation. Players learn crawl-under-smoke, exit identification, and fire extinguisher protocols.", tags: ["Smoke Navigation", "Exit Routes", "Stop-Drop-Roll"], color: "red" },
              { icon: <Droplets size={28} />, title: "Flood", sub: "Flash & Rising Water", desc: "Escape rising floodwater in urban and suburban environments. Water levels increase in real-time. Players learn to identify high ground, avoid submerged hazards, and understand current dangers.", tags: ["Elevation Awareness", "Current Avoidance", "Signal for Help"], color: "blue" },
              { icon: <AlertTriangle size={28} />, title: "Earthquake", sub: "Seismic Activity & Structural Collapse", desc: "React to sudden seismic events in classrooms, offices, and outdoor areas. Structures crack and collapse dynamically. Players practice Drop-Cover-Hold and evacuation after tremors subside.", tags: ["Drop-Cover-Hold", "Aftershock Safety", "Open Area Evacuation"], color: "orange" },
              { icon: <MapPin size={28} />, title: "Typhoon", sub: "Storm Surge & Strong Winds", desc: "Prepare for and survive incoming typhoons. Secure loose objects, board windows, and evacuate to designated shelters before the storm intensifies.", tags: ["Preparation Phase", "Shelter-in-Place", "Evacuation Timing"], color: "teal" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-5 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center`}>{item.icon}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-bold">{item.sub}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base lg:text-lg">{item.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag, j) => (<span key={j} className={`px-3 py-1 bg-${item.color}-50 text-${item.color}-600 text-xs sm:text-sm font-bold rounded-lg`}>{tag}</span>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAME WORLD */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-100">
                <img src={game} alt="LIG+AS game world" className="w-full h-[250px] sm:h-[350px] lg:h-[450px] object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">The Game World</h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg">
                LIG+AS features low-poly 3D environments modeled after common Philippine settings — residential barangays, school buildings, commercial areas, and coastal communities.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Globe size={20} />, title: "Localized Environments", desc: "Maps designed based on typical Philippine geography, architecture, and urban planning.", color: "orange" },
                  { icon: <Zap size={20} />, title: "Dynamic Hazards", desc: "Disasters evolve in real-time — fire spreads, water rises, structures weaken progressively.", color: "blue" },
                  { icon: <Target size={20} />, title: "Objective-Driven Levels", desc: "Each stage has clear survival objectives that teach specific emergency response protocols.", color: "green" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-${item.color}-100 text-${item.color}-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>{item.icon}</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm sm:text-base lg:text-lg">{item.title}</h4>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#0a1120] text-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tighter">Why LIG+AS Matters</h2>
            <p className="text-gray-400 mt-3 text-sm sm:text-lg lg:text-xl max-w-3xl mx-auto">The Philippines is one of the most disaster-prone countries in the world. Preparedness saves lives.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <Shield size={28} />, title: "Builds Muscle Memory", desc: "Repeated simulation creates instinctive responses during real emergencies, reducing panic and hesitation.", color: "orange" },
              { icon: <BookOpen size={28} />, title: "Gamified Education", desc: "Learning through gameplay is more engaging and retentive than traditional lecture-based disaster training.", color: "blue" },
              { icon: <Heart size={28} />, title: "Community Impact", desc: "A prepared individual contributes to a more resilient community — reducing casualties and enabling faster recovery.", color: "red" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 sm:p-8 lg:p-10 rounded-2xl text-center">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 bg-${item.color}-500/20 text-${item.color}-400 rounded-xl flex items-center justify-center mb-5 mx-auto`}>{item.icon}</div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black mb-3">{item.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm lg:text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="px-4 sm:px-8 lg:px-[15%] text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-4">Experience It Yourself</h2>
          <p className="text-gray-500 text-base sm:text-lg lg:text-xl mb-8">Download the game and start training for real disaster scenarios.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/download" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-all hover:-translate-y-1">Download LIG+AS</Link>
            <Link to="/how-to-play" className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-10 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all">How to Play</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
