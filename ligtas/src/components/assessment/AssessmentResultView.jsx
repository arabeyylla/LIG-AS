import { CheckCircle2, RotateCcw, ArrowRight, BarChart3, LayoutGrid } from 'lucide-react';
import { CONFIDENCE_LABELS, percentOf, getFeedback } from '../../lib/assessmentScoring';

/**
 * Shown right after a successful submission. For a Post-Assessment it also
 * compares against this device's cached Pre-Assessment for the SAME category
 * (`localResults` comes from lib/assessmentLocalStore.js).
 */
export default function AssessmentResultView({ result, category, localResults, onRetake, onAnotherCategory, onGoToPost, onGoToResults }) {
  const percent = percentOf(result.score, result.total);
  const feedback = getFeedback(percent);
  const confidenceLabel = CONFIDENCE_LABELS[result.confidence - 1];

  const priorPre = result.type === 'post' ? localResults?.results?.[category.id]?.pre : null;
  const delta = priorPre ? percent - percentOf(priorPre.score, priorPre.total) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
      <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
      <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">
        <span aria-hidden="true">{category.emoji}</span> {category.label}
      </p>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
        {result.type === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'} Complete!
      </h2>
      <p className="text-gray-500 text-sm font-bold mb-8">Your response has been recorded. Thank you!</p>

      <div className="inline-flex flex-col items-center bg-slate-50 rounded-2xl px-10 py-6 mb-6">
        <span className="text-5xl font-black text-orange-500">{percent}%</span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
          {result.score} / {result.total} correct
        </span>
      </div>

      <p className="text-lg font-black text-slate-800 mb-1">{feedback.label}</p>
      <p className="text-gray-500 text-sm font-medium max-w-md mx-auto mb-6">{feedback.message}</p>

      <div className="inline-block bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full mb-8">
        Self-rated confidence: {result.confidence}/5 — {confidenceLabel}
      </div>

      {delta !== null && (
        <div
          className={`mb-8 p-4 rounded-xl text-sm font-bold ${
            delta > 0 ? 'bg-green-50 text-green-600' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
          }`}
        >
          {delta > 0 && `You improved by ${delta} percentage points in ${category.label} since your Pre-Assessment! 🎉`}
          {delta < 0 && `Your ${category.label} score changed by ${delta} percentage points since your Pre-Assessment.`}
          {delta === 0 && `Your ${category.label} score is the same as your Pre-Assessment.`}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
        {result.type === 'pre' ? (
          <button
            onClick={onGoToPost}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200"
          >
            Play LIG+AS, then take the Post-Assessment <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={onGoToResults}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200"
          >
            <BarChart3 size={16} /> View Results
          </button>
        )}
        <button
          onClick={onAnotherCategory}
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
        >
          <LayoutGrid size={16} /> Another category
        </button>
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
        >
          <RotateCcw size={16} /> Retake this assessment
        </button>
      </div>
    </div>
  );
}
