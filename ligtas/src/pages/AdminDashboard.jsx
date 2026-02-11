import DashboardLayout from "../components/layout/DashboardLayout";

export default function AdminDashboard() {
    const modules = [
    { id: 1, title: "Module 1", subtitle: "The Basics", desc: "Go-Bag Preparation & First Aid", status: "completed", icon: <Briefcase size={22} />, color: "bg-teal-500" },
    { id: 2, title: "Module 2", subtitle: "Typhoon", desc: "Evacuation & Flood Safety", status: "in-progress", icon: <Wind size={22} />, color: "bg-orange-500" },
    { id: 3, title: "Module 3", subtitle: "Earthquake", desc: "Duck & Cover", status: "locked", icon: <Mountain size={22} />, color: "bg-gray-400" },
    { id: 4, title: "Module 4", subtitle: "Urban Fire", desc: "Fire Exits", status: "locked", icon: <Flame size={22} />, color: "bg-gray-400" },
  ];

  return (
    /* Note: No wrapper div with bg-colors here, the DashboardLayout handles that */
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      
      {/* LEFT SECTION: Mission Hub */}
      <div className="xl:col-span-3">
        <div className="bg-[#0f172a] rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <span className="bg-orange-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">Active Mission</span>
            <h1 className="text-4xl lg:text-5xl font-black mt-6 mb-4 leading-tight">Typhoon Signal #4</h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
              Evacuate the flooded streets of Barangay Burdi. Secure your survival kit and reach the checkpoint before nightfall.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex-1 w-full">
                <div className="flex justify-between text-xs font-bold uppercase mb-3">
                  <span className="text-orange-400">Survival Progress</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[45%] shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
                </div>
              </div>
              <button className="w-full md:w-auto bg-white text-[#0f172a] px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                <Download size={18} /> INITIALIZE APK
              </button>
            </div>
          </div>
        </div>

        {/* MISSION GRID */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-orange-500 rounded-full" />
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Mission Selection</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => (
              <div 
                key={m.id} 
                className={`group bg-white border-2 rounded-[2.5rem] p-6 flex items-start gap-6 transition-all hover:border-orange-500 hover:shadow-xl
                  ${m.status === 'in-progress' ? 'border-orange-500' : 'border-slate-100'}
                  ${m.status === 'locked' ? 'opacity-50 grayscale' : ''}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${m.color}`}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.title}</p>
                  <h4 className="font-black text-xl text-slate-800 leading-tight">{m.subtitle}</h4>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-1">{m.desc}</p>
                </div>
                <div className="self-center">
                  {m.status === 'completed' && <CheckCircle2 className="text-teal-500" size={28} />}
                  {m.status === 'locked' && <Lock className="text-slate-300" size={24} />}
                  {m.status === 'in-progress' && <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT RAIL: Stats and Ranking */}
      <div className="space-y-8">
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><TrendingUp size={24} /></div>
            <div>
              <p className="text-2xl font-black text-slate-800">5</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-2xl font-black text-slate-800">12</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Lives Saved</p>
            </div>
          </div>
        </div>

        {/* RANKING */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Class Ranking</h3>
          <div className="space-y-4">
            {[
              { rank: 1, name: "Maria S.", xp: "2,458", color: "text-yellow-500" },
              { rank: 2, name: "Pedro P.", xp: "2,119", color: "text-slate-400" },
              { rank: 3, name: "You", xp: "1,988", color: "text-orange-500", me: true }
            ].map((user) => (
              <div key={user.rank} className={`flex items-center justify-between p-4 rounded-2xl ${user.me ? 'bg-orange-50 ring-1 ring-orange-100' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <span className={`font-black text-lg ${user.color}`}>#0{user.rank}</span>
                  <span className="font-bold text-slate-700">{user.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{user.xp} <span className="text-[10px] text-slate-400">XP</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* TRAINING CODE */}
        <div className="bg-[#1e293b] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
           <div className="relative z-10">
              <h4 className="font-black text-lg mb-2">Join Training</h4>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">Enter tactical code.</p>
              <div className="flex gap-2">
                <input placeholder="CODE" className="bg-white/10 border-white/10 border rounded-xl px-4 py-3 text-sm flex-1 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button className="bg-orange-500 px-6 rounded-xl font-black text-xs hover:bg-orange-600 transition-colors">JOIN</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}