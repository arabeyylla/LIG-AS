import { X, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Detail drawer for a single `assessment_results` row (one disaster
 * module's worth of a submission). `siblingRows` are the other module rows
 * from the same attempt (same identifier + assessment_type + created_at) —
 * pass them so the admin can see the full attempt, not just this module.
 */
export default function AssessmentDetailModal({ row, siblingRows = [], onClose }) {
  if (!row) return null;
  const percent = row.total_questions ? Math.round((row.score / row.total_questions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 sm:px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800 text-lg">{row.identifier}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {row.assessment_type === 'pre-assessment' ? 'Pre-Assessment' : 'Post-Assessment'} &middot; {row.disaster_module}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors flex-shrink-0" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-3">
            <Stat label="Module Score" value={`${row.score}/${row.total_questions} (${percent}%)`} />
            <Stat label="Confidence" value={row.likert_preparedness_rating ? `${row.likert_preparedness_rating}/5` : '—'} />
            <Stat label="Submitted" value={new Date(row.created_at).toLocaleString()} />
          </div>

          {siblingRows.length > 1 && (
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Full attempt breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {siblingRows.map((s) => (
                  <div key={s.id} className={`p-3 rounded-xl text-center ${s.id === row.id ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{s.disaster_module}</p>
                    <p className="text-sm font-black text-slate-800 mt-1">{s.score}/{s.total_questions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Question-by-question responses</p>
            {!row.answers_payload || row.answers_payload.length === 0 ? (
              <p className="text-sm font-bold text-slate-400">No detailed response data recorded.</p>
            ) : (
              <div className="space-y-3">
                {row.answers_payload.map((qa, idx) => (
                  <div
                    key={qa.questionId || idx}
                    className={`p-4 rounded-xl border ${qa.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}
                  >
                    <div className="flex items-start gap-2">
                      {qa.isCorrect ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      ) : (
                        <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{qa.question}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Answered: {qa.selectedText ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl px-4 py-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}
