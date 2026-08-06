import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Users, Code, Palette, Gamepad2, BookOpen, GraduationCap } from "lucide-react";
import { trackPageVisit } from '../lib/analytics';

const teamMembers = [
  {
    name: "Member 1",
    role: "Project Lead / Developer",
    description: "Oversees project direction, system architecture, and core game logic implementation.",
    icon: <Code size={24} />,
    color: "orange",
  },
  {
    name: "Member 2",
    role: "Game Designer / 3D Artist",
    description: "Designs game levels, creates low-poly 3D assets, and handles visual storytelling.",
    icon: <Palette size={24} />,
    color: "blue",
  },
  {
    name: "Member 3",
    role: "Frontend Developer",
    description: "Builds the web platform, handles UI/UX design, and integrates backend services.",
    icon: <Gamepad2 size={24} />,
    color: "green",
  },
  {
    name: "Member 4",
    role: "Researcher / QA",
    description: "Conducts disaster preparedness research, writes educational content, and tests gameplay.",
    icon: <BookOpen size={24} />,
    color: "purple",
  },
];

const colorMap = {
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
};

export default function Team() {
  useEffect(() => { trackPageVisit('team'); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-blue-900/10" style={{ clipPath: 'polygon(0 0, 50% 0, 30% 100%, 0 100%)' }}></div>
        <div className="absolute inset-0 bg-white/5" style={{ clipPath: 'polygon(100% 0, 100% 40%, 70% 100%, 50% 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[10%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            The Team
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
            Meet the <span className="text-orange-500">Creators</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            The people behind LIG+AS — a dedicated team building disaster preparedness tools through game-based learning.
          </p>
        </div>
      </section>

      {/* TEAM MEMBERS */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[5%]">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Our Team</h2>
            <p className="text-gray-500 mt-3 text-lg">Each member brings unique skills to make LIG+AS possible.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => {
              const colors = colorMap[member.color];
              return (
                <div key={index} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all text-center group">
                  {/* Avatar Placeholder */}
                  <div className={`w-20 h-20 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    {member.icon}
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-800 mb-1">{member.name}</h3>
                  <p className={`text-xs font-bold uppercase tracking-wider ${colors.text} mb-4`}>{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.description}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Replace "Member 1-4" with actual team member names and photos.
          </p>
        </div>
      </section>

      {/* PROJECT CONTEXT */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-100">
        <div className="px-4 sm:px-8 lg:px-[10%]">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest">
                About the Project
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                A Capstone Project with Real-World Impact
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  LIG+AS was developed as a capstone project with the goal of addressing the gap in disaster preparedness education in the Philippines through interactive, technology-driven learning.
                </p>
                <p>
                  The project combines game development, educational research, and web technologies to create an accessible tool that can reach a wide audience — from students to community members.
                </p>
                <p>
                  By gamifying disaster survival training, LIG+AS makes critical safety knowledge engaging and memorable, moving beyond traditional pamphlets and lectures.
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Project Details</h3>
                  <p className="text-sm text-gray-400">Academic & Technical Overview</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Type</span>
                  <span className="text-sm font-black text-slate-800">Capstone Project</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Platform</span>
                  <span className="text-sm font-black text-slate-800">Android (APK)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Game Engine</span>
                  <span className="text-sm font-black text-slate-800">Unity 3D</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Web Stack</span>
                  <span className="text-sm font-black text-slate-800">React + Supabase</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Focus Area</span>
                  <span className="text-sm font-black text-slate-800">Disaster Preparedness</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-bold text-gray-500">Target Users</span>
                  <span className="text-sm font-black text-slate-800">Students & Communities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="px-4 sm:px-8 lg:px-[15%] text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Want to Try Our Game?</h2>
          <p className="text-gray-500 text-lg mb-8">
            Download LIG+AS and experience what our team has built.
          </p>
          <Link to="/download" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all hover:-translate-y-1">
            Download LIG+AS
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
