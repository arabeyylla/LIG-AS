// src/components/ui/BackButton.jsx
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate("/student")} 
      className="flex items-center gap-2 text-slate-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors group"
    >
      <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:border-orange-100 group-hover:bg-orange-50 transition-all">
        <ArrowLeft size={14} />
      </div>
      Back to Dashboard
    </button>
  );
}