// src/components/ui/BackButton.jsx
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function BackButton() {
  const navigate = useNavigate();

  const handleBack = async () => {
    // 1. Get the current user session
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. Determine the role (defaulting to learner)
    const role = user?.user_metadata?.role || "Learner";
    
    // 3. Map roles to your actual routes
    const paths = {
      Admin: "/admin",
      Educator: "/educator",
      Learner: "/learner"
    };

    // 4. Navigate to the correct path
    // If the role is "Admin", it goes to "/admin". 
    // If it's anything else/missing, it goes to "/learner".
    navigate(paths[role] || "/learner");
  };

  return (
    <button 
      onClick={handleBack} 
      className="flex items-center gap-2 text-slate-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors group"
    >
      <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:border-orange-100 group-hover:bg-orange-50 transition-all">
        <ArrowLeft size={14} />
      </div>
      Back to Dashboard
    </button>
  );
}