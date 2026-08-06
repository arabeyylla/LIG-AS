import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-200 py-10 lg:py-14">
      <div className="px-4 sm:px-8 lg:px-[5%]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tighter">
              LIG<span className="text-orange-500">+</span>AS
            </h3>
            <p className="text-gray-500 text-sm lg:text-base mt-2">
              A localized low-poly disaster survival simulation.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Pages</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-500 hover:text-orange-500 text-sm lg:text-base transition-colors">About the Game</Link>
              <Link to="/how-to-play" className="block text-gray-500 hover:text-orange-500 text-sm lg:text-base transition-colors">How to Play</Link>
              <Link to="/team" className="block text-gray-500 hover:text-orange-500 text-sm lg:text-base transition-colors">Team</Link>
              <Link to="/faq" className="block text-gray-500 hover:text-orange-500 text-sm lg:text-base transition-colors">FAQ</Link>
              <Link to="/download" className="block text-gray-500 hover:text-orange-500 text-sm lg:text-base transition-colors">Download</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Project</h4>
            <p className="text-gray-500 text-sm lg:text-base">
              LIG+AS is a capstone project focused on disaster preparedness education through gamified simulation.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-sm lg:text-base">&copy; 2026 LIG+AS. All rights reserved.</p>
          <Link to="/admin/login" className="text-xs lg:text-sm text-gray-400 hover:text-orange-500 transition-colors">Admin Panel</Link>
        </div>
      </div>
    </footer>
  );
}
