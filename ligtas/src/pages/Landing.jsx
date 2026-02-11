import Navbar from "../components/Navbar";
import { Gamepad2, Users, Trophy, ChevronRight, Bell, Info, Settings, AlertTriangle } from "lucide-react"; // Import icons

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Survive the Disaster.
            <br />
            <span className="text-orange-500">
              Master the Simulation.
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            LIG+AS is a localized RPG simulation designed to build muscle
            memory for disaster survival.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold cursor-pointer">
              Start Training
            </button>
            <button className="bg-white text-gray-900 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold cursor-pointer">
              Download APK
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES - Made wider with max-w-7xl and added icons */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-8xl mx-auto px-40">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          
          {/* Card 1 */}
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-6">
              <Gamepad2 size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 break-words hyphens-auto">Interactive Modules</h3>
            <p className="text-gray-600 leading-relaxed">
              Engage with realistic disaster simulations covering typhoons,
              earthquakes, fires, and floods.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 break-words hyphens-auto">Collaborative Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Join classes, compete with peers, and learn together with
              gamified progression.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
              <Trophy size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Track Progress</h3>
            <p className="text-gray-600 leading-relaxed">
              Earn badges, climb leaderboards, and monitor your disaster
              preparedness skills.
            </p>
          </div>

          </div>

        </div>
      </section>

      {/* DISASTER ADVISORIES & UPDATES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Disaster Advisories & Updates</h2>
              <p className="text-gray-500 mt-2">Latest announcements from the LIG+AS Command Center</p>
            </div>
            <a href="#" className="flex items-center text-orange-600 font-medium hover:underline">
              View Archive <ChevronRight size={18} className="ml-1" />
            </a>
          </div>

          {/* Advisories Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Advisory Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>System • JAN 15</span>
                </div>
                <h4 className="text-xl font-bold mb-3">Module 4: Urban Fire Released</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  The new simulation module covering fire exits and extinguisher usage is now available for all learners.
                </p>
              </div>
              <span className="bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit">
                New Content
              </span>
            </div>

            {/* Advisory Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Advisory • JAN 10</span>
                </div>
                <h4 className="text-xl font-bold mb-3">PAGASA Weather Alert</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Low pressure area spotted East of Surigao. Students are advised to review the Typhoon Preparedness module.
                </p>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit">
                Alert
              </span>
            </div>

            {/* Advisory Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Maintenance • JAN 05</span>
                </div>
                <h4 className="text-xl font-bold mb-3">Scheduled Server Maintenance</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Servers will be offline for optimization on Jan 20, 12:00 AM - 4:00 AM.
                </p>
              </div>
              <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit">
                System
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* RE-STYLED CTA SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="border border-orange-200 rounded-3xl p-16 text-center flex flex-col items-center">
            <div className="text-orange-500 mb-6">
              <AlertTriangle size={64} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Ready to Begin Your Training?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Join thousands of learners building life-saving skills through simulation.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 cursor-pointer">
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 bg-gray-200 text-gray-600">
        © 2026 LIG+AS. All rights reserved.
      </footer>
    </div>
  );
}