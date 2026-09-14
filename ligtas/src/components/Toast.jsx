import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * Small transient toast for async feedback (e.g. "Assessment submitted!").
 * Auto-dismisses after `duration` ms; pass `onClose` to clear the toast
 * state in the parent. Usage:
 *
 *   const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
 *   {toast && <Toast {...toast} onClose={() => setToast(null)} />}
 */
export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(onClose, duration);
    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const isError = type === 'error';

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm text-white transition-all duration-300 ${
        isError ? 'bg-red-500' : 'bg-slate-900'
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      {isError ? <AlertCircle size={18} className="flex-shrink-0" /> : <CheckCircle2 size={18} className="flex-shrink-0 text-orange-400" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors flex-shrink-0" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
