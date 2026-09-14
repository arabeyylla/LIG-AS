import { AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * Styled replacement for window.confirm(). Controlled component — render it
 * once per page and drive it with the useConfirm() hook rather than using
 * this directly. See src/hooks/useConfirm.jsx.
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${danger ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
          {danger ? <AlertTriangle size={26} /> : <HelpCircle size={26} />}
        </div>
        <h3 id="confirm-dialog-title" className="text-lg font-black text-slate-800 mb-2">{title}</h3>
        {message && <p className="text-sm font-medium text-slate-500 mb-7 leading-relaxed">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`flex-1 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all ${
              danger ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
