import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/about", label: "About" },
    { to: "/how-to-play", label: "How to Play" },
    { to: "/team", label: "Team" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow">
      <div className="px-4 sm:px-8 lg:px-[5%] py-4 flex justify-between items-center">
        
        <Link to="/" className="text-2xl lg:text-3xl font-black tracking-tighter text-[#1e293b]">
          LIG<span className="text-orange-500">+</span>AS
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 lg:gap-8 items-center text-sm lg:text-base font-bold">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-gray-700 hover:text-orange-500 transition-colors">
              {link.label}
            </Link>
          ))}
          <Link
            to="/download"
            className="bg-orange-500 text-white px-5 py-2.5 lg:px-6 lg:py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Download
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-orange-500 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block py-3 px-4 rounded-xl text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-all">
              {link.label}
            </Link>
          ))}
          <Link to="/download" onClick={() => setMobileOpen(false)} className="block py-3 px-4 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 text-center transition-colors">
            Download
          </Link>
        </div>
      )}
    </nav>
  );
}
