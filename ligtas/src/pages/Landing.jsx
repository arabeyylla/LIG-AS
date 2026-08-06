import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import FeedbackForm from "../components/FeedbackForm";
import React, { useState, useEffect } from 'react';
import Landingpage from "../assets/LIGTAS Landing.png";
import game from "../assets/game.png";
import failed from "../assets/failed.png";
import { Link } from 'react-router-dom';
import { Gamepad2, Users, Trophy, ChevronRight, AlertTriangle, ChevronLeft, Shield, MapPin, Flame, Droplets } from "lucide-react";
import { supabase } from '../lib/supabase';
import { trackPageVisit } from '../lib/analytics';

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState(null);

  const defaultImages = [
    { url: Landingpage, title: "RPG Exploration" },
    { url: game, title: "Survival Mechanics" },
    { url: failed, title: "Crisis Management" }
  ];
  const gameImages = galleryImages && galleryImages.length > 0 ? galleryImages : defaultImages;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % gameImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? gameImages.length - 1 : prev - 1));

  useEffect(() => { const i = setInterval(() => setCurrentSlide((p) => (p + 1) % gameImages.length), 5000); return () => clearInterval(i); }, [gameImages.length]);
  useEffect(() => { trackPageVisit('home'); }, []);
  useEffect(() => { if (!supabase) return; supabase.from('gallery').select('url, caption').order('uploaded_at', { ascending: false }).then(({ data }) => { if (data?.length) setGalleryImages(data.map(d => ({ url: d.url, title: d.caption || 'LIG+AS' }))); }); }, []);
  useEffect(() => {
    if (!supabase) { setAnnouncementLoading(false); return; }
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(1).single()
      .then(({ data, error }) => { if (!error || error.code === 'PGRST116') setLatestAnnouncement(data || null); })
      .finally(() => setAnnouncementLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-blue-900/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 80%)' }}></div>
        <div className="absolute inset-0 bg-black/20" style={{ clipPath: 'polygon(0 100%, 100% 60%, 100% 100%)' }}></div>
        <div className="absolute inset-0 bg-blue-400/5" style={{ clipPath: 'polygon(40% 0, 60% 0, 40% 100%, 20% 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[10%] text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tighter">
            Survive the Disaster.<br />
            <span className="text-orange-500">Master the Simulation.</span>
          </h1>
          <p className="mt-6 sm:mt-8 text-base sm:text-xl lg:text-2xl text-gray-500 max-w-4xl mx-auto font-medium leading-relaxed">
            LIG<span className="text-orange-500">+</span>AS is a localized low-poly simulation designed to build muscle memory for disaster survival.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
            <Link to="/download" className="bg-orange-500 hover:bg-orange-600 px-8 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg lg:text-xl shadow-lg shadow-orange-950/40 transition-all hover:-translate-y-1 text-center">Download Game</Link>
            <Link to="/about" className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-8 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all text-center">Learn More</Link>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Carousel */}
            <div className="relative group">
              <div className="relative h-[280px] sm:h-[400px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-2xl lg:rounded-[2.5rem] shadow-2xl border-4 lg:border-8 border-gray-100">
                {gameImages.map((img, i) => (
                  <div key={i} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}>
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-10">
                      <p className="text-white font-black text-base sm:text-xl lg:text-2xl uppercase tracking-tighter">{img.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={prevSlide} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:bg-orange-500 hover:text-white transition-all z-20" aria-label="Previous"><ChevronLeft size={22} /></button>
              <button onClick={nextSlide} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:bg-orange-500 hover:text-white transition-all z-20" aria-label="Next"><ChevronRight size={22} /></button>
              <div className="flex justify-center gap-2 mt-5">
                {gameImages.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? "bg-orange-500 w-8" : "bg-gray-300"}`} aria-label={`Slide ${i + 1}`} />))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs lg:text-sm font-black uppercase tracking-widest">The LIG+AS Experience</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                Not Just a Game. <br /><span className="text-orange-500">A Survival Lifeline.</span>
              </h2>
              <p className="text-gray-500 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
                Step into a low-poly simulation where every choice dictates your survival. LIG+AS blends traditional disaster education with immersive localized storytelling.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-5 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2 text-sm sm:text-base lg:text-lg">Localized Maps</h4>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500">Simulations based on similar Philippine geography and layout.</p>
                </div>
                <div className="p-5 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2 text-sm sm:text-base lg:text-lg">Disaster Physics</h4>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500">Realistic fire spread, flood levels, and structural earthquake damage.</p>
                </div>
              </div>
              <Link to="/about" className="flex items-center gap-3 font-black text-slate-800 hover:text-orange-500 transition-colors group text-sm sm:text-base lg:text-lg">
                LEARN MORE ABOUT THE GAME <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DISASTER TYPES */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gray-100">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Simulated Disasters</h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-lg lg:text-xl">Train for the scenarios that matter most in the Philippines.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <Flame size={28} />, title: "Fire", desc: "Navigate through burning structures and learn evacuation protocols.", color: "red" },
              { icon: <Droplets size={28} />, title: "Flood", desc: "Escape rising water levels and find safe elevated ground.", color: "blue" },
              { icon: <AlertTriangle size={28} />, title: "Earthquake", desc: "React to structural damage and practice Drop-Cover-Hold.", color: "orange" },
              { icon: <MapPin size={28} />, title: "Typhoon", desc: "Secure your environment and evacuate before the storm hits.", color: "teal" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center mb-5 mx-auto`}>
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm lg:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Game Features</h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-lg lg:text-xl">Everything you need for disaster preparedness training.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-10">
            {[
              { icon: <Gamepad2 size={28} />, title: "Interactive Modules", desc: "Engage with realistic disaster simulations covering typhoons, earthquakes, fires, and floods.", color: "orange" },
              { icon: <Shield size={28} />, title: "Safety Training", desc: "Learn real-world emergency protocols through hands-on simulated experiences.", color: "blue" },
              { icon: <Trophy size={28} />, title: "Stage Progression", desc: "Progress through increasingly challenging levels and master survival skills step by step.", color: "green" },
            ].map((item, i) => (
              <div key={i} className={`bg-slate-50 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100`}>
                <div className={`w-14 h-14 lg:w-16 lg:h-16 bg-${item.color}-100 text-${item.color}-600 rounded-lg flex items-center justify-center mb-5 sm:mb-6`}>
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Announcements & Updates</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base lg:text-lg">Latest news from the LIG+AS team</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between md:col-span-2">
              <div>
                <div className="text-sm lg:text-base text-gray-400 mb-4">
                  {(latestAnnouncement?.category || 'System') + ' \u2022 ' + (latestAnnouncement?.created_at ? new Date(latestAnnouncement.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) : '\u2014')}
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3">{latestAnnouncement?.title || 'No announcements yet'}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 whitespace-pre-line">
                  {announcementLoading ? 'Loading...' : latestAnnouncement?.body || 'Check back later for the latest news and updates from the LIG+AS team.'}
                </p>
              </div>
              {latestAnnouncement && <span className="bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit">Latest</span>}
            </div>
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-4">Info \u2022 Always On</div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3">Stay Updated</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6">Game updates, patch notes, and important advisories are posted here by the LIG+AS admin team.</p>
              </div>
              <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit">Info</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="px-4 sm:px-8 lg:px-[15%]">
          <div className="border-3 border-orange-400 rounded-3xl p-8 sm:p-12 lg:p-16 text-center flex flex-col items-center">
            <AlertTriangle size={48} className="text-orange-500 mb-6 lg:w-16 lg:h-16" strokeWidth={1.5} />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 mb-4">Ready to Begin Your Training?</h2>
            <p className="text-gray-500 text-base sm:text-lg lg:text-xl mb-8">Download LIG+AS and build life-saving skills through simulation.</p>
            <Link to="/download" className="bg-orange-500 hover:bg-orange-600 text-white px-8 sm:px-10 py-4 rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-lg shadow-orange-200 transition-all hover:-translate-y-1">Download Now</Link>
          </div>
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="px-4 sm:px-8 lg:px-[20%]">
          <FeedbackForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
